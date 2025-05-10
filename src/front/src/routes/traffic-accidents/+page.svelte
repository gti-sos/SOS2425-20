<!-- src/routes/traffic-accidents/+page.svelte -->
<svelte:head>
	<title>Accidentes de Tráfico</title>
</svelte:head>

<script>
  // @ts-nocheck
  import { dev } from "$app/environment";
  import { onMount } from "svelte";
  import { Button, Table } from "@sveltestrap/sveltestrap";

  let DEVEL_HOST = "http://localhost:16078";
  let API = "/api/v1/traffic-accidents";
  if (dev) API = DEVEL_HOST + API;

  let trafficAccidents = [];
  let resultStatus = null;

  // Campos de creación
  let newCommunity = "";
  let newYear = "";
  let newFatalAccidents = "";
  let newDeceased = "";
  let newVehiclesWithoutMot = "";

  // Campos de búsqueda
  let searchCommunity = "";
  let searchFrom = "";
  let searchTo = "";
  let searchFatalAccidents = "";
  let searchDeceased = "";
  let searchWithoutMot = "";

  let firstLoad = true;
  // Bandera para saber si venimos de un "Buscar"
  let isSearching = false;

  // Carga inicial o tras "Limpiar"
  async function getTrafficAccidents() {
    isSearching = false;
    try {
      const res = await fetch(API);
      const data = await res.json();
      trafficAccidents = data;

      if (firstLoad && data.length === 0) {
        const initRes = await fetch(API + "/loadInitialData");
        if (initRes.ok) {
          trafficAccidents = await initRes.json();
          resultStatus = 201;
        }
      }
      firstLoad = false;
    } catch (error) {
      console.error(`ERROR al obtener datos de ${API}:`, error);
    }
  }

  // Crear un nuevo registro
  async function createTrafficAccident() {
    resultStatus = null;
    if (!newCommunity || !newYear || !newFatalAccidents || !newDeceased || !newVehiclesWithoutMot) {
      resultStatus = 400;
      return;
    }
    const newEntry = {
      autonomous_community: newCommunity,
      year: parseInt(newYear),
      fatal_accidents: parseInt(newFatalAccidents),
      deceased: parseInt(newDeceased),
      vehicles_without_mot: parseInt(newVehiclesWithoutMot)
    };
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      });
      resultStatus = res.status;
      if (res.status === 201) await getTrafficAccidents();
    } catch (error) {
      console.error(`ERROR en POST a ${API}:`, error);
    }
  }

  // Borrar todo
  async function deleteAllTrafficAccidents() {
    resultStatus = null;
    try {
      const res = await fetch(API, { method: "DELETE" });
      resultStatus = res.status;
      if (res.status === 200) await getTrafficAccidents();
    } catch (error) {
      console.error(`ERROR al borrar todos:`, error);
    }
  }

  // Borrar uno
  async function deleteTrafficAccident(community, year) {
    resultStatus = null;
    try {
      const res = await fetch(`${API}/${community}/${year}`, { method: "DELETE" });
      resultStatus = res.status;
      if (res.status === 200) await getTrafficAccidents();
    } catch (error) {
      console.error(`ERROR al borrar ${community}/${year}:`, error);
    }
  }

  // Filtrar
  async function searchTrafficAccidents() {
    isSearching = true;
    resultStatus = null;

    let url = new URL(API, window.location.origin);
    if (searchCommunity)      url.searchParams.append("autonomous_community", searchCommunity);
    if (searchFrom)           url.searchParams.append("from", searchFrom);
    if (searchTo)             url.searchParams.append("to", searchTo);
    if (searchFatalAccidents) url.searchParams.append("fatal_accidents", searchFatalAccidents);
    if (searchDeceased)       url.searchParams.append("deceased", searchDeceased);
    if (searchWithoutMot)     url.searchParams.append("vehicles_without_mot", searchWithoutMot);

    try {
      const res = await fetch(url);
      trafficAccidents = await res.json();
      resultStatus = res.status;
    } catch (error) {
      console.error(`ERROR al buscar:`, error);
    }
  }

  onMount(getTrafficAccidents);
</script>
<h2>Listado de Accidentes de Tráfico</h2>

{#if resultStatus !== null}
  <p>
    {#if resultStatus === 201}
      <i class="bi bi-check-circle-fill text-success"></i> Entrada creada correctamente.
    {:else if resultStatus === 200}
      <i class="bi bi-check-circle-fill text-success"></i> Operación completada correctamente.
    {:else if resultStatus === 400}
      <i class="bi bi-exclamation-triangle-fill text-warning"></i> Faltan datos. Por favor, revisa todos los campos.
    {:else if resultStatus === 409}
      <i class="bi bi-x-circle-fill text-danger"></i> Ya existe una entrada con esa comunidad y año.
    {:else if resultStatus === 404}
      <i class="bi bi-x-circle-fill text-danger"></i> Recurso no encontrado.
    {:else}
      <i class="bi bi-x-circle-fill text-danger"></i> Error (código {resultStatus}).
    {/if}
  </p>
{/if}

{#if isSearching && resultStatus === 200 && trafficAccidents.length === 0}
  <div class="alert alert-warning mt-3" role="alert">
    <i class="bi bi-exclamation-circle-fill"></i> No se han encontrado resultados para esa búsqueda.
  </div>
{/if}

<h4><i class="bi bi-search"></i> Buscar registros</h4>
<div class="mb-4">
  <input class="form-control mb-1" bind:value={searchCommunity} placeholder="Comunidad" />
  <input class="form-control mb-1" bind:value={searchFrom}       placeholder="Desde (año)" type="number" />
  <input class="form-control mb-1" bind:value={searchTo}         placeholder="Hasta (año)" type="number" />
  <input class="form-control mb-1" bind:value={searchFatalAccidents} placeholder="Acc. Mortales" type="number" />
  <input class="form-control mb-1" bind:value={searchDeceased}       placeholder="Fallecidos" type="number" />
  <input class="form-control mb-1" bind:value={searchWithoutMot}     placeholder="Sin ITV" type="number" />
  <Button color="primary" on:click={searchTrafficAccidents}>
    <i class="bi bi-search"></i> Buscar
  </Button>
  <Button color="secondary" class="ms-2" on:click={getTrafficAccidents}>
    <i class="bi bi-arrow-clockwise"></i> Limpiar
  </Button>
</div>

<Table>
  <thead>
    <tr>
      <th>Comunidad</th>
      <th>Año</th>
      <th>Acc. Mortales</th>
      <th>Fallecidos</th>
      <th>Sin ITV</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><input bind:value={newCommunity} placeholder="Comunidad" /></td>
      <td><input type="number" bind:value={newYear} placeholder="Año" /></td>
      <td><input type="number" bind:value={newFatalAccidents} placeholder="Acc. Mortales" /></td>
      <td><input type="number" bind:value={newDeceased} placeholder="Fallecidos" /></td>
      <td><input type="number" bind:value={newVehiclesWithoutMot} placeholder="Sin ITV" /></td>
      <td>
        <Button color="success" on:click={createTrafficAccident}>
          <i class="bi bi-plus-circle-fill"></i> Crear
        </Button>
      </td>
    </tr>
    {#each trafficAccidents as ta}
      <tr>
        <td>{ta.autonomous_community}</td>
        <td>{ta.year}</td>
        <td>{ta.fatal_accidents}</td>
        <td>{ta.deceased}</td>
        <td>{ta.vehicles_without_mot}</td>
        <td>
          <Button
            color="warning"
            href={`/traffic-accidents/${ta.autonomous_community}/${ta.year}`}
            class="me-2"
          >
            <i class="bi bi-pencil-fill"></i> Editar
          </Button>
          <Button
            color="danger"
            on:click={() => deleteTrafficAccident(ta.autonomous_community, ta.year)}
          >
            <i class="bi bi-trash3-fill"></i> Eliminar
          </Button>
        </td>
      </tr>
    {/each}
  </tbody>
</Table>

<Button color="danger" class="mt-3" on:click={deleteAllTrafficAccidents}>
  <i class="bi bi-trash-fill"></i> Eliminar todos los recursos
</Button>
