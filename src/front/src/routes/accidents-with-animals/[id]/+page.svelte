<svelte:head>
	<title>Editar accidente con animales</title>
</svelte:head>
<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { Button } from '@sveltestrap/sveltestrap';

	let DEVEL_HOST = 'http://localhost:16078';
	let API = '/api/v1/accidents-with-animals';
	if (dev) API = DEVEL_HOST + API;

	let id = '';
	let n_deceased = 0;
	let n_injures_hospitalized = 0;
	let n_injured_no_hospitalized = 0;
	let accident_date = '';
	let accident_hour = '';
	let anyo = 0;
	let autonomous_community = '';
	let province = '';
	let ine_municipality = 0;
	let road = '';
	let km_road = '';
	let type_of_road = 0;
	let animal_group = 0;
	let other_animal_group = 0;

	let resultStatus = null;

	// Obtener ID desde la URL
	$: id = $page.params.id;

	onMount(async () => {
		try {
			const res = await fetch(`${API}/${id}`);
			if (res.status === 200) {
				const data = await res.json();
				// Asignamos los valores de la respuesta a las variables locales
				({ 
					n_deceased, 
					n_injures_hospitalized, 
					n_injured_no_hospitalized, 
					accident_date, 
					accident_hour, 
					anyo, 
					autonomous_community, 
					province, 
					ine_municipality, 
					road, 
					km_road, 
					type_of_road, 
					animal_group, 
					other_animal_group 
				} = data);
			} else {
				resultStatus = res.status;
			}
		} catch (error) {
			console.error('Error al cargar datos:', error);
			resultStatus = 500; // Código de error genérico
		}
	});

	async function updateAccident() {
		resultStatus = null;

		const updatedAccident = {
			id,
			n_deceased: parseInt(n_deceased),
			n_injures_hospitalized: parseInt(n_injures_hospitalized),
			n_injured_no_hospitalized: parseInt(n_injured_no_hospitalized),
			accident_date,
			accident_hour,
			anyo: parseInt(anyo),
			autonomous_community,
			province,
			ine_municipality: parseInt(ine_municipality),
			road,
			km_road,
			type_of_road: parseInt(type_of_road),
			animal_group: parseInt(animal_group),
			other_animal_group: parseInt(other_animal_group)
		};

		try {
			const res = await fetch(`${API}/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedAccident)
			});
			resultStatus = res.status;
			if (res.status === 200) {
				// Mensaje de éxito
				resultStatus = 200;
			}
		} catch (error) {
			console.error('Error al actualizar:', error);
			resultStatus = 500; // Error de servidor
		}
	}
</script>

<h2>Editar accidente con animales: {id}</h2>

{#if resultStatus === 404}
	<p>Accidente no encontrado.</p>
{:else}
	<form on:submit|preventDefault={updateAccident}>
		<label for="n_deceased">Fallecidos:</label>
		<input id="n_deceased" type="number" bind:value={n_deceased} />

		<label for="n_injures_hospitalized">Heridos hospitalizados:</label>
		<input id="n_injures_hospitalized" type="number" bind:value={n_injures_hospitalized} />

		<label for="n_injured_no_hospitalized">Heridos no hospitalizados:</label>
		<input id="n_injured_no_hospitalized" type="number" bind:value={n_injured_no_hospitalized} />

		<label for="accident_date">Fecha del accidente:</label>
		<input id="accident_date" type="text" bind:value={accident_date} />

		<label for="accident_hour">Hora del accidente:</label>
		<input id="accident_hour" type="text" bind:value={accident_hour} />

		<label for="autonomous_community">Comunidad autónoma:</label>
		<input id="autonomous_community" type="text" bind:value={autonomous_community} />

		<label for="province">Provincia:</label>
		<input id="province" type="text" bind:value={province} />

		<label for="ine_municipality">Municipio (INE):</label>
		<input id="ine_municipality" type="number" bind:value={ine_municipality} />

		<label for="road">Carretera:</label>
		<input id="road" type="text" bind:value={road} />

		<label for="km_road">Km de carretera:</label>
		<input id="km_road" type="text" bind:value={km_road} />

		<label for="type_of_road">Tipo de vía:</label>
		<input id="type_of_road" type="number" bind:value={type_of_road} />

		<label for="animal_group">Grupo de animales:</label>
		<input id="animal_group" type="number" bind:value={animal_group} />

		<label for="other_animal_group">Otro grupo de animales:</label>
		<input id="other_animal_group" type="number" bind:value={other_animal_group} />

		<label for="anyo">Año:</label>
		<input id="anyo" type="number" bind:value={anyo} />

		<Button type="submit" color="primary">Actualizar</Button>
	</form>

	{#if resultStatus !== null}
		{#if resultStatus === 200}
			<p class="text-success">Accidente actualizado correctamente.</p>
		{:else if resultStatus === 400}
			<p class="text-warning">Por favor, completa todos los campos correctamente.</p>
		{:else if resultStatus === 500}
			<p class="text-danger">Error del servidor al intentar actualizar el accidente.</p>
		{:else}
			<p class="text-danger">Error inesperado.</p>
		{/if}
	{/if}
{/if}
