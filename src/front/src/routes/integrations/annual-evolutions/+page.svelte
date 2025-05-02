<script>
    import { onMount } from 'svelte';
    let chart;
  
    onMount(async () => {
      // @ts-ignore
      const c3 = await import('c3');
      await import('c3/c3.css');
  
      // Fetch a ambas APIs
      let accidentsRes = await fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents");
      let accidents = await accidentsRes.json();

      // Si está vacío, se hace loadInitialData
      if (accidents.length === 0) {
        const init = await fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents/loadInitialData");
        if (init.ok) {
          accidents = await init.json();
          console.log("Datos de accidentes cargados automáticamente");
        } else {
          console.error(" Error al cargar datos de accidentes");
        }
      }

      const energyRes = await fetch("https://sos2425-12.onrender.com/api/v1/annual-evolutions");
      const energy = await energyRes.json();

  
      // Agrupar accidentes por comunidad
      const accGrouped = {};
      // @ts-ignore
      accidents.forEach(d => {
        // @ts-ignore
        accGrouped[d.autonomous_community] = (accGrouped[d.autonomous_community] || 0) + (d.fatal_accidents || 0);
      });
  
      // Agrupar potencia por comunidad
      const energyGrouped = {};
      // @ts-ignore
      energy.forEach(d => {
        // @ts-ignore
        energyGrouped[d.aacc] = (energyGrouped[d.aacc] || 0) + (d.installed_power || 0);
      });
  
      // Obtener conjunto único de comunidades
      const allCommunities = Array.from(new Set([
        ...Object.keys(accGrouped),
        ...Object.keys(energyGrouped)
      ])).sort();
  
      // Formato para C3
      // @ts-ignore
      const accData = ['Accidentes mortales', ...allCommunities.map(c => accGrouped[c] || 0)];
      // @ts-ignore
      const energyData = ['Potencia instalada (MW)', ...allCommunities.map(c => energyGrouped[c] || 0)];
  
      chart = c3.generate({
        bindto: '#c3chart',
        data: {
          columns: [accData, energyData],
          type: 'bar',
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
  
  <h2 style="text-align: center;">Accidentes vs Potencia Instalada</h2>
  <div id="c3chart"></div>
  