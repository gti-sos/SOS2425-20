<!-- src/routes/integrations/traffic-vs-water-projects/+page.svelte -->
<svelte:head>
  <title>Accidentes vs Proyectos de Agua</title>
  <!-- Google Charts desde CDN -->
  <script src="https://www.gstatic.com/charts/loader.js"></script>
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  // URLs de las APIs
  const TRAFFIC_API = dev
    ? 'http://localhost:16078/api/v1/traffic-accidents'
    : '/api/v1/traffic-accidents';
  const WATER_API = 'https://sos2425-13.onrender.com/api/v1/water-supply-improvements';

  // Normalización y alias para unificar variantes
  // @ts-ignore
  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const alias = {
    catalunia: 'cataluna',
    'castilla la mancha': 'castilla-la mancha',
    valencia: 'comunidad valenciana',
    'comunitat valenciana': 'comunidad valenciana'
  };
  // @ts-ignore
  function keyOf(str) {
    const k = normalize(str);
    // @ts-ignore
    return alias[k] ?? k;
  }

  // Nombres bonitos para el gráfico
  const prettyNames = {
    andalucia: 'Andalucía',
    aragon: 'Aragón',
    asturias: 'Asturias',
    baleares: 'Baleares',
    canarias: 'Canarias',
    cantabria: 'Cantabria',
    'castilla y leon': 'Castilla y León',
    'castilla-la mancha': 'Castilla-La Mancha',
    cataluna: 'Cataluña',
    extremadura: 'Extremadura',
    galicia: 'Galicia',
    madrid: 'Madrid',
    murcia: 'Murcia',
    navarra: 'Navarra',
    'la rioja': 'La Rioja',
    'comunidad valenciana': 'Comunitat Valenciana',
    'pais vasco': 'País Vasco',
    'ceuta y melilla': 'Ceuta y Melilla'
  };

  onMount(async () => {
    // @ts-ignore
    google.charts.load('current', { packages: ['corechart'] });
    // @ts-ignore
    google.charts.setOnLoadCallback(fetchAndDraw);
  });

  async function fetchAndDraw() {
    // Fetch en paralelo
    let [tRes, wRes] = await Promise.all([
      fetch(TRAFFIC_API),
      fetch(WATER_API)
    ]);
    let [traffic, water] = await Promise.all([tRes.json(), wRes.json()]);

    // Load initial data si está vacío
    if (!traffic.length) {
      await fetch(`${TRAFFIC_API}/loadInitialData`);
      traffic = await fetch(TRAFFIC_API).then(r => r.json());
    }
    if (!water.length) {
      await fetch(`${WATER_API}/loadInitialData`);
      water = await fetch(WATER_API).then(r => r.json());
    }

    // Sumar fatal_accidents por comunidad
    const totalsAcc = {};
    // @ts-ignore
    traffic.forEach(d => {
      const k = keyOf(d.autonomous_community);
      // @ts-ignore
      totalsAcc[k] = (totalsAcc[k] || 0) + (d.fatal_accidents || 0);
    });

    // Sumar project_count por comunidad
    const totalsProj = {};
    // @ts-ignore
    water.forEach(d => {
      const k = keyOf(d.autonomous_community);
      // @ts-ignore
      totalsProj[k] = (totalsProj[k] || 0) + (d.project_count || 0);
    });

    // Unir y ordenar claves
    const allKeys = Array.from(new Set([
      ...Object.keys(totalsAcc),
      ...Object.keys(totalsProj)
    ])).sort();

    // Construir filas de datos
    const rows = allKeys.map(key => [
      // @ts-ignore
      prettyNames[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
      // @ts-ignore
      totalsAcc[key] || 0,
      // @ts-ignore
      totalsProj[key] || 0
    ]);

    // DataTable para Google Charts
    // @ts-ignore
    const data = google.visualization.arrayToDataTable([
      ['Comunidad', 'Accidentes mortales', 'Proyectos de Agua'],
      ...rows
    ]);

    // Opciones del ColumnChart
    const options = {
      title: 'Accidentes vs Proyectos de Suministro de Agua',
      chartArea: { left: 120, top: 50, width: '80%' },
      hAxis: {
        title: 'Cantidad',
        slantedText: true,
        slantedTextAngle: 45
      },
      vAxis: { title: 'Comunidad autónoma' },
      legend: { position: 'top' }
    };

    // Dibujar ColumnChart (barras verticales)
    // @ts-ignore
    new google.visualization.ColumnChart(
      document.getElementById('chart')
    ).draw(data, options);
  }
</script>

<style>
  .container {
    max-width: 1200px;
    margin: 2rem auto;
    text-align: center;
  }
  #chart {
    width: 100%;
    height: 600px;
  }
</style>

<div class="container">
  <h2>Accidentes vs Proyectos de Agua</h2>
  <div id="chart"></div>
</div>
