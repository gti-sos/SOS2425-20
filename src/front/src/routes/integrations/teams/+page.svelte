<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let DEVEL_HOST = "http://localhost:5173";
    let API = "/integrations/teams/proxy?league=140&season=2020";
    if (dev) API = DEVEL_HOST + API;

    /** @type {any[]} */
    let teams = [];
    let dataPoints = [];

    async function getData() {
        try {
            const res = await fetch(API);
            const data = await res.json();

            // Imprimir la respuesta completa para depuración
            console.log("Respuesta completa:", data);

            // Comprobación segura para obtener standings
            const standings = data?.response?.[0]?.league?.standings?.[0];

           

            teams = standings;
            drawChart();
        } catch (error) {
            console.error("Error al cargar datos de la API:", error);
        }
    }

    function drawChart() {
        dataPoints = teams.map(team => ({
            x: team.all?.goals?.for || 0,
            y: team.points || 0,
            name: team.team?.name || "Desconocido"
        }));

        // @ts-ignore
        Highcharts.chart('container', {
            chart: {
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: 'Equipos por Goles Anotados y Puntos'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Goles Anotados'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Puntos'
                }
            },
            tooltip: {
                headerFormat: '<b>{point.name}</b><br/>',
                pointFormat: 'Goles: {point.x}<br/>Puntos: {point.y}'
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        pointFormat: '<b>{point.name}</b><br>Goles: {point.x}, Puntos: {point.y}'
                    }
                }
            },
            series: [{
                name: 'Equipos',
                color: 'rgba(119, 152, 191, .5)',
                data: dataPoints
            }]
        });
    }

    onMount(getData);
</script>

<figure class="highcharts-figure">
    <div id="container" style="height: 600px;"></div>
    <p class="highcharts-description">
        Comparación de equipos por goles anotados y puntos de la temporada 2019/20.
    </p>
</figure>
