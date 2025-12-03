<!-- src\lib\components\panelcentral\Metrics.svelte -->

<script lang="ts">
  import { onMount } from "svelte";

  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Legend,
    Tooltip,
    BarController,
    BarElement,
  } from "chart.js";

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Legend,
    Tooltip,
    BarController,
    BarElement,
  );

  // Props que vienen desde PanelCentral
  export let title = "Métricas en tiempo real";

  export let labels: (string | number)[] = [];
  export let llegadas: number[] = [];
  export let salidas: number[] = [];
  export let enEspera: number[] = [];
  export let emergencias: number[] = [];
  export let desviados: number[] = [];

  // Nuevas props para gráficas extra
  export let airlineNames: string[] = [];
  export let airlineCounts: number[] = [];
  export let avgFuel: number = 0;

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart<"line"> | null = null;

  let barCanvas: HTMLCanvasElement;
  let barChart: Chart<"bar"> | null = null;

  onMount(() => {
    // 1. LINE CHART (Histórico)
    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Llegadas",
            data: llegadas,
            borderColor: "#26C6DA",
            backgroundColor: "#26C6DA",
            fill: false,
            tension: 0.25,
            pointRadius: 3,
          },
          {
            label: "Salidas",
            data: salidas,
            borderColor: "#0EA5E9",
            backgroundColor: "#0EA5E9",
            fill: false,
            tension: 0.25,
            pointRadius: 3,
          },
          {
            label: "En espera",
            data: enEspera,
            borderColor: "#FFC107",
            backgroundColor: "#FFC107",
            fill: false,
            tension: 0.25,
            pointRadius: 3,
          },
          {
            label: "Emergencias",
            data: emergencias,
            borderColor: "#F44336",
            backgroundColor: "#F44336",
            fill: false,
            tension: 0.25,
            pointRadius: 3,
          },
          {
            label: "Desvíos",
            data: desviados,
            borderColor: "#9E9E9E",
            backgroundColor: "#9E9E9E",
            fill: false,
            tension: 0.25,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: "#0F1C2D",
            borderColor: "#26C6DA",
            borderWidth: 1,
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
          },
        },
        scales: {
          x: {
            ticks: { color: "#8BA3B8", font: { size: 11 } },
            grid: { color: "#26C6DA20" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#8BA3B8", font: { size: 11 } },
            grid: { color: "#1F3A55" },
          },
        },
      },
    });

    // 2. BAR CHART (Aerolíneas)
    barChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: airlineNames,
        datasets: [
          {
            label: "Aviones Activos",
            data: airlineCounts,
            backgroundColor: [
              "#00BFFF",
              "#32CD32",
              "#8B4513",
              "#FFD700",
              "#FF69B4",
            ], // Colores variados
            borderColor: "#1F3A55",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0F1C2D",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
          },
        },
        scales: {
          x: {
            ticks: { color: "#E4F4FF", font: { size: 10 } },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#8BA3B8", stepSize: 1 },
            grid: { color: "#1F3A55" },
          },
        },
      },
    });

    return () => {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      if (barChart) {
        barChart.destroy();
        barChart = null;
      }
    };
  });

  // Reactividad
  $: if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = llegadas;
    chart.data.datasets[1].data = salidas;
    chart.data.datasets[2].data = enEspera;
    chart.data.datasets[3].data = emergencias;
    chart.data.datasets[4].data = desviados;
    chart.update();
  }

  $: if (barChart) {
    barChart.data.labels = airlineNames;
    barChart.data.datasets[0].data = airlineCounts;
    barChart.update();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
  <!-- COL 1: LINE CHART (Grande) -->
  <div
    class="lg:col-span-2 bg-[#1A2B3A] rounded-2xl p-4 flex flex-col min-h-[300px]"
  >
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-white text-[16px] font-semibold">{title}</h3>
      <div class="flex flex-wrap items-center gap-3 text-[10px]">
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-[#26C6DA]"></div>
          <span class="text-[#8BA3B8]">Llegadas</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-[#0EA5E9]"></div>
          <span class="text-[#8BA3B8]">Salidas</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-[#FFC107]"></div>
          <span class="text-[#8BA3B8]">Espera</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-[#F44336]"></div>
          <span class="text-[#8BA3B8]">Emerg.</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-[#9E9E9E]"></div>
          <span class="text-[#8BA3B8]">Desvíos</span>
        </div>
      </div>
    </div>
    <div class="flex-1 relative">
      <canvas bind:this={chartCanvas} class="w-full h-full"></canvas>
    </div>
  </div>

  <!-- COL 2: BAR CHART + FUEL (Lateral) -->
  <div class="flex flex-col gap-4">
    <!-- BAR CHART -->
    <div
      class="flex-1 bg-[#1A2B3A] rounded-2xl p-4 flex flex-col min-h-[180px]"
    >
      <h3 class="text-white text-[14px] font-semibold mb-2">
        Aviones por Aerolínea
      </h3>
      <div class="flex-1 relative">
        <canvas bind:this={barCanvas} class="w-full h-full"></canvas>
      </div>
    </div>

    <!-- FUEL INDICATOR -->
    <div class="bg-[#1A2B3A] rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p class="text-[10px] text-[#9FB9D8] uppercase">Combustible Promedio</p>
        <p
          class="text-2xl font-bold"
          class:text-[#26C6DA]={avgFuel > 50}
          class:text-[#F59E0B]={avgFuel <= 50 && avgFuel > 20}
          class:text-[#EF4444]={avgFuel <= 20}
        >
          {avgFuel.toFixed(1)}%
        </p>
      </div>
      <!-- Simple visual bar -->
      <div class="w-24 h-2 bg-[#0F1C2D] rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-500"
          style="width: {avgFuel}%; background-color: {avgFuel > 50
            ? '#26C6DA'
            : avgFuel > 20
              ? '#F59E0B'
              : '#EF4444'};"
        ></div>
      </div>
    </div>
  </div>
</div>
