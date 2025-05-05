<!-- src/routes/analytics/+page.svelte -->
<svelte:head>
  <title>Analytics SOS2425</title>
  <script src="https://www.gstatic.com/charts/loader.js"></script>
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  // Rutas a tus APIs
  const BASE         = dev ? 'http://localhost:16078' : '';
  const TRAFFIC_API  = `${BASE}/api/v1/traffic-accidents`;
  const FINES_API    = `${BASE}/api/v1/fines`;
  const ANIMALS_API  = `${BASE}/api/v1/accidents-with-animals`;

  // Totales que vamos a calcular
  let totalAccidents = 0;    //accidentes fatales
  let totalFines     = 0;    // ITV
  let totalAnimal    = 0;   // numero de accidentes

  onMount(() => {
    // Cargar Google Charts y al estar listo, lanzar nuestra función
    // @ts-ignore
    google.charts.load('current', { packages: ['corechart'] });
    // @ts-ignore
    google.charts.setOnLoadCallback(fetchAndDraw);
  });

  async function fetchAndDraw() {
    // ————— Accidentes de Tráfico —————
    let allTraffic = await fetch(TRAFFIC_API).then(r => r.json());
    if (!allTraffic.length) {
      // Si está vacío, carga datos iniciales y vuelve a pedirlos
      await fetch(`${TRAFFIC_API}/loadInitialData`);
      allTraffic = await fetch(TRAFFIC_API).then(r => r.json());
    }
    // @ts-ignore
    const t2023 = allTraffic.filter(r => r.year === 2023);
    // @ts-ignore
    totalAccidents = t2023.reduce((sum, r) => sum + (r.fatal_accidents || 0), 0);

    // ————— Multas (solo ITV) —————
    const fines2023 = await fetch(`${FINES_API}?year=2023`).then(r => r.json());
    // @ts-ignore
    totalFines = fines2023.reduce((sum, r) => sum + (r.itv || 0), 0);

    // ————— Accidentes con Animales —————
    let allAnimals = await fetch(ANIMALS_API).then(r => r.json());
    if (!allAnimals.length) {
      await fetch(`${ANIMALS_API}/loadInitialData`);
      allAnimals = await fetch(ANIMALS_API).then(r => r.json());
    }
    // @ts-ignore
    const a2023 = allAnimals.filter(r => r.anyo === 2023);
    totalAnimal = a2023.length;

    drawChart();
  }

  function drawChart() {
    // Preparamos la tabla de datos
    // @ts-ignore
    const data = google.visualization.arrayToDataTable([
      ['Categoría', 'Total'],
      ['Tráfico' , totalAccidents],
      ['Multas'  , totalFines],
      ['Animales', totalAnimal]
    ]);

    // Opciones de gráfico: escala logarítmica para que se vean bien
    const options = {
      title:     'Comparativa 2023 (ITV vs Tráfico vs Animales)',
      chartArea: { width: '65%' },
      hAxis: {
        title:    'Total de Incidencias',
        logScale: true
      },
      vAxis: { title: 'Categoría' },
      legend: { position: 'none' }
    };

    // Dibujamos el BarChart horizontal
    // @ts-ignore
    new google.visualization.BarChart(
      document.getElementById('analytics-chart')
    ).draw(data, options);
  }
</script>

<style>
  .container {
    max-width: 800px;
    margin: 2rem auto;
    text-align: center;
  }
  #analytics-chart {
    height: 500px;
  }
</style>

<div class="container">
  <h2>Analytics SOS2425</h2>
  <div id="analytics-chart"></div>
</div>
