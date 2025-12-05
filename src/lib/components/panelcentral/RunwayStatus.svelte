<!-- src/lib/components/panelcentral/RunwayStatus.svelte -->
<script lang="ts">
  interface Runway {
    id: number;
    busy: boolean;
    remaining: number;
    plane_id: number | null;
  }

  export let runways: Runway[] = [];
  export let utilizationPercent: number = 0;

  function getUtilizationColor(value: number): string {
    if (value < 50) return "#26C6DA";
    if (value < 75) return "#10B981";
    if (value < 90) return "#F59E0B";
    return "#EF4444";
  }
</script>

<div
  class="bg-[#1A2B3A] rounded-xl p-4 border border-[#1F3A55] hover:border-[#26C6DA] transition-all"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-3">
    <h4 class="text-sm font-semibold text-white flex items-center gap-2">
      🛫 Estado de Pistas
    </h4>
    <div class="text-right">
      <div
        class="text-lg font-bold"
        style="color: {getUtilizationColor(utilizationPercent)};"
      >
        {utilizationPercent.toFixed(1)}%
      </div>
      <div class="text-[9px] text-[#9FB9D8]">Utilización</div>
    </div>
  </div>

  <!-- Barra de utilización global -->
  <div class="w-full h-2 bg-[#0F1C2D] rounded-full overflow-hidden mb-4">
    <div
      class="h-full transition-all duration-500"
      style="width: {utilizationPercent}%; background-color: {getUtilizationColor(
        utilizationPercent,
      )};"
    ></div>
  </div>

  <!-- Pistas individuales -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {#each runways as runway}
      <div
        class="bg-[#0F1C2D] rounded-lg p-3 border transition-all"
        class:border-green-500={!runway.busy}
        class:border-red-500={runway.busy}
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full animate-pulse"
              class:bg-green-500={!runway.busy}
              class:bg-red-500={runway.busy}
            ></div>
            <span class="text-xs font-semibold text-white">
              Pista {runway.id + 1}
            </span>
          </div>

          {#if runway.busy}
            <span class="text-[10px] text-red-400 font-mono">OCUPADA</span>
          {:else}
            <span class="text-[10px] text-green-400 font-mono">LIBRE</span>
          {/if}
        </div>

        {#if runway.busy}
          <!-- Info del avión en la pista -->
          <div class="text-[10px] text-[#9FB9D8] space-y-1">
            <div class="flex justify-between">
              <span>Avión:</span>
              <span class="text-[#E4F4FF] font-mono">
                #{runway.plane_id || "N/A"}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Tiempo restante:</span>
              <span class="text-[#F59E0B] font-bold">
                {runway.remaining}s
              </span>
            </div>

            <!-- Barra de progreso -->
            <div
              class="w-full h-1 bg-[#020817] rounded-full overflow-hidden mt-2"
            >
              <div
                class="h-full bg-red-500 transition-all"
                style="width: {(runway.remaining / 10) * 100}%;"
              ></div>
            </div>
          </div>
        {:else}
          <!-- Pista disponible -->
          <div class="text-[10px] text-[#9FB9D8] text-center py-1">
            ✓ Disponible para aterrizaje/despegue
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Info adicional -->
  <div class="mt-3 pt-3 border-t border-[#1F3A55]">
    <div class="flex items-center justify-between text-[10px]">
      <div class="flex items-center gap-2 text-[#9FB9D8]">
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
        <span>Libre</span>
      </div>
      <div class="flex items-center gap-2 text-[#9FB9D8]">
        <div class="w-2 h-2 rounded-full bg-red-500"></div>
        <span>Ocupada</span>
      </div>
      <div class="text-[#9FB9D8]">
        {runways.filter((r) => !r.busy).length} / {runways.length} disponibles
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>