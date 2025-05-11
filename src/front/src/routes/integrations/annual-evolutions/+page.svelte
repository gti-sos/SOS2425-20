<script>
  import { onMount } from 'svelte';

  // Referencia al chart para poder destruirlo si hiciera falta
  let chart;

  onMount(async () => {
    // 1) Cargar librería C3 y su CSS
    // @ts-ignore
    const c3 = await import('c3');
    await import('c3/c3.css');

    // 2) Obtener datos de accidentes de tráfico
    let accidentsRes = await fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents");
    let accidents = await accidentsRes.json();
    // Si no hay datos, cargar iniciales
    if (accidents.length === 0) {
      const init = await fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents/loadInitialData");
      if (init.ok) accidents = await init.json();
    }
    // Filtrar únicamente el año 2022
    // @ts-ignore
    accidents = accidents.filter(d => d.year === 2022);

    // 3) Obtener datos de evoluciones anuales
    let energyRes = await fetch("https://sos2425-12.onrender.com/api/v1/annual-evolutions");
    let energy = await energyRes.json();
    // Filtrar únicamente el año 2022
    // @ts-ignore
    energy = energy.filter(d => d.year === 2022);

    // 4) Agrupar accidentes por comunidad autónoma
    const accGrouped = {};
    // @ts-ignore
    accidents.forEach(d => {
      // @ts-ignore
      accGrouped[d.autonomous_community] = (accGrouped[d.autonomous_community] || 0)
        + (d.fatal_accidents || 0);
    });

    // 5) Agrupar factor de carga por comunidad autónoma
    const loadGrouped = {};
    // @ts-ignore
    energy.forEach(d => {
      // @ts-ignore
      loadGrouped[d.aacc] = (loadGrouped[d.aacc] || 0)
        + (d.load_factor || 0);
    });

    // 6) Lista única y ordenada de todas las comunidades
    const allCommunities = Array.from(new Set([
      ...Object.keys(accGrouped),
      ...Object.keys(loadGrouped)
    ])).sort();

    // 7) Preparar los datos en formato C3
    // Etiqueta + valores de accidentes
    // @ts-ignore
    const accData  = ['Accidentes mortales (2022)', ...allCommunities.map(c => accGrouped[c] || 0)];
    // Etiqueta + valores de factor de carga
    // @ts-ignore
    const loadData = ['Factor de carga (%) (2022)',  ...allCommunities.map(c => loadGrouped[c]  || 0)];

    // 8) Generar el gráfico de barras
    chart = c3.generate({
      bindto: '#c3chart',
      data: {
        columns: [accData, loadData],
        type: 'bar'
      },
      axis: {
        x: {
          type: 'category',
          categories: allCommunities,
          tick: { rotate: 75, multiline: false },
          height: 80
        },
        y: {
          label: 'Valores'
        }
      },
      bar: { width: { ratio: 0.6 } },
      tooltip: { grouped: true }
    });
  });
</script>

<style>
  /* Centrar y limitar ancho del contenedor del gráfico */
  #c3chart {
    max-width: 1000px;
    margin: auto;
  }
</style>

<h2 style="text-align: center;">Accidentes vs Factor de Carga (2022)</h2>
<!-- Div donde se renderiza el gráfico -->
<div id="c3chart"></div>
