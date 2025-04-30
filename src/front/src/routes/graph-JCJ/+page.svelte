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

    // Datos base
    // @ts-ignore
    let trafficAccidents = [];

    // Ejes y series
    // @ts-ignore
    let trafficCommunities = [];
    // @ts-ignore
    let data2022 = [];
    // @ts-ignore
    let data2023 = [];

    async function getData() {
        try {
            const res = await fetch(API);
            trafficAccidents = await res.json();

            // Obtener todas las comunidades únicas
            // @ts-ignore
            trafficCommunities = [...new Set(trafficAccidents.map(d => d.autonomous_community))].sort();

            // Para cada comunidad, buscar su dato de 2022 y 2023
            data2022 = trafficCommunities.map(c => {
                // @ts-ignore
                const entry = trafficAccidents.find(d => d.autonomous_community === c && d.year === 2022);
                return {
                    deceased: entry?.deceased || 0,
                    vehicles_without_mot: entry?.vehicles_without_mot || 0
                };
            });

            data2023 = trafficCommunities.map(c => {
                // @ts-ignore
                const entry = trafficAccidents.find(d => d.autonomous_community === c && d.year === 2023);
                return {
                    deceased: entry?.deceased || 0,
                    vehicles_without_mot: entry?.vehicles_without_mot || 0
                };
            });

        } catch (error) {
            console.error("Error al cargar datos de la API", error);
        }
    }

    onMount(async () => {
        await getData();

        // @ts-ignore
        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Accidentes de tráfico por comunidad y año'
            },
            xAxis: {
                // @ts-ignore
                categories: trafficCommunities,
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
                    // @ts-ignore
                    data: data2022.map(d => d.deceased)
                },
                {
                    name: 'Sin ITV (2022)',
                    // @ts-ignore
                    data: data2022.map(d => d.vehicles_without_mot)
                },
                {
                    name: 'Fallecidos (2023)',
                    // @ts-ignore
                    data: data2023.map(d => d.deceased)
                },
                {
                    name: 'Sin ITV (2023)',
                    // @ts-ignore
                    data: data2023.map(d => d.vehicles_without_mot)
                }
            ]
        });
    });
</script>

<figure class="highcharts-figure">
    <div id="container" style="height: 500px"></div>
    <p class="highcharts-description">
        Comparación de fallecidos y vehículos sin ITV por comunidad autónoma en los años 2022 y 2023.
    </p>
</figure>
