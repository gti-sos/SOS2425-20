<svelte:head>
  <script src="https://d3js.org/d3.v7.min.js"></script>
</svelte:head>


<script>
  import { onMount } from 'svelte';

  // @ts-ignore
  let svgContainer;

  onMount(async () => {
    try {
      const response = await fetch('https://covid-193.p.rapidapi.com/statistics?country=Spain', {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'covid-193.p.rapidapi.com',
          'x-rapidapi-key': 'b1258f1f0fmsh4a41fefa679cdbcp17a760jsn7570e2be7aa0' // Reemplaza con tu clave
        }
      });

      const data = await response.json();
      const stats = data.response[0];

      const chartData = [
        { name: 'Activos', value: stats.cases.active },
        { name: 'Recuperados', value: stats.cases.recovered },
        { name: 'Fallecidos', value: stats.deaths.total }
      ];

      drawPieChart(chartData);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  });

  // @ts-ignore
  function drawPieChart(data) {
    const width = 450;
    const height = 450;
    const radius = Math.min(width, height) / 2;

    // @ts-ignore
    const svg = d3.select(svgContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

      // @ts-ignore
    const color = d3.scaleOrdinal()
    // @ts-ignore
      .domain(data.map(d => d.name))
      // @ts-ignore
      .range(d3.schemeCategory10);

      // @ts-ignore
    const pie = d3.pie().value(d => d.value);

    // @ts-ignore
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g');

    arcs.append('path')
      .attr('d', arc)
      // @ts-ignore
      .attr('fill', d => color(d.data.name));

    arcs.append('text')
    // @ts-ignore
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      // @ts-ignore
      .text(d => d.data.name);
  }
</script>


<style>
  .chart-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 90vh;
    text-align: center;
  }

  h2 {
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }

  figcaption {
    margin-top: 1rem;
    font-style: italic;
  }
</style>

<div class="chart-wrapper">
  <h2>Distribución de casos COVID-19 en España</h2>
  <figure>
    <div bind:this={svgContainer}></div>
    <figcaption>Activos, recuperados y fallecidos</figcaption>
  </figure>
</div>
