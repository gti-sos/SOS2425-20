<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/heatmap.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script>
    import { onMount } from 'svelte';

    // @ts-ignore
    function normalize(str) {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "") 
            .replace(/\s+/g, " ")
            .trim();
    }

    const prettyNames = {
        andalucia: "Andalucía",
        aragon: "Aragón",
        asturias: "Asturias",
        baleares: "Baleares",
        canarias: "Canarias",
        cantabria: "Cantabria",
        "castilla y leon": "Castilla y León",
        "castilla-la mancha": "Castilla-La Mancha",
        cataluna: "Cataluña",
        ceuta: "Ceuta",
        extremadura: "Extremadura",
        galicia: "Galicia",
        "comunidad de madrid": "Madrid",
        "comunidad valenciana": "Comunitat Valenciana",
        melilla: "Melilla",
        murcia: "Murcia",
        navarra: "Navarra",
        "pais vasco": "País Vasco",
        "la rioja": "La Rioja"
    };

    onMount(async () => {
        // Cargar datos con fallback a loadInitialData si vienen vacíos
        let [accidentsRes, firesRes] = await Promise.all([
            fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents"),
            fetch("https://sos2425-13.onrender.com/api/v1/forest-fires")
        ]);

        let traffic = await accidentsRes.json();
        let fires = await firesRes.json();

        if (traffic.length === 0) {
            const init = await fetch("https://sos2425-20.onrender.com/api/v1/traffic-accidents/loadInitialData");
            if (init.ok) {
                traffic = await init.json();
                console.log(" Datos de tráfico cargados automáticamente");
            } else {
                console.error(" Error al cargar datos de tráfico");
            }
        }

        if (fires.length === 0) {
            const init = await fetch("https://sos2425-13.onrender.com/api/v1/forest-fires/loadInitialData");
            if (init.ok) {
                fires = await init.json();
                console.log(" Datos de incendios cargados automáticamente");
            } else {
                console.error(" Error al cargar datos de incendios");
            }
        }

        const totals = {};

        // @ts-ignore
        traffic.forEach(d => {
            const key = normalize(d.autonomous_community);
            // @ts-ignore
            totals[key] = (totals[key] || 0) + (d.fatal_accidents || 0);
        });

        // @ts-ignore
        fires.forEach(d => {
            const key = normalize(d.autonomous_community);
            // @ts-ignore
            totals[key] = (totals[key] || 0) + (d.number_of_accidents || 0);
        });

        const allCommunities = Object.keys(totals).sort();
        // @ts-ignore
        const heatmapData = allCommunities.map((comm, xIdx) => [xIdx, 0, totals[comm]]);
        // @ts-ignore
        const xCategories = allCommunities.map(c => prettyNames[c] || c.charAt(0).toUpperCase() + c.slice(1));

        // @ts-ignore
        Highcharts.chart('container', {
            chart: {
                type: 'heatmap',
                marginTop: 40,
                marginBottom: 80,
                plotBorderWidth: 1
            },
            title: {
                text: 'Mapa de Calor Total: Accidentes + Incendios por Comunidad'
            },
            xAxis: {
                categories: xCategories,
                labels: {
                    rotation: -45
                }
            },
            yAxis: {
                categories: ['Total'],
                title: null
            },
            colorAxis: {
                min: 0,
                minColor: '#FFFFFF',
                // @ts-ignore
                maxColor: Highcharts.getOptions().colors[0]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },
            tooltip: {
                // @ts-ignore
                formatter: function () {
                    // @ts-ignore
                    return `<b>${xCategories[this.point.x]}</b><br>Total: <b>${this.point.value}</b>`;
                }
            },
            series: [{
                name: 'Accidentes + Incendios',
                borderWidth: 1,
                data: heatmapData,
                dataLabels: {
                    enabled: true,
                    color: '#000000'
                }
            }]
        });
    });
</script>

<style>
    #container {
        height: 500px;
        max-width: 1000px;
        margin: 2rem auto;
    }
</style>

<h2 style="text-align: center;">Mapa de Calor Total: Accidentes + Incendios por Comunidad</h2>
<div id="container"></div>
