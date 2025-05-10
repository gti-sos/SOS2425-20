<script>
  import { onMount } from 'svelte';

  let chart;

  onMount(async () => {
    // Cargar ECharts dinámicamente
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });

    // @ts-ignore
    const echarts = window.echarts;

    // @ts-ignore
    function normalize(str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '')
        .replace(/-/g, '');
    }

    async function getData() {
      const API = "https://sos2425-20.onrender.com/api/v1/accidents-with-animals";
      // @ts-ignore
      let data = [];

      try {
        const res = await fetch(API);
        // @ts-ignore
        let result = await res.json();

        if (result.length === 0) {
          const init = await fetch(API + "/loadInitialData");
          if (init.ok) {
            // @ts-ignore
            result = await init.json();
          }
        }

        data = result;
        return data;
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }

      return data;
    }

    async function drawChart() {
      const accRes = await getData();
      const autonomyRes = await fetch("https://sos2425-11.onrender.com/api/v1/autonomy-dependence-applications");
      // @ts-ignore
      const autonomy = await autonomyRes.json();

      // Filtrar por 2023
      // @ts-ignore
      const acc2023 = accRes.filter(d => d.anyo === 2023);

      // @ts-ignore
      const accidentsByAutonomy = acc2023.reduce((acc, d) => {
        const community = d.autonomous_community;
        if (!acc[community]) acc[community] = 0;
        acc[community]++;
        return acc;
      }, {});

      // @ts-ignore
      const populationByPlace = autonomy.reduce((acc, d) => {
        const place = d.place;
        const population = d['population'] || 0;
        acc[place] = population;
        return acc;
      }, {});

      const communities = [];
      const accidents = [];
      const populations = [];

      for (const community in accidentsByAutonomy) {
        const normalizedCommunity = normalize(community);
        const populationEntry = Object.entries(populationByPlace).find(
          // @ts-ignore
          ([place]) => normalize(place) === normalizedCommunity
        );
        const population = populationEntry ? populationEntry[1] : 0;

        communities.push(community);
        accidents.push(accidentsByAutonomy[community]);
        populations.push(population);
      }

      // @ts-ignore
      chart = echarts.init(document.getElementById('chart_div'));

      const option = {
        title: {
          text: 'Accidentes con Animales vs Población (2023)',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Accidentes', 'Población'],
          bottom: 10
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'log',
          name: 'Cantidad',
          logBase: 10,
          minorTick: { show: true },
          minorSplitLine: { show: true },
          axisLabel: {
            // @ts-ignore
            formatter: function (val) {
              return val < 1000 ? val : val.toLocaleString();
            }
          }
        },
        yAxis: {
          type: 'category',
          data: communities,
          name: 'Comunidad Autónoma'
        },
        series: [
          {
            name: 'Accidentes',
            type: 'bar',
            data: accidents,
            itemStyle: { color: '#ff7f0e' }
          },
          {
            name: 'Población',
            type: 'bar',
            data: populations,
            itemStyle: { color: '#1f77b4' }
          }
        ]
      };

      chart.setOption(option);
    }

    drawChart();
  });
</script>

<style>
  #chart_div {
    width: 100%;
    max-width: 960px;
    height: 600px;
    margin: auto;
  }
</style>

<h2 style="text-align: center;">Accidentes con animales vs Población por Comunidad Autónoma en 2023</h2>
<div id="chart_div"></div>
