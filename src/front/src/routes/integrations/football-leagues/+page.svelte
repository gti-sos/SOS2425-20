<script>
  import { onMount, onDestroy } from 'svelte';
  import ApexCharts from 'apexcharts';

  // @ts-ignore
  let chart;

  onMount(async () => {
    // Nueva API para obtener datos de ligas populares
    const url = 'https://free-api-live-football-data.p.rapidapi.com/football-popular-leagues';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '2c001ce06cmsh489140de8de67d7p1f0f32jsncf17ff25ca89',
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
      },
    };

    try {
      const res = await fetch(url, options);
      const data = await res.json();

      // Imprimir la respuesta para verificar cómo se estructura
      console.log('Respuesta de la API:', data);

      // Asegurarnos de que la respuesta contiene la propiedad 'response' y 'popular'
      const leaguesData = data.response?.popular;

      if (leaguesData && Array.isArray(leaguesData)) {
        // Preparar las ligas y popularidad obtenidas de la API
        const leagues = leaguesData.map(league => league.localizedName); // Nombres de las ligas
        const popularity = leaguesData.map(league => league.id); // Usamos el ID como la "popularidad"

        // Crear gráfico de barras horizontales con ApexCharts
        const options = {
          chart: {
            type: 'bar',
            height: '500',
            toolbar: {
              show: false,
            },
          },
          plotOptions: {
            bar: {
              horizontal: true, // Este es el tipo de barras horizontales
            },
          },
          dataLabels: {
            enabled: false, // Desactivar etiquetas de datos en las barras
          },
          series: [
            {
              name: 'Popularidad de Ligas de Fútbol',
              data: popularity, // Los valores de popularidad (usamos los IDs para simular la popularidad)
            },
          ],
          xaxis: {
            categories: leagues, // Las ligas como categorías
            title: {
              text: 'Popularidad (ID)', // Título del eje X
            },
          },
          yaxis: {
            title: {
              text: 'Ligas', // Título del eje Y
            },
          },
          title: {
            text: 'Popularidad de Ligas de Fútbol',
            align: 'center',
          },
        };

        chart = new ApexCharts(document.querySelector('#chart'), options);
        chart.render();
      } else {
        console.error('La respuesta de la API no contiene la propiedad "popular" o no es un array', data);
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  });

  onDestroy(() => {
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
  <h2>Popularidad de Ligas de Fútbol</h2>
  <div id="chart"></div>
</div>
