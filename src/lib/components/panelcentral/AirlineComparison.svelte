<!-- src/lib/components/panelcentral/AirlineComparison.svelte -->
<script lang="ts">
  interface AirlineData {
    name: string;
    code: string;
    color: string;
    vuelos: number;
    desvios: number;
    costos: {
      fuel: number;
      delays: number;
      diversions: number;
      emergencies: number;
      total: number;
    };
    performance: {
      avg_holding_time: number;
      diversion_rate: number;
      cost_per_flight: number;
      completed_flights: number;
      efficiency_score: number;
    };
  }

  export let airlines: AirlineData[] = [];

  // Calcular rankings
  $: rankings = airlines
    .map((a) => ({
      ...a,
      efficiency: a.performance.efficiency_score,
      total_cost: a.costos.total,
    }))
    .sort((a, b) => b.efficiency - a.efficiency);

  // Medalla según posición
  function getMedal(index: number): string {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}º`;
  }

  // Color del score
  function getScoreColor(score: number): string {
    if (score >= 80) return "#26C6DA"; // Excelente
    if (score >= 60) return "#10B981"; // Bueno
    if (score >= 40) return "#F59E0B"; // Regular
    return "#EF4444"; // Malo
  }

  // Formatear costos
  function formatCurrency(value: number): string {
    return `$${(value / 1000).toFixed(1)}K`;
  }
</script>

<div class="bg-[#1A2B3A] rounded-2xl p-4 border border-[#1F3A55]">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-white text-base font-semibold flex items-center gap-2">
      🏆 Ranking de Aerolíneas
    </h3>
    <span class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">
      Por Eficiencia
    </span>
  </div>

  <div class="space-y-3">
    {#each rankings as airline, idx}
      <div
        class="relative bg-[#0F1C2D] rounded-xl p-3 border border-[#1F3A55] hover:border-[#26C6DA] transition-all cursor-pointer group"
      >
        <!-- Medalla y Nombre -->
        <div class="flex items-start gap-3 mb-2">
          <span class="text-2xl">{getMedal(idx)}</span>

          <div class="flex-1">
            <div
              class="font-bold text-sm mb-1"
              style="color: {airline.color};"
            >
              {airline.name}
            </div>

            <!-- Stats principales -->
            <div class="flex items-center gap-3 text-[10px] text-[#9FB9D8]">
              <span>✈️ {airline.vuelos} vuelos</span>
              <span>↗️ {airline.desvios} desvíos</span>
              <span>✓ {airline.performance.completed_flights} completados</span>
            </div>
          </div>

          <!-- Score de eficiencia -->
          <div class="text-right">
            <div
              class="text-xl font-bold"
              style="color: {getScoreColor(airline.efficiency)};"
            >
              {airline.efficiency.toFixed(0)}
            </div>
            <div class="text-[9px] text-[#9FB9D8]">Score</div>
          </div>
        </div>

        <!-- Barra de progreso de eficiencia -->
        <div class="w-full h-1.5 bg-[#020817] rounded-full overflow-hidden mb-2">
          <div
            class="h-full transition-all duration-500"
            style="width: {airline.efficiency}%; background-color: {getScoreColor(
              airline.efficiency,
            )};"
          ></div>
        </div>

        <!-- Métricas detalladas (se muestran al hover) -->
        <div
          class="grid grid-cols-3 gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <!-- Costos totales -->
          <div class="text-center">
            <div class="text-[9px] text-[#9FB9D8] uppercase mb-0.5">
              Costos
            </div>
            <div class="text-xs font-semibold text-[#EF4444]">
              {formatCurrency(airline.total_cost)}
            </div>
          </div>

          <!-- Tiempo en holding -->
          <div class="text-center">
            <div class="text-[9px] text-[#9FB9D8] uppercase mb-0.5">
              Holding
            </div>
            <div class="text-xs font-semibold text-[#F59E0B]">
              {airline.performance.avg_holding_time.toFixed(1)}t
            </div>
          </div>

          <!-- Tasa de desvío -->
          <div class="text-center">
            <div class="text-[9px] text-[#9FB9D8] uppercase mb-0.5">
              Desvíos
            </div>
            <div class="text-xs font-semibold text-[#9E9E9E]">
              {airline.performance.diversion_rate.toFixed(1)}%
            </div>
          </div>
        </div>

        <!-- Desglose de costos (tooltip expandido) -->
        <div
          class="absolute left-0 right-0 top-full mt-2 bg-[#0F1C2D] border border-[#26C6DA] rounded-lg p-3 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
        >
          <div class="text-[10px] font-semibold text-white mb-2">
            💰 Desglose de Costos
          </div>
          <div class="space-y-1 text-[9px]">
            <div class="flex justify-between">
              <span class="text-[#9FB9D8]">Combustible:</span>
              <span class="text-[#E4F4FF]"
                >{formatCurrency(airline.costos.fuel)}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-[#9FB9D8]">Retrasos:</span>
              <span class="text-[#E4F4FF]"
                >{formatCurrency(airline.costos.delays)}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-[#9FB9D8]">Emergencias:</span>
              <span class="text-[#E4F4FF]"
                >{formatCurrency(airline.costos.emergencies)}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-[#9FB9D8]">Desvíos:</span>
              <span class="text-[#E4F4FF]"
                >{formatCurrency(airline.costos.diversions)}</span
              >
            </div>
            <div class="border-t border-[#1F3A55] pt-1 mt-1"></div>
            <div class="flex justify-between font-bold">
              <span class="text-white">Total:</span>
              <span class="text-[#26C6DA]"
                >{formatCurrency(airline.total_cost)}</span
              >
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if airlines.length === 0}
    <div class="text-center py-8 text-[#9FB9D8] text-sm">
      No hay datos de aerolíneas
    </div>
  {/if}
</div>

<style>
  /* Animación suave para las barras */
  @keyframes fillBar {
    from {
      width: 0%;
    }
  }
</style>