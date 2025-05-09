<svelte:head>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</svelte:head>

<script>
  import { onMount } from "svelte";

  // @ts-ignore
  let mergedData = [];

  async function getData() {
    try {
      const resFines = await fetch("https://sos2425-20.onrender.com/api/v1/fines");
      const resRadars = await fetch("https://sos2425-10.onrender.com/api/v1/radars-stats");

      let fines = await resFines.json();
      let radars = await resRadars.json();

      // Filtrar solo año 2023
      // @ts-ignore
      fines = fines.filter((d) => d.year === 2023);
      // @ts-ignore
      radars = radars.filter((d) => d.year === 2023);

      const allLocations = [...new Set([
        // @ts-ignore
        ...fines.map((d) => d.city),
        // @ts-ignore
        ...radars.map((d) => d.province)
      ])].sort();

      mergedData = allLocations.map((name) => {
        // @ts-ignore
        const fine = fines.find((f) => f.city === name);
        // @ts-ignore
        const radar = radars.find((r) => r.province === name);

        return [
          name,
          fine?.fixed_radar || 0,
          radar?.complaint || 0
        ];
      });

      // @ts-ignore
      google.charts.load('current', { packages: ['corechart'] });
      // @ts-ignore
      google.charts.setOnLoadCallback(drawChart);
    } catch (error) {
      console.error("Error al cargar o procesar datos:", error);
    }
  }

  function drawChart() {
    if (!mergedData.length) return;

    // @ts-ignore
    const data = google.visualization.arrayToDataTable([
      ['Ciudad/Provincia', 'Multas por Radares Fijos', 'Acciones Sancionadas'],
      // @ts-ignore
      ...mergedData
    ]);

    const options = {
      title: 'Multas vs. Sanciones por Ciudad/Provincia (2023)',
      hAxis: {
        title: 'Ciudad / Provincia',
        slantedText: true,
        slantedTextAngle: 45
      },
      vAxis: {
        title: 'Cantidad',
        minValue: 0
      },
      legend: { position: 'top' },
      bar: { groupWidth: '75%' },
      isStacked: false
    };

    // @ts-ignore
    const chart = new google.visualization.ColumnChart(document.getElementById("chart_div"));
    chart.draw(data, options);
  }

  onMount(getData);
</script>

<figure>
  <div id="chart_div" style="width: 100%; height: 600px;"></div>
  <p>
    Comparación de multas por radares fijos (API de multas) y acciones sancionadas (API de radares) en el año 2023, agrupadas por ciudad o provincia.
  </p>
</figure>
