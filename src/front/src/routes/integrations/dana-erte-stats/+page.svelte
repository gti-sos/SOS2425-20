<script>
  import { onMount, onDestroy } from 'svelte';
    // @ts-ignore
    let chart;
  
    onMount(async () => {
      // 1) Cargar C3 y su CSS
      // @ts-ignore
      const c3 = await import('c3');
      await import('c3/c3.css');
  
      // 2) Fetch a la API del compañero
      const res = await fetch('/integrations/dana-erte-stats/proxy');
      const data = await res.json();
  
      if (data.length > 0) {
        // 3) Calcular totales globales
        // @ts-ignore
        const totalMan = data.reduce((sum, rec) => sum + (rec.total_man_sus || 0), 0);
        // @ts-ignore
        const totalWoman = data.reduce((sum, rec) => sum + (rec.total_woman_sus || 0), 0);
  
        // 4) Generar el pie chart con los totales
        chart = c3.generate({
          bindto: '#pie-chart',
          data: {
            columns: [
              ['Hombres', totalMan],
              ['Mujeres', totalWoman]
            ],
            type: 'pie'
          },
          pie: {
            label: {
              // @ts-ignore
              format: value => `${value}`
            }
          },
          legend: {
            position: 'right'
          }
        });
      }
    });
  
    onDestroy(() => {
      // @ts-ignore
      chart?.destroy();
    });
  </script>
  
  <style>
    .chart-container {
      max-width: 600px;
      margin: 2rem auto;
      text-align: center;
    }
    #pie-chart {
      height: 400px;
    }
  </style>
  
  <div class="chart-container">
    <h2>Trabajadores de la DANA (Total)</h2>
    <div id="pie-chart"></div>
  </div>
  