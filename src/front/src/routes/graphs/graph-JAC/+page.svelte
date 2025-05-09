<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";
    import Highcharts from "highcharts";

    let API = "/api/v1/accidents-with-animals";
    if (dev) {
        // Cambia el endpoint de la API si estás en un entorno de desarrollo
        API = "http://localhost:16078" + API;
    }

    // @ts-ignore
    let accidents = [];
    // @ts-ignore
    /**
     * @type {any[]}
     */
    let animalGroups = [];
    let selectedAnimalGroup = "";

    // Función para obtener los datos de la API
    async function getData() {
        try {
            const res = await fetch(API);
            let result = await res.json();

            if (result.length === 0) {
                // Si no hay datos, intenta cargar datos iniciales
                const init = await fetch(API + "/loadInitialData");
                if (init.ok) {
                    result = await init.json();
                    console.log("Datos iniciales cargados automáticamente.");
                } else {
                    console.error("Error al cargar datos iniciales.");
                }
            }

            accidents = result;
            // @ts-ignore
            animalGroups = [...new Set(accidents.map(d => d.animal_group))].sort();

            drawChart();
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }

    // Función para dibujar el gráfico
    function drawChart() {
        const filtered = selectedAnimalGroup
            // @ts-ignore
            ? accidents.filter(d => d.animal_group === selectedAnimalGroup)
            // @ts-ignore
            : accidents;

        const usedGroups = selectedAnimalGroup ? [selectedAnimalGroup] : [...new Set(filtered.map(d => d.animal_group))].sort();

        const dataForChart = usedGroups.map(group => {
            return {
                name: group,
                y: filtered.filter(d => d.animal_group === group).length
            };
        });

        // @ts-ignore
        Highcharts.chart('container', {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Accidentes por Grupo de Animal'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Grupo de Animal',
                colorByPoint: true,
                data: dataForChart
            }]
        });
    }

    onMount(getData);
</script>

<!-- Filtro de grupo de animales -->
<div style="margin-bottom: 1rem;">
    <label for="animal-group-select">Filtrar por grupo de animal: </label>
    <select id="animal-group-select" bind:value={selectedAnimalGroup} on:change={drawChart}>
        <option value="">Todos</option>
        {#each animalGroups as group}
            <option value={group}>{group}</option>
        {/each}
    </select>
</div>

<!-- Gráfico -->
<figure class="highcharts-figure">
    <div id="container" style="height: 600px;"></div>
    <p class="highcharts-description">
        Este gráfico muestra la distribución de accidentes por grupo de animal.
    </p>
</figure>

<style>
    .highcharts-figure,
    .highcharts-description {
        margin: 0.3rem 10px;
    }

    select {
        padding: 5px;
        font-size: 1rem;
    }
</style>
