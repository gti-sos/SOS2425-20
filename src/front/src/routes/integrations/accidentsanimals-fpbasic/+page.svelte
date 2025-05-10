<script>
  import { onMount } from 'svelte';

  const API = "https://sos2425-20.onrender.com/api/v1/accidents-with-animals"; // Asegúrate de que esta URL sea correcta

  // @ts-ignore
  let data = [];
  let communities = [];
  let years = [];

  // Función para obtener los datos de la API de accidentes
  async function getData() {
    try {
      const res = await fetch(API);
      let result = await res.json();

      if (result.length === 0) {
        const init = await fetch(API + "/loadInitialData");
        if (init.ok) {
          result = await init.json();
          console.log("Datos iniciales cargados automáticamente.");
        } else {
          console.error("Error al cargar datos iniciales.");
        }
      }

      data = result;
      // @ts-ignore
      communities = [...new Set(data.map(d => d.autonomous_community))].sort();
      // @ts-ignore
      years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }

  onMount(async () => {
    await getData(); // Cargar los datos de accidentes con animales

    // Cargar D3.js
    const d3 = await import('d3');

    // Fetch a la API de educación
    const eduRes = await fetch("https://sos2425-14.onrender.com/api/v1/education-data");
    let education = await eduRes.json();

    // Verificar los datos recibidos
    // @ts-ignore
    console.log('Accidents Data:', data);
    console.log('Education Data:', education);

    // Agrupar accidentes por comunidad
    const accByCommunity = {};
    // @ts-ignore
    data.forEach(d => {
      const comunidad = d.autonomous_community;
      // @ts-ignore
      accByCommunity[comunidad] = (accByCommunity[comunidad] || 0) + 1;
    });

    // Agrupar estudiantes FP básica por comunidad
    const fpByCommunity = {};
    // @ts-ignore
    education.forEach(d => {
      const comunidad = d.autonomous_community;
      // @ts-ignore
      fpByCommunity[comunidad] = (fpByCommunity[comunidad] || 0) + (parseInt(d.basic_fp) || 0);
    });

    // Unificar todas las comunidades presentes en ambas APIs
    const communities = Array.from(new Set([...Object.keys(accByCommunity), ...Object.keys(fpByCommunity)])).sort();

    const chartData = communities.map(c => ({
      community: c,
      // @ts-ignore
      accidents: accByCommunity[c] || 0,
      // @ts-ignore
      basic_fp: fpByCommunity[c] || 0
    }));

    // D3 Chart config
    const margin = { top: 50, right: 30, bottom: 120, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svgEl = d3.select('#d3chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
      .domain(chartData.map(d => d.community))
      .range([0, width])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(['Accidentes', 'FP Básica'])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      // @ts-ignore
      .domain([0, d3.max(chartData, d => Math.max(d.accidents, d.basic_fp)) * 1.1])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(['Accidentes', 'FP Básica'])
      .range(['#ff6b6b', '#4dabf7']);

    // Ejes
    svgEl.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(75)")
      .style("text-anchor", "start");

    svgEl.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Barras
    const bars = svgEl.selectAll('g.layer')
      .data(chartData)
      .enter()
      .append('g')
      // @ts-ignore
      .attr('transform', d => `translate(${x0(d.community)},0)`);

    bars.selectAll('rect')
      // @ts-ignore
      .data(d => [
        { key: 'Accidentes', value: d.accidents },
        { key: 'FP Básica', value: d.basic_fp }
      ])
      .enter()
      .append('rect')
      // @ts-ignore
      .attr('x', d => x1(d.key))
      // @ts-ignore
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      // @ts-ignore
      .attr('height', d => height - y(d.value))
      // @ts-ignore
      .attr('fill', d => color(d.key));

    // Leyenda
    const legend = svgEl.append("g")
      .attr("transform", `translate(0, -30)`);

    const legendItems = ['Accidentes', 'FP Básica'];

    legend.selectAll("rect")
      .data(legendItems)
      .enter()
      .append("rect")
      // @ts-ignore
      .attr("x", (d, i) => i * 150)
      .attr("width", 20)
      .attr("height", 20)
      // @ts-ignore
      .attr("fill", d => color(d));

    legend.selectAll("text")
      .data(legendItems)
      .enter()
      .append("text")
      // @ts-ignore
      .attr("x", (d, i) => i * 150 + 25)
      .attr("y", 15)
      // @ts-ignore
      .text(d => d)
      .style("font-size", "14px");
  });
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
  #d3chart {
    max-width: 1000px;
    margin: auto;
  }

  svg {
    font-family: sans-serif;
  }
</style>

<h2 style="text-align: center;">Accidentes con animales vs Estudiantes de FP Básica</h2>
<div id="d3chart"></div>
