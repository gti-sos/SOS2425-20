<script>
  import { onMount } from 'svelte';
  let chart;

  onMount(async () => {
    // @ts-ignore
    // @ts-ignore
    const c3 = await import('c3');
    await import('c3/c3.css');

    // 1) Traffic Accidents (solo 2022)
    let accidentsRes = await fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents");
    let accidents = await accidentsRes.json();
    if (accidents.length === 0) {
      const init = await fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents/loadInitialData");
      if (init.ok) accidents = await init.json();
    }
    // Filtrar solo 2022
    // @ts-ignore
    accidents = accidents.filter(d => d.year === 2022);

    // 2) Annual Evolutions (solo 2022)
    let energyRes = await fetch("https://sos2425-12.onrender.com/api/v1/annual-evolutions");
    let energy = await energyRes.json();
    // Filtrar solo 2022
    // @ts-ignore
    energy = energy.filter(d => d.year === 2022);

    // 3) Agrupar accidentes por comunidad
    const accGrouped = {};
    // @ts-ignore
    accidents.forEach(d => {
      // @ts-ignore
      accGrouped[d.autonomous_community] = (accGrouped[d.autonomous_community] || 0)
        + (d.fatal_accidents || 0);
    });

    // 4) Agrupar factor de carga por comunidad
    const loadGrouped = {};
    // @ts-ignore
    energy.forEach(d => {
      // @ts-ignore
      loadGrouped[d.aacc] = (loadGrouped[d.aacc] || 0)
        + (d.load_factor || 0);
    });

    // 5) Conjunto único de comunidades
    const allCommunities = Array.from(new Set([
      ...Object.keys(accGrouped),
      ...Object.keys(loadGrouped)
    ])).sort();

    // 6) Formato para C3
    // @ts-ignore
    const accData  = ['Accidentes mortales (2022)', ...allCommunities.map(c => accGrouped[c] || 0)];
    // @ts-ignore
    const loadData = ['Factor de carga (%) (2022)',  ...allCommunities.map(c => loadGrouped[c]  || 0)];

    // 7) Generar gráfico
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
  #c3chart {
    max-width: 1000px;
    margin: auto;
  }
</style>

<h2 style="text-align: center;">Accidentes vs Factor de Carga (2022)</h2>
<div id="c3chart"></div>
