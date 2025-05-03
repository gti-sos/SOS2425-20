<svelte:head>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/fines";
    if (dev) API = DEVEL_HOST + API;

    // @ts-ignore
    let fines = [];
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
            // @ts-ignore
            cities = [...new Set(fines.map(d => d.city))].sort();

            // @ts-ignore
            google.charts.load('current', { packages: ['corechart'] });
            // @ts-ignore
            google.charts.setOnLoadCallback(drawChart);
        } catch (error) {
            console.error("Error al cargar datos de la API", error);
        }
    }

    function drawChart() {
        const filtered = selectedCity
        // @ts-ignore
            ? fines.filter(d => d.city === selectedCity)
            // @ts-ignore
            : fines;

        const usedCities = selectedCity
            ? [selectedCity]
            : [...new Set(filtered.map(d => d.city))].sort();

        data2023 = usedCities.map(c => {
            const entry = filtered.find(d => d.city === c && d.year === 2023);
            return [
                c,
                entry?.itv || 0,
                entry?.alcohol_rate || 0,
                entry?.fixed_radar || 0
            ];
        });

        // @ts-ignore
        const chartData = google.visualization.arrayToDataTable([
            ['Ciudad', 'ITV', 'Tasa de Alcohol', 'Radares Fijos'],
            ...data2023
        ]);

        const options = {
            title: 'Multas de tráfico por ciudad (2023)',
            hAxis: { title: 'Ciudad' },
            vAxis: { minValue: 0 },
            isStacked: false,
            legend: { position: 'top' },
            areaOpacity: 0.3
        };

        // @ts-ignore
        const chart = new google.visualization.AreaChart(document.getElementById('container'));
        chart.draw(chartData, options);
    }

    onMount(getData);
</script>

<!-- Gráfico -->
<figure class="googlecharts-figure">
    <div id="container" style="width: 100%; height: 500px;"></div>
    <p class="googlecharts-description">
        Comparación de multas por ciudad (ITV, alcohol y radares fijos) en el año 2023 utilizando un gráfico de áreas.
    </p>
</figure>
