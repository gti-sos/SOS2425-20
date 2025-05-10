<script>
  import { onMount, onDestroy } from 'svelte';

  // @ts-ignore
  let chartDiv;

  onMount(async () => {
    // Cargar jQuery desde CDN
    const scriptJQuery = document.createElement('script');
    scriptJQuery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    scriptJQuery.onload = () => {
      // Cargar Raphael.js desde CDN
      const scriptRaphael = document.createElement('script');
      scriptRaphael.src = 'https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js';
      scriptRaphael.onload = () => {
        // Cargar Morris.js desde CDN
        const scriptMorris = document.createElement('script');
        scriptMorris.src = 'https://cdnjs.cloudflare.com/ajax/libs/morris.js/0.5.1/morris.min.js';
        scriptMorris.onload = async () => {
          // 1) Fetch a la API del compañero (nuestro proxy)
          const res = await fetch('/integrations/covid-19/proxy');
          const data = await res.json();

          if (data && data.response && data.response.length > 0) {
            // 2) Ordenar por número total de casos en orden descendente y seleccionar los 15 primeros
            const sorted = data.response
              // @ts-ignore
              .filter(item => item.cases.total && item.cases.total > 0)
              // @ts-ignore
              .sort((a, b) => b.cases.total - a.cases.total)
              .slice(0, 15);

            // @ts-ignore
            const countries = sorted.map(item => item.country);
            // @ts-ignore
            const cases = sorted.map(item => item.cases.total);

            // 3) Crear el gráfico con Morris.js (usamos el gráfico de tipo columna)
            // @ts-ignore
            new Morris.Bar({
              // @ts-ignore
              element: chartDiv,
              // @ts-ignore
              data: countries.map((country, index) => ({
                country: country,
                cases: cases[index],
              })),
              xkey: 'country',
              ykeys: ['cases'],
              labels: ['Casos Totales'],
              barColors: ['#1D92F1'],
              xLabelAngle: 45, // Rotar las etiquetas en el eje X
              resize: true, // Ajustar el tamaño cuando la ventana cambie de tamaño
            });
          }
        };
        document.body.appendChild(scriptMorris);
      };
      document.body.appendChild(scriptRaphael);
    };
    document.body.appendChild(scriptJQuery);
  });

  onDestroy(() => {
    // Limpieza del gráfico
    // @ts-ignore
    if (chartDiv) {
      chartDiv.innerHTML = '';
    }
  });
</script>

<style>
  .chart-container {
    max-width: 900px;
    margin: 2rem auto;
    text-align: center;
  }
  #chart-container {
    height: 500px;
  }
</style>

<div class="chart-container">
  <h2>COVID-19: Top 15 Continentes o Países con más Casos</h2>
  <div id="chart-container" bind:this={chartDiv}></div>
</div>
