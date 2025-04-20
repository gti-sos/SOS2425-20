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
    let newCommunity = "";
    let newYear = "";
    let newFatalAccidents = "";
    let newDeceased = "";
    let newVehiclesWithoutMot = "";

    let searchCommunity = "";
    let searchFrom = "";
    let searchTo = "";
    let searchFatalAccidents = "";
    let searchDeceased = "";
    let searchWithoutMot = "";

    let firstLoad = true;

    async function getTrafficAccidents() {
        try {
            const res = await fetch(API);
            const data = await res.json();
            trafficAccidents = data;

            if (firstLoad && data.length === 0) {
                const initRes = await fetch(API + "/loadInitialData");
                if (initRes.status === 201 || initRes.status === 200) {
                    const loaded = await initRes.json();
                    trafficAccidents = loaded;
                    resultStatus = 201;
                }
            }

            firstLoad = false;
        } catch (error) {
            console.log(`ERROR al obtener datos de ${API}: ${error}`);
        }
    }


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
            vehicles_without_mot: parseInt(newVehiclesWithoutMot),
        };

        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry),
            });

            resultStatus = res.status;

            if (res.status == 201) {
                await getTrafficAccidents();
            }
        } catch (error) {
            console.log(`ERROR en POST a ${API}: ${error}`);
        }
    }

    async function deleteAllTrafficAccidents() {
        resultStatus = null;
        try {
            const res = await fetch(API, { method: "DELETE" });
            resultStatus = res.status;
            if (res.status === 200) await getTrafficAccidents();
        } catch (error) {
            console.log(`ERROR al hacer DELETE total: ${error}`);
        }
    }

    async function deleteTrafficAccident(community, year) {
        resultStatus = null;
        try {
            const res = await fetch(`${API}/${community}/${year}`, {
                method: "DELETE",
            });
            resultStatus = res.status;
            if (res.status == 200) await getTrafficAccidents();
        } catch (error) {
            console.log(`ERROR al eliminar: ${error}`);
        }
    }

    async function searchTrafficAccidents() {
        let url = new URL(API, window.location.origin);
        if (searchCommunity) url.searchParams.append("autonomous_community", searchCommunity);
        if (searchFrom) url.searchParams.append("from", searchFrom);
        if (searchTo) url.searchParams.append("to", searchTo);
        if (searchFatalAccidents) url.searchParams.append("fatal_accidents", searchFatalAccidents);
        if (searchDeceased) url.searchParams.append("deceased", searchDeceased);
        if (searchWithoutMot) url.searchParams.append("vehicles_without_mot", searchWithoutMot);

        resultStatus = null;
        try {
            const res = await fetch(url);
            const data = await res.json();
            trafficAccidents = data;
            resultStatus = res.status;
        } catch (error) {
            console.log(`ERROR al buscar: ${error}`);
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
            <i class="bi bi-x-circle-fill text-danger"></i> Error inesperado (código {resultStatus}).
        {/if}
    </p>
{/if}

<h4><i class="bi bi-search"></i> Buscar registros</h4>
<div class="mb-4">
    <input class="form-control mb-1" bind:value={searchCommunity} placeholder="Comunidad" />
    <input class="form-control mb-1" bind:value={searchFrom} placeholder="Desde (año)" type="number" />
    <input class="form-control mb-1" bind:value={searchTo} placeholder="Hasta (año)" type="number" />
    <input class="form-control mb-1" bind:value={searchFatalAccidents} placeholder="Acc. Mortales" type="number" />
    <input class="form-control mb-1" bind:value={searchDeceased} placeholder="Fallecidos" type="number" />
    <input class="form-control mb-1" bind:value={searchWithoutMot} placeholder="Sin ITV" type="number" />
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
            <td><input bind:value={newCommunity} placeholder="Comunidad" data-testid="input-community" /></td>
            <td><input type="number" bind:value={newYear} placeholder="Año" data-testid="input-year" /></td>
            <td><input type="number" bind:value={newFatalAccidents} placeholder="Acc. Mortales" data-testid="input-fatal" /></td>
            <td><input type="number" bind:value={newDeceased} placeholder="Fallecidos" data-testid="input-deceased" /></td>
            <td><input type="number" bind:value={newVehiclesWithoutMot} placeholder="Sin ITV" data-testid="input-noitv" /></td>
            <td><Button color="success" on:click={createTrafficAccident}><i class="bi bi-plus-circle-fill"></i> Crear</Button></td>
        </tr>        
        {#each trafficAccidents as ta}
            <tr>
                <td>{ta.autonomous_community}</td>
                <td>{ta.year}</td>
                <td>{ta.fatal_accidents}</td>
                <td>{ta.deceased}</td>
                <td>{ta.vehicles_without_mot}</td>
                <td>
                    <Button color="warning" href={`/traffic-accidents/${ta.autonomous_community}/${ta.year}`} class="me-2">
                        <i class="bi bi-pencil-fill"></i> Editar
                    </Button>
                    <Button color="danger" on:click={() => deleteTrafficAccident(ta.autonomous_community, ta.year)}>
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
