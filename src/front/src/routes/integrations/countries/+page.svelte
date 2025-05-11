<script>
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  // Referencia al elemento <canvas> donde se dibujará la gráfica
  // @ts-ignore
  let canvas;
  // Referencia al objeto Chart para poder destruirlo al desmontar
  // @ts-ignore
  let chart;

  onMount(async () => {
    // 1) Obtener datos de todos los países (nombre y población)
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,population');
    const data = await res.json();

    // 2) Ordenar por población descendente y quedarnos con los 10 primeros
    const top10 = data
      // @ts-ignore
      .sort((a, b) => b.population - a.population)
      .slice(0, 10);

    // 3) Preparar etiquetas y valores para el gráfico
    // @ts-ignore
    const labels = top10.map(c => c.name.common);
    // @ts-ignore
    const populations = top10.map(c => c.population);

    // 4) Crear el gráfico de barras con Chart.js
    // @ts-ignore
    chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',              // Tipo de gráfico
      data: {
        labels,                 // Etiquetas del eje X
        datasets: [{
          label: 'Población',   // Leyenda de la serie
          data: populations,    // Datos de la serie
          barPercentage: 0.6    // Ancho relativo de las barras
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              // 5) Formatear ejes Y: 1B, 1M, 1K...
              callback: value => {
                const v = Number(value);
                if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
                if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
                if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
                return v.toString();
              }
            }
          }
        }
      }
    });
  });

  onDestroy(() => {
    // Destruir instancia del gráfico al desmontar el componente
    // @ts-ignore
    if (chart) {
      chart.destroy();
    }
  });
</script>

<style>
  /* Ajustes de tamaño y centrado del contenedor */
  .chart-container {
    width: 100%;
    max-width: 800px;
    height: 500px;
    margin: 2rem auto;
  }
</style>

<div class="chart-container">
  <h2>10 Países Más Poblados del Mundo</h2>
  <!-- Canvas donde Chart.js dibujará la gráfica -->
  <canvas bind:this={canvas}></canvas>
</div>
