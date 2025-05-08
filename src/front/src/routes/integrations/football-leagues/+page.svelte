<script>
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  // @ts-ignore
  let canvas;
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

        // Crear gráfico de barras horizontales
        // @ts-ignore
        chart = new Chart(canvas.getContext('2d'), {
          type: 'bar', // Tipo de gráfico de barras horizontales
          data: {
            labels: leagues, // Las ligas como etiquetas
            datasets: [
              {
                label: 'Popularidad de Ligas de Fútbol',
                data: popularity, // Los valores de popularidad (usamos los IDs para simular la popularidad)
                backgroundColor: '#36A2EB', // Color de las barras
                borderColor: '#007bff', // Color del borde de las barras
                borderWidth: 1,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
            indexAxis: 'y', // Esta opción pone las barras en horizontal
            plugins: {
              tooltip: {
                callbacks: {
                  label: ({ raw }) => `${raw}`, // Muestra el ID como popularidad (puedes modificar esto)
                },
              },
              title: {
                display: true,
                text: 'Popularidad de Ligas de Fútbol',
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Popularidad (ID)',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Ligas',
                },
              },
            },
          },
        });
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

  canvas {
    width: 100%;
    height: 100%;
  }
</style>

<div class="chart-container">
  <h2>Popularidad de Ligas de Fútbol</h2>
  <canvas bind:this={canvas}></canvas>
</div>
