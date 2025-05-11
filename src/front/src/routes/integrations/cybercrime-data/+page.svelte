<svelte:head>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</svelte:head>

<script>
  import { onMount } from 'svelte';

  let chart;

  onMount(async () => {
    // @ts-ignore
    google.charts.load('current', { packages: ['corechart'] });
    // @ts-ignore
    google.charts.setOnLoadCallback(drawChart);
  });

  async function drawChart() {
    try {
      // Fetch datos de ambas APIs
      const [resFines, resCyber] = await Promise.all([
        fetch('https://sos2425-20.onrender.com/api/v1/fines'),
        fetch('https://sos2425-14.onrender.com/api/v1/cybercrime-data')
      ]);

      const finesData = await resFines.json();
      const cyberData = await resCyber.json();

      // Filtrar por el año 2023
      // @ts-ignore
      const fines2023 = finesData.filter(d => d.year === 2023);
      // @ts-ignore
      const cyber2023 = cyberData.filter(d => d.year === 2023);

      // Calcular totales
      // @ts-ignore
      const totalItv = fines2023.reduce((sum, d) => sum + (d.itv || 0), 0);
      // @ts-ignore
      const totalAlcohol = fines2023.reduce((sum, d) => sum + (d.alcohol_rate || 0), 0);
      // @ts-ignore
      const totalRadar = fines2023.reduce((sum, d) => sum + (d.fixed_radar || 0), 0);

      // @ts-ignore
      const totalDelitos = cyber2023.reduce((sum, d) => sum + (d.criminal_ofense || 0), 0);
      // @ts-ignore
      const totalDetenidos = cyber2023.reduce((sum, d) => sum + (d.arrested_investigated || 0), 0);
      // @ts-ignore
      const totalVictimas = cyber2023.reduce((sum, d) => sum + (d.cybersecurity || 0), 0);

      // @ts-ignore
      const data = google.visualization.arrayToDataTable([
        ['Categoría', 'Cantidad'],
        ['Multas por ITV', totalItv],
        ['Multas por Alcohol', totalAlcohol],
        ['Multas por Radares', totalRadar],
        ['Delitos cibernéticos', totalDelitos],
        ['Detenidos', totalDetenidos],
        ['Ciberseguridad', totalVictimas]
      ]);

      const options = {
        title: 'Comparación de Multas vs Ciberdelincuencia (2023)',
        pieHole: 0.4
      };

      // @ts-ignore
      chart = new google.visualization.PieChart(document.getElementById('donut-chart'));
      chart.draw(data, options);
    } catch (err) {
      console.error('Error al procesar datos:', err);
    }
  }
</script>

<style>
  .chart-container {
    max-width: 700px;
    margin: 2rem auto;
    text-align: center;
  }
  #donut-chart {
    height: 500px;
  }
</style>

<div class="chart-container">
  <h2>Comparativa Anual de Multas y Delitos Informáticos (2023)</h2>
  <div id="donut-chart"></div>
</div>
