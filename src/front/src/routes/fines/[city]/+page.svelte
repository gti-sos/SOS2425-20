<script>
    // @ts-nocheck
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import { Button } from '@sveltestrap/sveltestrap';
    
    let DEVEL_HOST = 'http://localhost:16078';
    let API = '/api/v1/fines';  
    
    if (dev) API = DEVEL_HOST + API;
    
    let city = '';
    let year = '';
    let itv = '';
    let alcohol_rate = '';
    let fixed_radar = '';
    let resultStatus = null;
    
    // Obtener los parámetros de la URL
    $: city = $page.params.city;
    $: year = $page.params.year;
    
    onMount(async () => {
        try {
            const res = await fetch(`${API}/${city}/${year}`);
            if (res.status === 200) {
                const data = await res.json();
                itv = data.itv;
                alcohol_rate = data.alcohol_rate;
                fixed_radar = data.fixed_radar;
            } else {
                resultStatus = res.status;
            }
        } catch (error) {
            console.log('Error al cargar datos:', error);
        }
    });
    
    // Función para actualizar la multa
    async function updateFine() {
        if (!itv || !alcohol_rate || !fixed_radar) {
            resultStatus = 400;
            return;
        }
    
        resultStatus = null;
        const updatedData = {
            city: city,
            year: parseInt(year),
            itv: parseInt(itv),
            alcohol_rate: parseInt(alcohol_rate),
            fixed_radar: parseInt(fixed_radar)
        };
    
        try {
            const res = await fetch(`${API}/${city}/${year}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            resultStatus = res.status;
        } catch (error) {
            console.log('Error al actualizar:', error);
        }
    }
    </script>
    
    <h2>Editar multa de tráfico: {city} - {year}</h2>
    
    {#if resultStatus === 404}
        <p> Recurso no encontrado</p>
    {:else}
    
    <label for="itv">Número de sanciones ITV:</label>
    <input id="itv" type="number" bind:value={itv} />
    
    <label for="alcohol_rate">Número de sanciones por tasa de alcohol:</label>
    <input id="alcohol_rate" type="number" bind:value={alcohol_rate} />
    
    <label for="fixed_radar">Número de sanciones por radares fijos:</label>
    <input id="fixed_radar" type="number" bind:value={fixed_radar} />
    
    <Button color="primary" on:click={updateFine}>
        Actualizar
    </Button>
    
    {#if resultStatus !== null}
        {#if resultStatus === 200}
            <p class="text-success"><i class="bi bi-check-circle-fill"></i> Recurso actualizado correctamente.</p>
        {:else if resultStatus === 400}
            <p class="text-warning"><i class="bi bi-exclamation-triangle-fill"></i> Por favor, completa todos los campos.</p>
        {:else}
            <p class="text-danger"><i class="bi bi-x-circle-fill"></i> Error al actualizar.</p>
        {/if}
    {/if}
    {/if}
    