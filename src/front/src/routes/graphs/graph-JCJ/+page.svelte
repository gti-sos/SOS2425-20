<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/traffic-accidents";
    if (dev) API = DEVEL_HOST + API;

    // @ts-ignore
    let trafficAccidents = [];
    /** @type {string[]} */
    let trafficCommunities = [];
    let selectedCommunity = "";

    let data2022 = [];
    let data2023 = [];

    async function getData() {
        try {
            const res = await fetch(API);
            let data = await res.json();

            // Si no hay datos, carga los datos iniciales automáticamente
            if (data.length === 0) {
                const initRes = await fetch(API + "/loadInitialData", { method: "GET" });
                if (initRes.ok) {
                    data = await initRes.json();
                    console.log("Datos iniciales cargados automáticamente.");
                } else {
                    console.error("No se pudieron cargar los datos iniciales.");
                }
            }

            trafficAccidents = data;

            // Sacamos las comunidades sin repetir
            // @ts-ignore
            trafficCommunities = [...new Set(trafficAccidents.map(d => d.autonomous_community))].sort();

            drawChart();
        } catch (error) {
            console.error("Error al cargar datos de la API", error);
        }
    }

    function drawChart() {
        const filtered = selectedCommunity
            // @ts-ignore
            ? trafficAccidents.filter(d => d.autonomous_community === selectedCommunity)
            // @ts-ignore
            : trafficAccidents;
            //Para que aparezcan ordenadas
            const communities = selectedCommunity
                ? [selectedCommunity]
                : [...new Set(filtered.map(d => d.autonomous_community))].sort();


        data2022 = communities.map(c => {
            const entry = filtered.find(d => d.autonomous_community === c && d.year === 2022);
            return {
                deceased: entry?.deceased || 0,
                vehicles_without_mot: entry?.vehicles_without_mot || 0
            };
        });

        data2023 = communities.map(c => {
            const entry = filtered.find(d => d.autonomous_community === c && d.year === 2023);
            return {
                deceased: entry?.deceased || 0,
                vehicles_without_mot: entry?.vehicles_without_mot || 0
            };
        });

        // @ts-ignore
        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Accidentes de tráfico por comunidad y año'
            },
            xAxis: {
                categories: communities,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Cantidad'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        // @ts-ignore
                        color: Highcharts.defaultOptions.title?.style?.color || 'gray'
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [
                {
                    name: 'Fallecidos (2022)',
                    data: data2022.map(d => d.deceased)
                },
                {
                    name: 'Sin ITV (2022)',
                    data: data2022.map(d => d.vehicles_without_mot)
                },
                {
                    name: 'Fallecidos (2023)',
                    data: data2023.map(d => d.deceased)
                },
                {
                    name: 'Sin ITV (2023)',
                    data: data2023.map(d => d.vehicles_without_mot)
                }
            ]
        });
    }

    onMount(getData);
</script>

<!-- Filtro de comunidad -->
<div style="margin-bottom: 1rem;">
    <label for="community-select">Filtrar por comunidad: </label>
    <select id="community-select" bind:value={selectedCommunity} on:change={drawChart}>
        <option value="">Todas</option>
        {#each trafficCommunities as c}
            <option value={c}>{c}</option>
        {/each}
    </select>
</div>

<!-- Gráfico -->
<figure class="highcharts-figure">
    <div id="container" style="height: 500px;"></div>
    <p class="highcharts-description">
        Comparación de fallecidos y vehículos sin ITV por comunidad autónoma en los años 2022 y 2023.
    </p>
</figure>
