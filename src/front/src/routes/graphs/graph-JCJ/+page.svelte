<svelte:head>
  <!-- Cargamos Highcharts y módulos necesarios desde CDN -->
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/exporting.js"></script>
  <script src="https://code.highcharts.com/modules/export-data.js"></script>
  <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { dev } from "$app/environment";

  // URL base de la API: en desarrollo apunta al backend local
  let DEVEL_HOST = "http://localhost:16078";
  let API = "/api/v1/traffic-accidents";
  if (dev) API = DEVEL_HOST + API;

  // Array con todos los registros de la API
  // @ts-ignore
  let trafficAccidents = [];
  // Lista de comunidades para el selector
  /**
	 * @type {any[]}
	 */
  let trafficCommunities = [];
  // Comunidad actualmente seleccionada (vacío = todas)
  let selectedCommunity = "";

  let data2022 = [];
  let data2023 = [];

  // Función que recupera los datos y dispara el dibujo
  async function getData() {
    try {
      // 1) Fetch a la API principal
      const res = await fetch(API);
      let data = await res.json();

      // 2) Si está vacío, cargamos datos iniciales automáticamente
      if (data.length === 0) {
        const initRes = await fetch(API + "/loadInitialData");
        if (initRes.ok) {
          data = await initRes.json();
          console.log("Datos iniciales cargados automáticamente.");
        } else {
          console.error("No se pudieron cargar los datos iniciales.");
        }
      }

      // 3) Guardamos los datos en la variable reactiva
      trafficAccidents = data;

      // 4) Generamos la lista de comunidades sin duplicados
      trafficCommunities = [
        // @ts-ignore
        ...new Set(trafficAccidents.map(d => d.autonomous_community))
      ].sort();

      // 5) Dibujamos el gráfico con estos datos
      drawChart();
    } catch (error) {
      console.error("Error al cargar datos de la API", error);
    }
  }

  // Función que configura y dibuja el gráfico
  function drawChart() {
    // 1) Filtramos por la comunidad seleccionada (o todas)
    const filtered = selectedCommunity
      // @ts-ignore
      ? trafficAccidents.filter(d => d.autonomous_community === selectedCommunity)
      // @ts-ignore
      : trafficAccidents;

    // 2) Obtenemos el array ordenado de comunidades a mostrar
    const communities = selectedCommunity
      ? [selectedCommunity]
      : [...new Set(filtered.map(d => d.autonomous_community))].sort();

    // 3) Preparamos los datos para 2022: fallecidos y sin ITV
    data2022 = communities.map(c => {
      const entry = filtered.find(d => d.autonomous_community === c && d.year === 2022);
      return {
        deceased:             entry?.deceased || 0,
        vehicles_without_mot: entry?.vehicles_without_mot || 0
      };
    });

    // 4) Preparamos los datos para 2023
    data2023 = communities.map(c => {
      const entry = filtered.find(d => d.autonomous_community === c && d.year === 2023);
      return {
        deceased:             entry?.deceased || 0,
        vehicles_without_mot: entry?.vehicles_without_mot || 0
      };
    });

    // 5) Configuramos el chart de tipo 'column' y stacking normal
    // @ts-ignore
    Highcharts.chart("container", {
      chart: {
        type: "column"
      },
      title: {
        text: "Accidentes de tráfico por comunidad y año"
      },
      xAxis: {
        categories: communities,
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: "Cantidad"
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: "bold",
            color:
              // @ts-ignore
              Highcharts.defaultOptions.title?.style?.color || "gray"
          }
        }
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat:
          "{series.name}: {point.y}<br/>Total: {point.stackTotal}"
      },
      plotOptions: {
        column: {
          stacking: "normal",
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [
        {
          name: "Fallecidos (2022)",
          data: data2022.map(d => d.deceased)
        },
        {
          name: "Sin ITV (2022)",
          data: data2022.map(d => d.vehicles_without_mot)
        },
        {
          name: "Fallecidos (2023)",
          data: data2023.map(d => d.deceased)
        },
        {
          name: "Sin ITV (2023)",
          data: data2023.map(d => d.vehicles_without_mot)
        }
      ]
    });
  }

  // Al montar el componente, arrancamos la carga de datos
  onMount(getData);
</script>

<!-- Selector para filtrar por comunidad -->
<div style="margin-bottom: 1rem;">
  <label for="community-select">Filtrar por comunidad: </label>
  <select
    id="community-select"
    bind:value={selectedCommunity}
    on:change={drawChart}
  >
    <option value="">Todas</option>
    {#each trafficCommunities as c}
      <option value={c}>{c}</option>
    {/each}
  </select>
</div>

<!-- Contenedor del gráfico -->
<figure class="highcharts-figure">
  <div id="container" style="height: 500px;"></div>
  <p class="highcharts-description">
    Comparación de fallecidos y vehículos sin ITV por comunidad autónoma en los años 2022 y 2023.
  </p>
</figure>
