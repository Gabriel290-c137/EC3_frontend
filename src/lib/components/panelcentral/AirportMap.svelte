<!-- src/lib/components/panelcentral/AirportMap.svelte -->
<script lang="ts">
  import type { PlaneDTO, ClimaType } from "$lib/types/api";
  import WeatherEffects from "$lib/components/panelcentral/WeatherEffects.svelte";

  export let planes: PlaneDTO[] = [];
  export let clima: ClimaType | "ninguno" = "ninguno";

  // Tamaño del grid (coincide con CanvasGrid(20, 20))
  const GRID_SIZE = 20;
  const MAX_INDEX = GRID_SIZE - 1;

  // Paleta (basada en lógica de planeColor + tu Figma)
  const COLOR_GOAROUND = "#C77DFF"; // GO-AROUND
  const COLOR_EMERGENCIA = "#FF5252"; // Emergencia
  const COLOR_HOLDING = "#FFC34D"; // Holding / espera
  const COLOR_DEPARTING = "#FFFFFF"; // Departing (blanco, como en CanvasGrid)
  const COLOR_DESVIADO = "#A0A0A0"; // Desviado
  const COLOR_NORMAL = "#18D1FF"; // Normal (fallback si no hay color de aerolínea)

  /**
   * MISMA LÓGICA QUE planeColor(p) DEL SCRIPT:
   *
   * 1) GO-AROUND → morado (goaround_blink > 0)
   * 2) Emergencias → rojo
   * 3) Holding → amarillo
   * 4) Departing → blanco
   * 5) Diverted / desviado → gris
   * 6) Normal → color de la aerolínea / cyan
   */
  function getPlaneColor(p: PlaneDTO): string {
    if ((p.goaround_blink ?? 0) > 0) {
      return COLOR_GOAROUND;
    }
    if (p.emergencia) {
      return COLOR_EMERGENCIA;
    }
    if (p.state === "holding") {
      return COLOR_HOLDING;
    }
    if (p.state === "departing") {
      return COLOR_DEPARTING;
    }
    if ((p as any).desviado) {
      return COLOR_DESVIADO;
    }

    // Normal: respetamos el color de la aerolínea si viene del backend
    const airlineColor = (p as any)?.airline?.color as string | undefined;
    return airlineColor ?? COLOR_NORMAL;
  }

  // === Mapeo coordenadas a porcentaje ===
  // X: igual que CanvasGrid (0 izquierda → 100 derecha)
  function toPercentX(x: number) {
    return (x / MAX_INDEX) * 100;
  }

  // Y: debemos INVERTIR como hace buildGridFromSnapshot
  // En el grid: la fila superior es y = 19, aquí top: 0%
  // En CSS: top=0 → arriba, top=100 → abajo
  function toPercentY(y: number) {
    const inverted = MAX_INDEX - y; // y=19 → 0, y=0 → 19
    return (inverted / MAX_INDEX) * 100;
  }
</script>

<!-- CONTENEDOR RADAR -->
<div
  class="relative bg-[#0B1E33] rounded-2xl overflow-hidden w-[500px] h-[500px]"
>
  <!-- EFECTOS DE CLIMA (DENTRO DEL GRID) -->
  <WeatherEffects {clima} />

  <!-- RADAR GRID -->
  <svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
    <defs>
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path
          d="M 50 0 L 0 0 0 50"
          fill="none"
          stroke="#26C6DA"
          stroke-width="0.5"
        />
      </pattern>
      <radialGradient id="radarGradient">
        <stop offset="0%" stop-color="#26C6DA" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#26C6DA" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>

  <!-- RADAR SWEEP -->
  <div
    class="absolute inset-0 flex items-center justify-center pointer-events-none"
  >
    <div class="relative w-[90%] h-[90%]">
      {#each [0.3, 0.6, 1] as scale}
        <div
          class="absolute inset-0 border-2 border-[#26C6DA]/20 rounded-full"
          style={`transform: scale(${scale});`}
        ></div>
      {/each}

      <!-- Sweep -->
      <div
        class="absolute inset-0 animate-spin"
        style="animation-duration: 4s;"
      >
        <div
          class="absolute top-1/2 left-1/2 w-1/2 h-1"
          style="
            background: linear-gradient(90deg, rgba(38,198,218,0.5) 0%, rgba(38,198,218,0) 100%);
            transform-origin: left center;
          "
        ></div>
      </div>
    </div>
  </div>

  <!-- AIRPORT CENTER (pistas + hub) -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <div class="relative">
      <div
        class="w-40 h-1 bg-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ></div>
      <div
        class="w-1 h-40 bg-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ></div>

      <div
        class="w-10 h-10 bg-[#26C6DA] rounded-full flex items-center justify-center shadow-xl z-10"
      >
        ✈️
      </div>
    </div>
  </div>

  <!-- AIRCRAFT -->
  {#each planes as p (p.id)}
    {#key p.id}
      <div
        class="absolute transition-all duration-150"
        style="
          left: {toPercentX(p.x)}%;
          top: {toPercentY(p.y)}%;
          transform: translate(-50%, -50%);
        "
      >
        <!-- EMERGENCY RING -->
        {#if p.emergencia}
          <div
            class="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
          >
            <div
              class="absolute inset-0 border-2 border-red-500 rounded-full animate-ping"
            ></div>
          </div>
        {/if}

        <!-- Plane icon -->
        <div
          class="w-5 h-5 rounded-full flex items-center justify-center shadow-lg relative z-10"
          style="background-color: {getPlaneColor(p)};"
        ></div>

        <!-- Tooltip -->
        <div
          class="absolute top-6 left-1/2 -translate-x-1/2 bg-[#0F1C2D] text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20"
        >
          ID {p.id}<br />
          {p.state}<br />
          Prioridad {p.prioridad}
        </div>
      </div>
    {/key}
  {/each}
</div>