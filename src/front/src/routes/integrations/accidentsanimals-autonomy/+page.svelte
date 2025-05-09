<script>
  import { onMount } from 'svelte';

  onMount(async () => {
    // Cargar Google Charts
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });

    // Cargar el paquete corechart
    // @ts-ignore
    google.charts.load('current', { packages: ['corechart'] });
    // @ts-ignore
    google.charts.setOnLoadCallback(drawChart);

    // @ts-ignore
    function normalize(str) {
      return str
        .toLowerCase()
        .normalize("NFD")               // Elimina acentos
        .replace(/[\u0300-\u036f]/g, "") // Elimina marcas diacríticas
        .replace(/\s+/g, '')             // Elimina espacios
        .replace(/-/g, '');              // Elimina guiones
    }

    async function drawChart() {
      const accRes = await fetch("https://sos2425-20.onrender.com/api/v1/accidents-with-animals");
      const autonomyRes = await fetch("https://sos2425-11.onrender.com/api/v1/autonomy-dependence-applications");

      const accidents = await accRes.json();
      const autonomy = await autonomyRes.json();

      // Filtrar por año 2023
      // @ts-ignore
      const acc2023 = accidents.filter(d => d.anyo === 2023);

      // Agrupar accidentes por comunidad
      // @ts-ignore
      const accidentsByAutonomy = acc2023.reduce((acc, d) => {
        const community = d.autonomous_community;
        if (!acc[community]) acc[community] = 0;
        acc[community]++;
        return acc;
      }, {});

      // Agrupar población por comunidad
      // @ts-ignore
      const populationByPlace = autonomy.reduce((acc, d) => {
        const place = d.place;
        const population = d['population'] || 0;
        acc[place] = population;
        return acc;
      }, {});

      // Preparar datos para Google Charts
      const chartData = [['Comunidad Autónoma', 'Accidentes', 'Población']];
      for (const community in accidentsByAutonomy) {
        const normalizedCommunity = normalize(community);
        const populationEntry = Object.entries(populationByPlace).find(
          ([place]) => normalize(place) === normalizedCommunity
        );
        const population = populationEntry ? populationEntry[1] : 0;

        chartData.push([
          community,
          accidentsByAutonomy[community],
          population
        ]);
      }

      // Crear el gráfico
      // @ts-ignore
      const data = google.visualization.arrayToDataTable(chartData);

      const options = {
        title: 'Accidentes con Animales vs Población (2023)',
        chartArea: { width: '70%' },
        hAxis: {
          title: 'Cantidad',
          minValue: 0,
          viewWindow: {
            min: 0,
            max: 10
          }
        },
        vAxis: {
          title: 'Comunidad Autónoma'
        },
        bars: 'horizontal',
        colors: ['#ff7f0e', '#1f77b4']
      };

      // Dibujar el gráfico
      // @ts-ignore
      const chart = new google.visualization.BarChart(document.getElementById('chart_div'));
      chart.draw(data, options);
    }
  });
</script>

<style>
  #chart_div {
    width: 100%;
    max-width: 900px;
    height: 600px;
    margin: auto;
  }
</style>

<h2 style="text-align: center;">Accidentes con animales vs Población por Comunidad Autónoma en 2023</h2>
<div id="chart_div"></div>
