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
    let API = "/api/v1/fines";
    if (dev) API = DEVEL_HOST + API;

    /** @type {any[]} */
    let fines = [];
    /** @type {string[]} */
    let cities = [];
    let selectedCity = "";

    let data2023 = [];

    async function getData() {
        try {
            const res = await fetch(API);
            let data = await res.json();

            if (data.length === 0) {
                const initRes = await fetch(API + "/loadInitialData", { method: "GET" });
                if (initRes.ok) {
                    data = await initRes.json();
                    console.log("Datos iniciales cargados automáticamente.");
                } else {
                    console.error("No se pudieron cargar los datos iniciales.");
                }
            }

            fines = data;
            cities = [...new Set(fines.map(d => d.city))].sort();

            drawChart();
        } catch (error) {
            console.error("Error al cargar datos de la API", error);
        }
    }

    function drawChart() {
        const filtered = selectedCity
            ? fines.filter(d => d.city === selectedCity)
            : fines;

        const usedCities = selectedCity ? [selectedCity] : [...new Set(filtered.map(d => d.city))].sort();

        data2023 = usedCities.map(c => {
            const entry = filtered.find(d => d.city === c && d.year === 2023);
            return {
                itv: entry?.itv || 0,
                alcohol_rate: entry?.alcohol_rate || 0,
                fixed_radar: entry?.fixed_radar || 0
            };
        });

        // @ts-ignore
        Highcharts.chart('container', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Multas de tráfico por ciudad (2023)'
            },
            subtitle: {
                text: 'Fuente: API de multas'
            },
            xAxis: {
                categories: usedCities,
                title: {
                    text: null
                },
                gridLineWidth: 1,
                lineWidth: 0
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Número de multas',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                },
                gridLineWidth: 0
            },
            tooltip: {
                valueSuffix: ' multas'
            },
            plotOptions: {
                bar: {
                    borderRadius: '50%',
                    dataLabels: {
                        enabled: true
                    },
                    groupPadding: 0.1
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                // @ts-ignore
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    name: 'ITV',
                    data: data2023.map(d => d.itv)
                },
                {
                    name: 'Tasa de Alcohol',
                    data: data2023.map(d => d.alcohol_rate)
                },
                {
                    name: 'Radares Fijos',
                    data: data2023.map(d => d.fixed_radar)
                }
            ]
        });
    }

    onMount(getData);
</script>

<!-- Filtro de ciudad -->
<div style="margin-bottom: 1rem;">
    <label for="city-select">Filtrar por ciudad: </label>
    <select id="city-select" bind:value={selectedCity} on:change={drawChart}>
        <option value="">Todas</option>
        {#each cities as c}
            <option value={c}>{c}</option>
        {/each}
    </select>
</div>

<!-- Gráfico -->
<figure class="highcharts-figure">
    <div id="container" style="height: 600px;"></div>
    <p class="highcharts-description">
        Comparación de multas por ITV, tasa de alcohol y radares fijos por ciudad en el año 2023.
    </p>
</figure>
