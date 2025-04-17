<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { Button } from '@sveltestrap/sveltestrap';

	let DEVEL_HOST = 'http://localhost:16078';
	let API = '/api/v1/traffic-accidents';

	if (dev) API = DEVEL_HOST + API;

	let community = '';
	let year = '';
	let fatal_accidents = '';
	let deceased = '';
	let vehicles_without_mot = '';
	let resultStatus = null;

	// Obtener los parámetros de la URL
	$: community = $page.params.community;
	$: year = $page.params.year;

	onMount(async () => {
		try {
			const res = await fetch(`${API}/${community}/${year}`);
			if (res.status === 200) {
				const data = await res.json();
				fatal_accidents = data.fatal_accidents;
				deceased = data.deceased;
				vehicles_without_mot = data.vehicles_without_mot;
			} else {
				resultStatus = res.status;
			}
		} catch (error) {
			console.log('Error al cargar datos:', error);
		}
	});

	async function updateTrafficAccident() {
		if (!fatal_accidents || !deceased || !vehicles_without_mot) {
			resultStatus = 400;
			return;
		}

		resultStatus = null;
		const updatedData = {
			autonomous_community: community,
			year: parseInt(year),
			fatal_accidents: parseInt(fatal_accidents),
			deceased: parseInt(deceased),
			vehicles_without_mot: parseInt(vehicles_without_mot)
		};

		try {
			const res = await fetch(`${API}/${community}/${year}`, {
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

<h2>Editar accidente de tráfico: {community} - {year}</h2>

{#if resultStatus === 404}
	<p> Recurso no encontrado</p>
{:else}

<label for="fatal_accidents">Accidentes mortales:</label>
<input id="fatal_accidents" type="number" bind:value={fatal_accidents} />

<label for="deceased">Fallecidos:</label>
<input id="deceased" type="number" bind:value={deceased} />

<label for="vehicles_without_mot">Vehículos sin ITV:</label>
<input id="vehicles_without_mot" type="number" bind:value={vehicles_without_mot} />


<Button color="primary" on:click={updateTrafficAccident}>
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

