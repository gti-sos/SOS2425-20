<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let API = "/api/v1/accidents-with-animals";
    if (dev) {
        API = "https://sos2425-20.onrender.com" + API;
    }

    // @ts-ignore
    let accidents = [];
    // @ts-ignore
    let communities = [];
    // @ts-ignore
    let selectedCommunity = "";

    // @ts-ignore
    let chart;
    // @ts-ignore
    let c3Instance;

    // @ts-ignore
    async function getData() {
        try {
            const res = await fetch(API);
            let result = await res.json();

            if (result.length === 0) {
                const init = await fetch(API + "/loadInitialData");
                if (init.ok) {
                    result = await init.json();
                    console.log("Datos iniciales cargados automáticamente.");
                } else {
                    console.error("Error al cargar datos iniciales.");
                }
            }

            // @ts-ignore
            accidents = result;
            // @ts-ignore
            communities = [...new Set(accidents.map(d => d.autonomous_community))].sort();

            // @ts-ignore
            drawChart();
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }

    // @ts-ignore
    function drawChart() {
        // @ts-ignore
        const filtered = selectedCommunity
            // @ts-ignore
            ? accidents.filter(d => d.autonomous_community === selectedCommunity)
            // @ts-ignore
            : accidents;

        // @ts-ignore
        const count = filtered.length;

        // @ts-ignore
        if (isNaN(count)) {
            console.warn("El conteo no es un número válido:", count);
            return;
        }

        // @ts-ignore
        if (!chart) {
            // @ts-ignore
            chart = c3Instance.generate({
                bindto: '#container',
                data: {
                    columns: [
                        ['Accidentes', count]
                    ],
                    type: 'gauge'
                },
                gauge: {
                    label: {
                        // @ts-ignore
                        format: function (value) {
                            return value;
                        },
                        show: true
                    },
                    min: 0,
                    max: 100,
                    units: ' accidentes',
                    width: 39
                },
                color: {
                    pattern: ['#60B044', '#F6C600', '#F97600', '#FF0000'],
                    threshold: {
                        values: [25, 50, 75, 100]
                    }
                },
                size: {
                    height: 400
                }
            });
        } else {
            chart.load({
                columns: [
                    ['Accidentes', count]
                ]
            });
        }
    }

    onMount(async () => {
        // @ts-ignore
        c3Instance = await import("c3");
        // @ts-ignore
        await getData();
    });

    // @ts-ignore
    $: if (c3Instance && chart && accidents.length > 0 && selectedCommunity !== undefined) {
        // @ts-ignore
        drawChart();
    }
</script>

<!-- Filtro por comunidad autónoma -->
<div style="margin-bottom: 1rem;">
    <label for="community-select">Filtrar por comunidad autónoma: </label>
    <select id="community-select" bind:value={selectedCommunity}>
        <option value="">Todas</option>
        {#each communities as community}
            <option value={community}>{community}</option>
        {/each}
    </select>
</div>

<!-- Gráfico -->
<figure class="highcharts-figure">
    <div id="container" style="height: 600px;"></div>
    <p class="highcharts-description">
        Este gráfico tipo gauge muestra el número total de accidentes en la comunidad autónoma seleccionada.
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
