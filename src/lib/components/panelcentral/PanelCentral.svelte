<!-- src/lib/components/panelcentral/PanelCentral.svelte -->
<script lang="ts">
  import { onMount } from "svelte";

  import { resetSimulation, stepSimulation } from "$lib/api/api";
  import type {
    SimulationSnapshot,
    SimulationConfig,
    ApiError,
    PlaneDTO,
    ClimaType,
  } from "$lib/types/api";
  import { DEFAULT_CONFIG, countPlanes } from "$lib/utils/model";

  import AirportMap from "$lib/components/panelcentral/AirportMap.svelte";
  import Topbar from "$lib/components/layout/Topbar.svelte";
  import Metrics from "$lib/components/panelcentral/Metrics.svelte";
  import TimeDisplay from "$lib/components/panelcentral/TimeDisplay.svelte";
  import WeatherEffects from "$lib/components/panelcentral/WeatherEffects.svelte";
  import FlightTable from "$lib/components/panelcentral/FlightTable.svelte";

  // ====================================================
  //  ESTADO BÁSICO
  // ====================================================
  let snapshot: SimulationSnapshot | null = null;
  let config: SimulationConfig = { ...DEFAULT_CONFIG };

  let loading = false;
  let error: string | null = null;

  // Auto–run (como el slider de FPS de Mesa)
  let autoRun = false;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let fps = 5; // Frames Per Second (0–20)

  // Clima actual (tipo + emoji equivalente a CLIMA_EMOJI de server.py)
  let climaTipo: ClimaType | "ninguno" = "ninguno";
  let climaEmoji: string = "❓";

  // ====================================================
  //  EMOJIS DE CLIMA (igual que en server.py)
  // ====================================================
  const CLIMA_EMOJI: Record<string, string> = {
    normal: "☀️",
    lluvia: "🌧️",
    tormenta: "⛈️",
    viento_fuerte: "💨",
    niebla: "🌫️",
    microburst: "🌀",
    ninguno: "⏹️",
  };

  // ====================================================
  //  HELPERS GENERALES
  // ====================================================
  function setErrorFrom(err: unknown, fallback: string) {
    const e = err as ApiError;
    error =
      (e && (e.detail as string)) || (e && (e.message as string)) || fallback;
  }

  // ====================================================
  //  LLAMADAS A LA API
  // ====================================================
  async function initSimulation() {
    loading = true;
    error = null;
    try {
      const data = await resetSimulation(config);
      snapshot = data;

      // Reiniciar series del gráfico al hacer reset
      resetChartSeries();
    } catch (err) {
      setErrorFrom(err, "Error al inicializar la simulación.");
    } finally {
      loading = false;
    }
  }

  async function handleReset() {
    stopAutoRun();
    await initSimulation();
  }

  async function handleStep() {
    if (!snapshot) return;
    loading = true;
    error = null;
    try {
      const data = await stepSimulation(1);
      snapshot = data;
    } catch (err) {
      setErrorFrom(err, "Error al avanzar la simulación.");
      stopAutoRun();
    } finally {
      loading = false;
    }
  }

  // ====================================================
  //  AUTO–RUN (equivalente a FPS slider de Mesa)
  // ====================================================
  function startAutoRun() {
    stopAutoRun();
    autoRun = true;
    const delay = fps > 0 ? Math.max(50, Math.round(1000 / fps)) : 500;
    intervalId = setInterval(() => {
      void handleStep();
    }, delay);
  }

  function stopAutoRun() {
    autoRun = false;
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function toggleAutoRun() {
    if (autoRun) {
      stopAutoRun();
    } else {
      startAutoRun();
    }
  }

  function handleFpsChange(event: Event) {
    const target = event.target as HTMLInputElement;
    fps = Number(target.value);
    if (autoRun) {
      startAutoRun();
    }
  }

  // ====================================================
  //  SERIES PARA MÉTRICAS (FORWARD A Metrics.svelte)
  // ====================================================
  let chartLabels: number[] = [];
  let dataLlegadas: number[] = [];
  let dataSalidas: number[] = [];
  let dataEnEspera: number[] = [];
  let dataEmergencias: number[] = [];
  let dataDesviados: number[] = [];

  let lastStepPlotted = -1;
  const MAX_POINTS = 100;

  function resetChartSeries() {
    chartLabels = [];
    dataLlegadas = [];
    dataSalidas = [];
    dataEnEspera = [];
    dataEmergencias = [];
    dataDesviados = [];
    lastStepPlotted = -1;
  }

  // IMPORTANTE: usar arrays nuevos para que Svelte detecte cambios
  function pushMetricsForSnapshot(s: SimulationSnapshot) {
    chartLabels = [...chartLabels, s.step];
    dataLlegadas = [...dataLlegadas, s.metrics.total_arrivals];
    dataSalidas = [...dataSalidas, s.metrics.total_departures];
    dataEnEspera = [...dataEnEspera, s.metrics.en_espera];
    dataEmergencias = [...dataEmergencias, s.metrics.emergencias];
    dataDesviados = [...dataDesviados, s.metrics.total_diverted];

    if (chartLabels.length > MAX_POINTS) {
      chartLabels = chartLabels.slice(-MAX_POINTS);
      dataLlegadas = dataLlegadas.slice(-MAX_POINTS);
      dataSalidas = dataSalidas.slice(-MAX_POINTS);
      dataEnEspera = dataEnEspera.slice(-MAX_POINTS);
      dataEmergencias = dataEmergencias.slice(-MAX_POINTS);
      dataDesviados = dataDesviados.slice(-MAX_POINTS);
    }
  }

  onMount(() => {
    void initSimulation();
    return () => {
      stopAutoRun();
    };
  });

  // ====================================================
  //  DERIVADOS REACTIVOS
  // ====================================================
  $: totalPlanes = snapshot ? countPlanes(snapshot.planes) : 0;

  $: climaTipo = snapshot ? snapshot.metrics.clima.tipo : "ninguno";
  $: climaEmoji = CLIMA_EMOJI[climaTipo] ?? "❓";

  $: desvioOn = snapshot ? snapshot.config.allow_diversion : false;

  // Cada vez que avanza el step, actualizamos las series para Metrics.svelte
  $: if (snapshot && snapshot.step !== lastStepPlotted) {
    lastStepPlotted = snapshot.step;
    pushMetricsForSnapshot(snapshot);
  }

  // CÁLCULO DE MÉTRICAS EXTRA (Aerolíneas + Combustible)
  let airlineNames: string[] = [];
  let airlineCounts: number[] = [];
  let avgFuel = 0;

  $: if (snapshot) {
    // Agrupar por aerolínea
    const counts: Record<string, number> = {};
    let totalFuel = 0;
    let planesWithFuel = 0;

    snapshot.planes.forEach((p) => {
      // Contar aerolínea
      const name = p.airline?.name || "Unknown";
      counts[name] = (counts[name] || 0) + 1;

      // Sumar combustible
      if (typeof p.combustible === "number") {
        totalFuel += p.combustible;
        planesWithFuel++;
      }
    });

    airlineNames = Object.keys(counts);
    airlineCounts = Object.values(counts);

    avgFuel = planesWithFuel > 0 ? totalFuel / planesWithFuel : 0;
  }

  // ====================================
  // TEMAS DINÁMICOS BASADOS EN TIEMPO
  // ====================================
  $: timePeriod = snapshot?.metrics.time?.period || "night";

  // Colores de tema según la hora
  const themes: Record<
    string,
    { bg: string; secondary: string; text: string }
  > = {
    morning: { bg: "#FFE5CC", secondary: "#FF9D5C", text: "#2C1810" }, // Amanecer naranja
    day: { bg: "#E8F4F8", secondary: "#4A90E2", text: "#0F2942" }, // Día azul claro
    evening: { bg: "#FFA07A", secondary: "#FF6347", text: "#3D1A0F" }, // Atardecer naranja-rojo
    night: { bg: "#020817", secondary: "#26C6DA", text: "#E4F4FF" }, // Noche oscuro
  };

  $: currentTheme = themes[timePeriod] || themes.night;
  $: bgColor = currentTheme.bg;
  $: textColor = currentTheme.text;
</script>

<!-- WRAPPER GENERAL (fondo global con tema dinámico) -->
<div
  class="min-h-screen overflow-x-hidden transition-colors duration-1000"
  style="background-color: {bgColor};"
>
  <!-- Weather effects overlay -->
  <WeatherEffects clima={climaTipo} />

  <!-- TOPBAR FIJO -->
  <Topbar />

  <!-- CONTENIDO PRINCIPAL (debajo del topbar fijo) -->
  <div class="pt-20 px-4 md:px-10 pb-10">
    <div
      class="flex flex-col md:flex-row gap-6 bg-[#071321] text-[#E4F4FF] rounded-2xl shadow-lg p-4 w-full max-w-6xl mx-auto border border-[#1F3A55] overflow-hidden"
    >
      <!-- =========================================
          LADO IZQUIERDO: CONTROLES
          ========================================= -->
      <aside class="w-full md:w-60 space-y-4 pt-2 shrink-0">
        <div>
          <label class="block text-sm font-semibold mb-1">Escenario</label>
          <select
            class="w-full rounded px-2 py-1 text-sm bg-[#020817] text-[#E4F4FF] border border-[#1F3A55] focus:outline-none focus:ring-1 focus:ring-[#26C6DA]"
            bind:value={config.scenario}
          >
            <option value="Equilibrio">Equilibrio</option>
            <option value="Normal">Normal</option>
            <option value="Sobrecarga">Sobrecarga</option>
            <option value="Libre">Modo Libre</option>
          </select>
        </div>

        <div class="space-y-1">
          <span class="block text-sm font-semibold">Permitir desvíos</span>
          <label class="inline-flex items-center gap-2 text-xs text-[#9FB9D8]">
            <input
              type="checkbox"
              class="accent-[#26C6DA]"
              bind:checked={config.allow_diversion}
            />
            <span>{config.allow_diversion ? "ON" : "OFF"}</span>
          </label>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">
            Clima fijo (override)
          </label>
          <select
            class="w-full rounded px-2 py-1 text-sm bg-[#020817] text-[#E4F4FF] border border-[#1F3A55] focus:outline-none focus:ring-1 focus:ring-[#26C6DA]"
            bind:value={config.clima_manual}
          >
            <option value="ninguno">ninguno</option>
            <option value="normal">normal</option>
            <option value="lluvia">lluvia</option>
            <option value="tormenta">tormenta</option>
            <option value="viento_fuerte">viento_fuerte</option>
            <option value="niebla">niebla</option>
            <option value="microburst">microburst</option>
          </select>
        </div>

        <div class="space-y-1">
          <span class="block text-sm font-semibold">
            Clima aleatorio (probabilidades)
          </span>
          <label class="inline-flex items-center gap-2 text-xs text-[#9FB9D8]">
            <input
              type="checkbox"
              class="accent-[#26C6DA]"
              bind:checked={config.usar_probabilidades}
            />
            <span>{config.usar_probabilidades ? "ON" : "OFF"}</span>
          </label>
        </div>

        {#if config.scenario === "Libre"}
          <!-- SEPARADOR -->
          <hr class="border-[#1F3A55] my-2" />
          <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide mb-2">
            Parámetros Avanzados
          </p>

          <!-- SLIDERS -->
          <div class="space-y-3">
            <!-- Arrival Rate -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Tasa Llegadas</span>
                <span class="text-[#26C6DA]"
                  >{config.arrival_rate ?? "Auto"}</span
                >
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                class="w-full accent-[#26C6DA]"
                value={config.arrival_rate ?? 0.5}
                on:input={(e) =>
                  (config.arrival_rate = parseFloat(e.currentTarget.value))}
              />
            </div>

            <!-- Max Ground -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Capacidad Pistas</span>
                <span class="text-[#26C6DA]">{config.max_ground ?? "Auto"}</span
                >
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                class="w-full accent-[#26C6DA]"
                value={config.max_ground ?? 4}
                on:input={(e) =>
                  (config.max_ground = parseInt(e.currentTarget.value))}
              />
            </div>

            <!-- Turn Time -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Tiempo Giro</span>
                <span class="text-[#26C6DA]">{config.turn_time ?? "Auto"}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                class="w-full accent-[#26C6DA]"
                value={config.turn_time ?? 3}
                on:input={(e) =>
                  (config.turn_time = parseInt(e.currentTarget.value))}
              />
            </div>

            <!-- Takeoff Time -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Tiempo Despegue</span>
                <span class="text-[#26C6DA]"
                  >{config.takeoff_time ?? "Auto"}</span
                >
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                class="w-full accent-[#26C6DA]"
                value={config.takeoff_time ?? 5}
                on:input={(e) =>
                  (config.takeoff_time = parseInt(e.currentTarget.value))}
              />
            </div>
          </div>
        {/if}

        <button
          class="mt-2 w-full px-3 py-1 rounded bg-[#26C6DA] hover:bg-[#2FE4F7] text-white text-sm font-medium disabled:opacity-60 transition-colors"
          on:click={handleReset}
          disabled={loading}
        >
          Aplicar cambios (Reset)
        </button>
      </aside>

      <!-- =========================================
          LADO DERECHO: MAPA, INFO Y CHART
          ========================================= -->
      <div class="flex-1 flex flex-col space-y-3 pt-2 min-w-0">
        <h2 class="text-xl font-semibold mb-1">
          Airport – Llegadas, Emergencias, Órbita, Salidas y Desvíos
        </h2>

        {#if error}
          <p class="text-sm text-[#FCA5A5]">Error: {error}</p>
        {/if}

        {#if !snapshot}
          <p class="text-sm text-[#9FB9D8]">Cargando simulación...</p>
        {:else}
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2 text-xs text-[#9FB9D8]">
              <span class="font-semibold">Frames Per Second</span>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={fps}
                on:input={handleFpsChange}
                class="accent-[#26C6DA]"
              />
              <span>{fps}</span>
            </div>

            <div class="flex flex-wrap gap-2 text-sm">
              <button
                class="px-3 py-1 rounded bg-[#26C6DA] hover:bg-[#2FE4F7] text-white disabled:opacity-60 transition-colors"
                on:click={startAutoRun}
                disabled={loading}
              >
                Start
              </button>

              <button
                class="px-3 py-1 rounded bg-[#0B1E33] hover:bg-[#12263F] text-[#E4F4FF] disabled:opacity-60 transition-colors"
                on:click={handleStep}
                disabled={loading}
              >
                Step
              </button>

              <button
                class="px-3 py-1 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white disabled:opacity-60 transition-colors"
                on:click={handleReset}
                disabled={loading}
              >
                Reset
              </button>

              <button
                class="px-3 py-1 rounded border text-[#E4F4FF] disabled:opacity-60 transition-colors"
                class:border-[#26C6DA]={autoRun}
                class:bg-[#26C6DA]={autoRun}
                class:text-white={autoRun}
                class:border-[#1F3A55]={!autoRun}
                on:click={toggleAutoRun}
                disabled={loading}
              >
                {autoRun ? "Detener Auto-run" : "Auto-run"}
              </button>
            </div>
          </div>

          <!-- MAPA -->
          <div class="mt-2 w-full max-w-xl mx-auto md:mx-0">
            <AirportMap planes={snapshot.planes as PlaneDTO[]} />
          </div>

          <!-- MONITORES ESTILO DASHBOARD -->
          <div class="mt-4 space-y-3">
            <!-- Fila 1: métricas principales -->
            <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-3 py-2 shadow-md hover:shadow-[#26C6DA]/20 transition"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Escenario
                </p>
                <p class="text-lg font-semibold text-[#E4F4FF]">
                  {snapshot.config.scenario}
                </p>
              </div>

              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-3 py-2 shadow-md hover:shadow-[#26C6DA]/20 transition"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Aviones
                </p>
                <p class="text-lg font-semibold text-[#26C6DA]">
                  {totalPlanes}
                </p>
              </div>

              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-3 py-2 shadow-md hover:shadow-[#26C6DA]/20 transition"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Llegadas
                </p>
                <p class="text-lg font-semibold text-[#E4F4FF]">
                  {snapshot.metrics.total_arrivals}
                </p>
              </div>

              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-3 py-2 shadow-md hover:shadow-[#26C6DA]/20 transition"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Salidas
                </p>
                <p class="text-lg font-semibold text-[#E4F4FF]">
                  {snapshot.metrics.total_departures}
                </p>
              </div>

              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-3 py-2 shadow-md hover:shadow-[#26C6DA]/20 transition"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Emergencias
                </p>
                <p class="text-lg font-semibold text-[#DC2626]">
                  {snapshot.metrics.emergencias}
                </p>
              </div>

              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-3 py-2 shadow-md hover:shadow-[#26C6DA]/20 transition"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Desviados
                </p>
                <p class="text-lg font-semibold text-[#F59E0B]">
                  {snapshot.metrics.total_diverted}
                </p>
              </div>
            </div>

            <!-- Fila 2: estados (desvíos + clima + hora) -->
            <div class="flex flex-wrap gap-3">
              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-4 py-2 shadow-md flex items-center justify-between min-w-[120px]"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Desvíos
                </p>
                <p
                  class="text-sm font-semibold"
                  class:text-[#26C6DA]={desvioOn}
                  class:text-[#9FB9D8]={!desvioOn}
                >
                  {desvioOn ? "ON" : "OFF"}
                </p>
              </div>

              <div
                class="bg-[#020817] border border-[#1F3A55] rounded-xl px-4 py-2 shadow-md flex items-center justify-between flex-1 min-w-[180px]"
              >
                <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
                  Clima
                </p>
                <div class="flex items-center gap-2">
                  <span class="text-lg">{climaEmoji}</span>
                  <span class="text-sm font-semibold text-[#E4F4FF]">
                    {climaTipo}
                  </span>
                </div>
              </div>

              <!-- Time Display -->
              <TimeDisplay time={snapshot.metrics.time} />
            </div>
          </div>

          <!-- MÉTRICAS – componente Metrics.svelte -->
          <div class="mt-3 w-full">
            <Metrics
              title="Métricas en tiempo real"
              labels={chartLabels}
              llegadas={dataLlegadas}
              salidas={dataSalidas}
              enEspera={dataEnEspera}
              emergencias={dataEmergencias}
              desviados={dataDesviados}
              {airlineNames}
              {airlineCounts}
              {avgFuel}
            />
          </div>

          <!-- TABLA DE VUELOS – componente FlightTable.svelte -->
          <div class="mt-3 w-full">
            <FlightTable planes={snapshot.planes} />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
