<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/d3@5.16.0/dist/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/c3@0.7.20/c3.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/c3@0.7.20/c3.min.css" rel="stylesheet">
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let API = "/api/v1/accidents-with-animals";
    if (dev) {
        // Cambia el endpoint de la API si estás en un entorno de desarrollo
        API = "https://sos2425-20.onrender.com" + API;
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

        // Contar número total de accidentes del grupo seleccionado (o todos)
        const count = filtered.length;

        // Crear el gráfico de tipo gauge usando C3.js
        // @ts-ignore
        c3.generate({
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
                max: 100, // Puedes ajustar esto a un valor esperado razonable
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
        Este gráfico tipo gauge muestra el número total de accidentes del grupo de animal seleccionado.
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
