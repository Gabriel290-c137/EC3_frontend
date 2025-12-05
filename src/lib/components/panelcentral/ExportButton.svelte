<!-- src/lib/components/panelcentral/ExportButton.svelte -->
<script lang="ts">
  let exporting = false;
  let exportSuccess = false;

  async function handleExport() {
    exporting = true;
    exportSuccess = false;

    try {
      const response = await fetch("http://localhost:8000/simulacion/export");

      if (!response.ok) {
        throw new Error("Error al exportar datos");
      }

      const data = await response.json();

      // Crear archivo CSV
      const csvContent = generateCSV(data);

      // Descargar archivo
      downloadCSV(csvContent, `simulation_data_${Date.now()}.csv`);

      exportSuccess = true;
      setTimeout(() => {
        exportSuccess = false;
      }, 3000);
    } catch (error) {
      console.error("Error exportando:", error);
      alert("Error al exportar datos. Ver consola para detalles.");
    } finally {
      exporting = false;
    }
  }

  function generateCSV(data: any): string {
    // Encabezados
    const headers = [
      "Step",
      "Llegadas",
      "Salidas",
      "Emergencias",
      "Desviados",
      "En_Espera",
      "Aviones_Holding",
      "Tiempo_Holding_Prom",
      "Util_Pistas_%",
      "Throughput",
      "Efic_Combustible",
      "Tasa_Emergencias_%",
    ];

    // Filas de datos
    const rows = data.steps.map((step: number, idx: number) => [
      step,
      data.llegadas[idx],
      data.salidas[idx],
      data.emergencias[idx],
      data.desviados[idx],
      data.en_espera[idx],
      data.aviones_en_holding[idx],
      data.tiempo_holding_promedio[idx].toFixed(2),
      data.utilizacion_pistas[idx].toFixed(2),
      data.throughput[idx].toFixed(2),
      data.eficiencia_combustible[idx].toFixed(2),
      data.tasa_emergencias[idx].toFixed(2),
    ]);

    // Combinar headers + rows
    const csvLines = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ];

    return csvLines.join("\n");
  }

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async function handleExportSummary() {
    try {
      const response = await fetch("http://localhost:8000/simulacion/summary");

      if (!response.ok) {
        throw new Error("Error al obtener resumen");
      }

      const summary = await response.json();

      // Crear JSON formateado
      const jsonContent = JSON.stringify(summary, null, 2);

      // Descargar como archivo JSON
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `simulation_summary_${Date.now()}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exportando resumen:", error);
      alert("Error al exportar resumen.");
    }
  }
</script>

<div class="flex gap-2">
  <!-- Botón Exportar CSV -->
  <button
    class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
    class:bg-[#26C6DA]={!exportSuccess}
    class:text-white={!exportSuccess}
    class:border-[#26C6DA]={!exportSuccess}
    class:hover:bg-[#2FE4F7]={!exportSuccess && !exporting}
    class:bg-green-600={exportSuccess}
    class:border-green-600={exportSuccess}
    on:click={handleExport}
    disabled={exporting}
  >
    {#if exporting}
      <span class="animate-spin">⏳</span>
      <span>Exportando...</span>
    {:else if exportSuccess}
      <span>✓</span>
      <span>Exportado!</span>
    {:else}
      <span>📊</span>
      <span>Exportar CSV</span>
    {/if}
  </button>

  <!-- Botón Resumen JSON -->
  <button
    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1E33] hover:bg-[#12263F] text-white border border-[#1F3A55] transition-all text-sm font-medium"
    on:click={handleExportSummary}
  >
    <span>📄</span>
    <span>Resumen JSON</span>
  </button>
</div>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
    display: inline-block;
  }
</style>