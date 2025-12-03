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
  } from "chart.js";

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Legend,
    Tooltip,
  );

  // Props que vienen desde PanelCentral
  export let title = "Métricas en tiempo real";

  export let labels: (string | number)[] = [];
  export let llegadas: number[] = [];
  export let salidas: number[] = [];
  export let enEspera: number[] = [];
  export let emergencias: number[] = [];
  export let desviados: number[] = [];

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart<"line"> | null = null;

  onMount(() => {
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
          legend: {
            display: false, // usamos la leyenda custom arriba
          },
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
            ticks: {
              color: "#8BA3B8",
              font: { size: 11 },
            },
            grid: {
              color: "#26C6DA20",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#8BA3B8",
              font: { size: 11 },
            },
            grid: {
              color: "#1F3A55",
            },
          },
        },
      },
    });

    chartCanvas.style.backgroundColor = "#071321";

    return () => {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    };
  });

  // Cuando cambian las props, actualizamos la gráfica
  $: if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = llegadas;
    chart.data.datasets[1].data = salidas;
    chart.data.datasets[2].data = enEspera;
    chart.data.datasets[3].data = emergencias;
    chart.data.datasets[4].data = desviados;
    chart.update();
  }
</script>

<div class="h-full bg-[#1A2B3A] rounded-2xl p-4 flex flex-col">
  <!-- Header + leyenda estilo Figma -->
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-white text-[18px] font-semibold">
      {title}
    </h3>

    <div class="flex items-center gap-4 text-[11px]">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#26C6DA]"></div>
        <span class="text-[#8BA3B8]">Llegadas</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#0EA5E9]"></div>
        <span class="text-[#8BA3B8]">Salidas</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#FFC107]"></div>
        <span class="text-[#8BA3B8]">En espera</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#F44336]"></div>
        <span class="text-[#8BA3B8]">Emergencias</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#9E9E9E]"></div>
        <span class="text-[#8BA3B8]">Desvíos</span>
      </div>
    </div>
  </div>

  <!-- Chart -->
  <div class="flex-1 mt-2">
    <canvas
      bind:this={chartCanvas}
      class="w-full h-full rounded-lg"
    ></canvas>
  </div>
</div>
