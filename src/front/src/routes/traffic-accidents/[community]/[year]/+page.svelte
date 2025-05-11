<script>
  // Desactivamos el chequeo de tipos para este archivo
  // @ts-nocheck

  import { page } from '$app/stores';       // Para leer parámetros de la URL
  import { onMount } from 'svelte';         // Hook para ejecutar lógica al montar el componente
  import { dev } from '$app/environment';   // Saber si estamos en desarrollo
  import { Button } from '@sveltestrap/sveltestrap'; // Componente Button de Sveltestrap

  // URL base de la API; en dev apuntamos al servidor local
  let DEVEL_HOST = 'http://localhost:16078';
  let API = '/api/v1/traffic-accidents';
  if (dev) API = DEVEL_HOST + API;

  // Variables que ligamos al formulario
  let community = '';
  let year = '';
  let fatal_accidents = '';
  let deceased = '';
  let vehicles_without_mot = '';
  let resultStatus = null;  // Guardará el código de respuesta tras el PUT

  // Reactivo: extraemos los parámetros de la URL 
  $: community = $page.params.community;
  $: year = $page.params.year;

  // Al montar, solicitamos al backend los datos del recurso a editar
  onMount(async () => {
    try {
      const res = await fetch(`${API}/${community}/${year}`);
      if (res.status === 200) {
        const data = await res.json();
        // Inicializamos los campos del formulario con los valores existentes
        fatal_accidents       = data.fatal_accidents;
        deceased              = data.deceased;
        vehicles_without_mot  = data.vehicles_without_mot;
      } else {
        // Si no existe, mostramos mensaje correspondiente
        resultStatus = res.status;
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  });

  // Función que envía la actualización al backend
  async function updateTrafficAccident() {
    // Validación básica: todos los campos numéricos han de tener valor
    if (!fatal_accidents || !deceased || !vehicles_without_mot) {
      resultStatus = 400;
      return;
    }

    resultStatus = null; // Reseteamos cualquier estado anterior

    // Construimos el cuerpo del PUT
    const updatedData = {
      autonomous_community: community,
      year:                 parseInt(year),
      fatal_accidents:      parseInt(fatal_accidents),
      deceased:             parseInt(deceased),
      vehicles_without_mot: parseInt(vehicles_without_mot)
    };

    try {
      const res = await fetch(`${API}/${community}/${year}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      resultStatus = res.status; // Guardamos el código para mostrar feedback
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  }
</script>

<!-- Título con los parámetros que estamos editando -->
<h2>Editar accidente de tráfico: {community} - {year}</h2>

{#if resultStatus === 404}
  <!-- Si el recurso no existe -->
  <p class="text-danger">Recurso no encontrado.</p>
{:else}
  <!-- Formulario de edición -->
  <label for="fatal_accidents">Accidentes mortales:</label>
  <input
    id="fatal_accidents"
    type="number"
    bind:value={fatal_accidents}
  />

  <label for="deceased">Fallecidos:</label>
  <input
    id="deceased"
    type="number"
    bind:value={deceased}
  />

  <label for="vehicles_without_mot">Vehículos sin ITV:</label>
  <input
    id="vehicles_without_mot"
    type="number"
    bind:value={vehicles_without_mot}
  />

  <!-- Botón que desencadena la actualización -->
  <Button color="primary" on:click={updateTrafficAccident}>
    Actualizar
  </Button>

  {#if resultStatus !== null}
    <!-- Feedback según el código de estado -->
    {#if resultStatus === 200}
      <p class="text-success">
        <i class="bi bi-check-circle-fill"></i>
        Recurso actualizado correctamente.
      </p>
    {:else if resultStatus === 400}
      <p class="text-warning">
        <i class="bi bi-exclamation-triangle-fill"></i>
        Por favor, completa todos los campos.
      </p>
    {:else}
      <p class="text-danger">
        <i class="bi bi-x-circle-fill"></i>
        Error al actualizar (código {resultStatus}).
      </p>
    {/if}
  {/if}
{/if}
