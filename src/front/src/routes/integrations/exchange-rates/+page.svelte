<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dc/4.2.4/dc.min.css" />
  <script src="https://d3js.org/d3.v5.min.js"></script>
  <script src="https://unpkg.com/crossfilter2@1.5.4/crossfilter.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dc/4.2.4/dc.min.js"></script>
</svelte:head>

<script>
  import { onMount } from 'svelte';

  const CURRENCIES_TO_SHOW = ["EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD", "MXN"];

  onMount(async () => {
    try {
      const res = await fetch("https://currency-conversion-and-exchange-rates.p.rapidapi.com/latest?base=USD", {
        method: "GET",
        headers: {
          "x-rapidapi-host": "currency-conversion-and-exchange-rates.p.rapidapi.com",
          "x-rapidapi-key": "b1258f1f0fmsh4a41fefa679cdbcp17a760jsn7570e2be7aa0"
        }
      });

      const data = await res.json();
      const rates = Object.entries(data.rates)
        .filter(([currency]) => CURRENCIES_TO_SHOW.includes(currency))
        .map(([currency, rate]) => ({
          currency,
          rate: parseFloat(rate)
        }));

        // @ts-ignore
      const ndx = crossfilter(rates);
      // @ts-ignore
      const dim = ndx.dimension(d => d.currency);
      // @ts-ignore
      const group = dim.group().reduceSum(d => d.rate);

      // @ts-ignore
      const chart = dc.barChart("#chart");

      chart
        .width(800)
        .height(400)
        .dimension(dim)
        .group(group)
        // @ts-ignore
        .x(d3.scaleBand())
        // @ts-ignore
        .xUnits(dc.units.ordinal)
        .brushOn(false)
        .xAxisLabel("Moneda")
        .yAxisLabel("Tasa respecto al USD")
        .barPadding(0.2)
        .outerPadding(0.05)
        .renderLabel(true)
        .renderHorizontalGridLines(true)
        .elasticY(true);

        // @ts-ignore
      chart.on('renderlet', function (chart) {
        chart.selectAll('g.x text')
          .attr('transform', 'translate(-10,10) rotate(-45)')
          .style('text-anchor', 'end')
          .style('font-size', '11px');
      });

      // @ts-ignore
      dc.renderAll();
    } catch (err) {
      console.error("Error al cargar la API de divisas:", err);
    }
  });
</script>

<figure>
  <h2 style="text-align: center; margin-bottom: 1rem;">
    Tasas de cambio frente al dólar estadounidense (USD)
  </h2>
  <div id="chart"></div>
  <p>
    Comparación de tasas de cambio actuales respecto al USD. Monedas principales seleccionadas.
  </p>
</figure>
