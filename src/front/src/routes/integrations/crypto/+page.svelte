<script>
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  // Referencia al canvas donde se dibujará la gráfica
  // @ts-ignore
  let canvas;
  // Instancia del gráfico para poder destruirla al salir
  // @ts-ignore
  let chart;

  onMount(async () => {
    // 1) Obtener las 5 criptomonedas con mayor capitalización de mercado
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?' +
      'vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false'
    );
    const data = await res.json();

    // 2) Preparar etiquetas (nombres) y valores (market_cap)
    // @ts-ignore
    const labels = data.map(c => c.name);
    // @ts-ignore
    const marketCaps = data.map(c => c.market_cap);

    // 3) Crear el gráfico de tipo 'pie'
    // @ts-ignore
    chart = new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: marketCaps
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              // 4) Formatear las etiquetas del tooltip (K, M, B, T)
              label: ({ parsed }) => {
                const v = parsed;
                if (v >= 1e12) return (v / 1e12).toFixed(1) + ' T';
                if (v >= 1e9)  return (v / 1e9).toFixed(1)  + ' B';
                if (v >= 1e6)  return (v / 1e6).toFixed(1)  + ' M';
                if (v >= 1e3)  return (v / 1e3).toFixed(1)  + ' K';
                return v.toString();
              }
            }
          },
          legend: {
            // 5) Mostrar la leyenda abajo del gráfico
            position: 'bottom'
          }
        }
      }
    });
  });

  onDestroy(() => {
    // Destruir el gráfico al desmontar el componente
    // @ts-ignore
    chart?.destroy();
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
  <h2>Top 5 Criptomonedas por Capitalización de Mercado</h2>
  <!-- Canvas donde Chart.js renderiza la gráfica -->
  <canvas bind:this={canvas}></canvas>
</div>
