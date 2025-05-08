<script>
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
  
    // @ts-ignore
    let canvas;
    // @ts-ignore
    let chart;
  
    onMount(async () => {
      // 1) Cargar datos de países
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,population');
      const data = await res.json();
  
      // 2) Ordenar y quedarnos con los 10 más poblados
      const top10 = data
        // @ts-ignore
        .sort((a, b) => b.population - a.population)
        .slice(0, 10);
      // @ts-ignore
      const labels = top10.map(c => c.name.common);
      // @ts-ignore
      const populations = top10.map(c => c.population);
  
      // 3) Crear gráfica
      // @ts-ignore
      chart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Población',
            data: populations,
            barPercentage: 0.6
          }]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                // @ts-ignore
                callback: (value) => {
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
      // @ts-ignore
      if (chart) chart.destroy();
    });
  </script>
  
  <style>
    .chart-container {
      width: 100%;
      max-width: 800px;
      height: 500px;
      margin: 2rem auto;
    }
  </style>
  
  <div class="chart-container">
    <h2>10 Países Más Poblados del Mundo</h2>
    <canvas bind:this={canvas}></canvas>
  </div>
  