<!-- src/lib/components/panelcentral/AdvancedMetrics.svelte -->
<script lang="ts">
  interface AdvancedMetricsData {
    throughput: number; // Aviones procesados por hora
    runway_utilization: number; // % de utilización de pistas
    avg_holding_time: number; // Tiempo promedio en holding
    fuel_efficiency: number; // Eficiencia de combustible
    emergency_rate: number; // % de emergencias
  }

  interface TowerStats {
    reordenamientos: number;
    emergencias_atendidas: number;
    desviaciones: number;
    eficiencia: number;
  }

  export let advanced: AdvancedMetricsData = {
    throughput: 0,
    runway_utilization: 0,
    avg_holding_time: 0,
    fuel_efficiency: 0,
    emergency_rate: 0,
  };

  export let tower: TowerStats = {
    reordenamientos: 0,
    emergencias_atendidas: 0,
    desviaciones: 0,
    eficiencia: 0,
  };

  // Helpers para colores según valor
  function getUtilizationColor(value: number): string {
    if (value < 50) return "#26C6DA"; // Bajo (bueno)
    if (value < 75) return "#10B981"; // Medio
    if (value < 90) return "#F59E0B"; // Alto
    return "#EF4444"; // Crítico
  }

  function getEfficiencyColor(value: number): string {
    if (value >= 80) return "#26C6DA"; // Excelente
    if (value >= 60) return "#10B981"; // Bueno
    if (value >= 40) return "#F59E0B"; // Regular
    return "#EF4444"; // Malo
  }

  function getEmergencyColor(value: number): string {
    if (value < 5) return "#26C6DA"; // Bajo
    if (value < 10) return "#F59E0B"; // Medio
    return "#EF4444"; // Alto
  }
</script>

<div class="space-y-4">
  <!-- TÍTULO -->
  <h3 class="text-white text-base font-semibold flex items-center gap-2">
    📊 KPIs Avanzados
  </h3>

  <!-- FILA 1: Métricas operacionales -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <!-- Throughput -->
    <div
      class="bg-[#1A2B3A] rounded-xl p-4 border border-[#1F3A55] hover:border-[#26C6DA] transition-all"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
          Throughput
        </div>
        <span class="text-lg">🚀</span>
      </div>

      <div class="text-2xl font-bold text-[#26C6DA] mb-1">
        {advanced.throughput.toFixed(1)}
      </div>

      <div class="text-[10px] text-[#9FB9D8]">aviones / hora</div>

      <div class="mt-2 text-[9px] text-[#9FB9D8]">
        {#if advanced.throughput < 20}
          ⚠️ Baja actividad
        {:else if advanced.throughput < 40}
          ✓ Normal
        {:else if advanced.throughput < 60}
          📈 Alta actividad
        {:else}
          🔥 Sobrecarga
        {/if}
      </div>
    </div>

    <!-- Utilización de Pistas -->
    <div
      class="bg-[#1A2B3A] rounded-xl p-4 border border-[#1F3A55] hover:border-[#26C6DA] transition-all"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
          Utilización Pistas
        </div>
        <span class="text-lg">🛫</span>
      </div>

      <div
        class="text-2xl font-bold mb-1"
        style="color: {getUtilizationColor(advanced.runway_utilization)};"
      >
        {advanced.runway_utilization.toFixed(1)}%
      </div>

      <!-- Barra de progreso -->
      <div class="w-full h-2 bg-[#0F1C2D] rounded-full overflow-hidden mb-2">
        <div
          class="h-full transition-all duration-500"
          style="width: {advanced.runway_utilization}%; background-color: {getUtilizationColor(
            advanced.runway_utilization,
          )};"
        ></div>
      </div>

      <div class="text-[9px] text-[#9FB9D8]">
        {#if advanced.runway_utilization < 50}
          ✓ Capacidad disponible
        {:else if advanced.runway_utilization < 75}
          📊 Uso moderado
        {:else if advanced.runway_utilization < 90}
          ⚠️ Uso intensivo
        {:else}
          🚨 Saturado
        {/if}
      </div>
    </div>

    <!-- Tiempo promedio en Holding -->
    <div
      class="bg-[#1A2B3A] rounded-xl p-4 border border-[#1F3A55] hover:border-[#26C6DA] transition-all"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
          Holding Promedio
        </div>
        <span class="text-lg">🔄</span>
      </div>

      <div class="text-2xl font-bold text-[#F59E0B] mb-1">
        {advanced.avg_holding_time.toFixed(1)}
      </div>

      <div class="text-[10px] text-[#9FB9D8]">ticks</div>

      <div class="mt-2 text-[9px] text-[#9FB9D8]">
        {#if advanced.avg_holding_time < 3}
          ✓ Excelente
        {:else if advanced.avg_holding_time < 6}
          📊 Normal
        {:else if advanced.avg_holding_time < 10}
          ⚠️ Retrasado
        {:else}
          🚨 Crítico
        {/if}
      </div>
    </div>
  </div>

  <!-- FILA 2: Eficiencia y Emergencias -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <!-- Eficiencia de Combustible -->
    <div
      class="bg-[#1A2B3A] rounded-xl p-4 border border-[#1F3A55] hover:border-[#26C6DA] transition-all"
    >
      <div class="flex items-center justify-between mb-3">
        <div>
          <div class="text-[10px] text-[#9FB9D8] uppercase tracking-wide mb-1">
            Eficiencia de Combustible
          </div>
          <div
            class="text-3xl font-bold"
            style="color: {getEfficiencyColor(advanced.fuel_efficiency)};"
          >
            {advanced.fuel_efficiency.toFixed(0)}
          </div>
        </div>
        <span class="text-3xl">⛽</span>
      </div>

      <!-- Medidor circular -->
      <div class="relative w-full h-3 bg-[#0F1C2D] rounded-full overflow-hidden">
        <div
          class="absolute h-full transition-all duration-500"
          style="width: {advanced.fuel_efficiency}%; background: linear-gradient(90deg, {getEfficiencyColor(
            advanced.fuel_efficiency,
          )} 0%, {getEfficiencyColor(advanced.fuel_efficiency)}80 100%);"
        ></div>
      </div>

      <div class="mt-2 text-[10px] text-[#9FB9D8]">
        Menor tiempo en holding = mayor eficiencia
      </div>
    </div>

    <!-- Tasa de Emergencias -->
    <div
      class="bg-[#1A2B3A] rounded-xl p-4 border border-[#1F3A55] hover:border-[#26C6DA] transition-all"
    >
      <div class="flex items-center justify-between mb-3">
        <div>
          <div class="text-[10px] text-[#9FB9D8] uppercase tracking-wide mb-1">
            Tasa de Emergencias
          </div>
          <div
            class="text-3xl font-bold"
            style="color: {getEmergencyColor(advanced.emergency_rate)};"
          >
            {advanced.emergency_rate.toFixed(1)}%
          </div>
        </div>
        <span class="text-3xl">🚨</span>
      </div>

      <div class="w-full h-3 bg-[#0F1C2D] rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-500"
          style="width: {Math.min(
            advanced.emergency_rate * 10,
            100,
          )}%; background-color: {getEmergencyColor(
            advanced.emergency_rate,
          )};"
        ></div>
      </div>

      <div class="mt-2 text-[10px] text-[#9FB9D8]">
        {#if advanced.emergency_rate < 5}
          ✓ Bajo riesgo
        {:else if advanced.emergency_rate < 10}
          ⚠️ Riesgo moderado
        {:else}
          🚨 Alto riesgo
        {/if}
      </div>
    </div>
  </div>

  <!-- SECCIÓN: Torre de Control -->
  <div
    class="bg-[#1A2B3A] rounded-xl p-4 border border-[#1F3A55] hover:border-[#26C6DA] transition-all"
  >
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-white flex items-center gap-2">
        🗼 Torre de Control
      </h4>
      <div
        class="text-lg font-bold"
        style="color: {getEfficiencyColor(tower.eficiencia)};"
      >
        {tower.eficiencia.toFixed(0)}% eficiencia
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div class="text-center">
        <div class="text-2xl font-bold text-[#26C6DA]">
          {tower.reordenamientos}
        </div>
        <div class="text-[9px] text-[#9FB9D8] uppercase mt-1">
          Reordenamientos
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-[#10B981]">
          {tower.emergencias_atendidas}
        </div>
        <div class="text-[9px] text-[#9FB9D8] uppercase mt-1">
          Emergencias OK
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-[#9E9E9E]">
          {tower.desviaciones}
        </div>
        <div class="text-[9px] text-[#9FB9D8] uppercase mt-1">
          Desviaciones
        </div>
      </div>
    </div>
  </div>
</div>