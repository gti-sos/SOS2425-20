<script>
  import { onMount } from 'svelte';

  onMount(async () => {
    // @ts-ignore
    const d3 = await import('d3');

    // @ts-ignore
    const accRes = await fetch("https://sos2425-20.onrender.com/api/v1/accidents-with-animals");
    // @ts-ignore
    const transitRes = await fetch("https://sos2425-21.onrender.com/api/v1/public-transit-stats/");

    // @ts-ignore
    let accidents = await accRes.json();
    // @ts-ignore
    let transit = await transitRes.json();

    // Filtrar por año 2023
    // @ts-ignore
    const acc2023 = accidents.filter(d => d.anyo === 2023);
    // @ts-ignore
    const transit2023 = transit.filter(d => d.year === 2023 || d.year === "2023");

    // Contar total de accidentes y total de ticket-price
    // @ts-ignore
    const totalAccidents = acc2023.length;
    // @ts-ignore
    const totalTicketPrice = transit2023.reduce((sum, d) => {
      const ticketPrice = d['ticket-price'] || d['ticket_price'];
      const parsedTicketPrice = typeof ticketPrice === 'string' ? parseFloat(ticketPrice.replace(/[^\d.-]/g, '')) : ticketPrice;
      return sum + (parsedTicketPrice || 0);
    }, 0);

    // Datos para el gráfico
    const data = [
      { category: 'Accidents', value: totalAccidents },
      { category: 'Ticket Price', value: totalTicketPrice }
    ];

    // @ts-ignore
    const margin = { top: 40, right: 20, bottom: 50, left: 70 };
    // @ts-ignore
    const width = 600 - margin.left - margin.right;
    // @ts-ignore
    const height = 400 - margin.top - margin.bottom;

    // @ts-ignore
    const svg = d3.select('#d3chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // @ts-ignore
    const x = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, width])
      .padding(0.4);

    // @ts-ignore
    const y = d3.scaleLinear()
      // @ts-ignore
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height, 0]);

    // @ts-ignore
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(['#ff7f0e', '#1f77b4']);

    // Definir un área
    const area = d3.area()
      // @ts-ignore
      .x(d => x(d.category) + x.bandwidth() / 2)
      .y0(height)  // El área empieza desde el eje X (en la parte inferior)
      // @ts-ignore
      .y1(d => y(d.value));

    // Crear el área
    svg.append('path')
      .data([data])
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', '#1f77b4')
      .style('opacity', 0.5);

    // Ejes
    // @ts-ignore
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // @ts-ignore
    svg.append('g')
      .call(d3.axisLeft(y));

    // Etiquetas
    svg.selectAll("text.bar")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      // @ts-ignore
      .attr("x", d => x(d.category) + x.bandwidth() / 2)
      // @ts-ignore
      .attr("y", d => y(d.value) - 5)
      // @ts-ignore
      .text(d => d.value);
  });
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
  #d3chart {
    max-width: 800px;
    margin: auto;
  }

  svg {
    font-family: sans-serif;
  }
</style>

<h2 style="text-align: center;">Accidentes con animales vs Precio del ticket en 2023</h2>
<div id="d3chart"></div>
