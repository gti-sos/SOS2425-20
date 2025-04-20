<script>
    // @ts-nocheck
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import { Button, Table } from "@sveltestrap/sveltestrap";

    let DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/accidents-with-animals"; 

    if (dev) API = DEVEL_HOST + API;

    let accidents = [];
    let resultStatus = null;
    let newId = "";
    let newAccidentDate = "";
    let newAccidentHour = "";
    let newCommunity = "";
    let newProvince = "";
    let newIneMunicipality = "";
    let newRoad = "";
    let newKmRoad = "";
    let newTypeOfRoad = "";
    let newAnimalGroup = "";
    let newOtherAnimalGroup = "";

    let searchId = "";
    let searchCommunity = "";
    let searchProvince = "";

    let firstLoad = true;

    async function getAccidents() {
        try {
            const res = await fetch(API);
            const data = await res.json();
            accidents = data;

            if (firstLoad && data.length === 0) {
                const initRes = await fetch(API + "/loadInitialData");
                if (initRes.status === 201 || initRes.status === 200) {
                    const loaded = await initRes.json();
                    accidents = loaded;
                    resultStatus = 201;
                }
            }

            firstLoad = false;
        } catch (error) {
            console.log(`ERROR al obtener datos de ${API}: ${error}`);
        }
    }

    async function createAccident() {
        resultStatus = null;

        if (!newAccidentDate || !newAccidentHour || !newCommunity || !newProvince || !newRoad || !newKmRoad || !newTypeOfRoad || !newAnimalGroup || !newOtherAnimalGroup) {
            resultStatus = 400;
            return;
        }

        const newEntry = {
            id: newId,
            accident_date: newAccidentDate,
            accident_hour: newAccidentHour,
            autonomous_community: newCommunity,
            province: newProvince,
            ine_municipality: parseInt(newIneMunicipality),
            road: newRoad,
            km_road: newKmRoad,
            type_of_road: parseInt(newTypeOfRoad),
            animal_group: parseInt(newAnimalGroup),
            other_animal_group: parseInt(newOtherAnimalGroup),
        };

        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry),
            });

            resultStatus = res.status;

            if (res.status == 201) {
                await getAccidents();
            }
        } catch (error) {
            console.log(`ERROR en POST a ${API}: ${error}`);
        }
    }

    async function deleteAllAccidents() {
        resultStatus = null;
        try {
            const res = await fetch(API, { method: "DELETE" });
            resultStatus = res.status;
            if (res.status === 200) await getAccidents();
        } catch (error) {
            console.log(`ERROR al hacer DELETE total: ${error}`);
        }
    }

    async function deleteAccident(id) {
        resultStatus = null;
        try {
            const res = await fetch(`${API}/${id}`, {
                method: "DELETE",
            });
            resultStatus = res.status;
            if (res.status == 200) await getAccidents();
        } catch (error) {
            console.log(`ERROR al eliminar: ${error}`);
        }
    }

    async function searchAccidents() {
        let url = new URL(API, window.location.origin);

        // Solo se agregan los parámetros de búsqueda por id, comunidad y provincia
        if (searchId) url.searchParams.append("id", searchId);
        if (searchCommunity) url.searchParams.append("autonomous_community", searchCommunity);
        if (searchProvince) url.searchParams.append("province", searchProvince);

        resultStatus = null;
        try {
            const res = await fetch(url);
            const data = await res.json();
            accidents = data;
            resultStatus = res.status;
        } catch (error) {
            console.log(`ERROR al buscar: ${error}`);
        }
    }

    onMount(getAccidents);
</script>

<h2>Listado de Accidentes con Animales</h2>

{#if resultStatus !== null}
    <p>
        {#if resultStatus === 201}
            <i class="bi bi-check-circle-fill text-success"></i> Entrada creada correctamente.
        {:else if resultStatus === 200}
            <i class="bi bi-check-circle-fill text-success"></i> Operación completada correctamente.
        {:else if resultStatus === 400}
            <i class="bi bi-exclamation-triangle-fill text-warning"></i> Faltan datos. Por favor, revisa todos los campos.
        {:else if resultStatus === 404}
            <i class="bi bi-x-circle-fill text-danger"></i> Recurso no encontrado.
        {:else}
            <i class="bi bi-x-circle-fill text-danger"></i> Error inesperado (código {resultStatus}).
        {/if}
    </p>
{/if}

<h4><i class="bi bi-search"></i> Buscar registros</h4>
<div class="mb-4">
    <input class="form-control mb-1" bind:value={searchId} placeholder="ID" />
    <input class="form-control mb-1" bind:value={searchCommunity} placeholder="Comunidad" />
    <input class="form-control mb-1" bind:value={searchProvince} placeholder="Provincia" />
    <Button color="primary" on:click={searchAccidents}>
        <i class="bi bi-search"></i> Buscar
    </Button>
    <Button color="secondary" class="ms-2" on:click={getAccidents}>
        <i class="bi bi-arrow-clockwise"></i> Limpiar
    </Button>
</div>

<Table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Comunidad</th>
            <th>Provincia</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Carretera</th>
            <th>Km de Carretera</th>
            <th>Tipo de Carretera</th>
            <th>Grupo de animales</th>
            <th>Otro grupo de animales</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input bind:value={newId} placeholder="ID del accidente" /></td>
            <td><input bind:value={newCommunity} placeholder="Comunidad" /></td>
            <td><input bind:value={newProvince} placeholder="Provincia" /></td>
            <td><input bind:value={newAccidentDate} placeholder="Fecha del accidente" /></td>
            <td><input bind:value={newAccidentHour} placeholder="Hora del accidente" /></td>
            <td><input bind:value={newRoad} placeholder="Carretera" /></td>
            <td><input bind:value={newKmRoad} placeholder="Km de la carretera" type="number" /></td>
            <td><input bind:value={newTypeOfRoad} placeholder="Tipo de carretera" type="number" /></td>
            <td><input type="number" bind:value={newAnimalGroup} placeholder="Grupo de animales" /></td>
            <td><input type="number" bind:value={newOtherAnimalGroup} placeholder="Otro grupo de animales" /></td>
            <td><Button color="success" on:click={createAccident}><i class="bi bi-plus-circle-fill"></i> Crear</Button></td>
        </tr>
        {#each accidents as accident}
            <tr>
                <td>{accident.id}</td>
                <td>{accident.autonomous_community}</td>
                <td>{accident.province}</td>
                <td>{accident.accident_date}</td>
                <td>{accident.accident_hour}</td>
                <td>{accident.road}</td>
                <td>{accident.km_road}</td>
                <td>{accident.type_of_road}</td>
                <td>{accident.animal_group}</td>
                <td>{accident.other_animal_group}</td>
                <td>
                    <Button color="warning" href={`/accidents-with-animals/${accident.id}`} class="me-2">
                        <i class="bi bi-pencil-fill"></i> Editar
                    </Button>
                    <Button color="danger" on:click={() => deleteAccident(accident.id)}>
                        <i class="bi bi-trash3-fill"></i> Eliminar
                    </Button>
                </td>
            </tr>
        {/each}
    </tbody>
</Table>

<Button color="danger" class="mt-3" on:click={deleteAllAccidents}>
    <i class="bi bi-trash-fill"></i> Eliminar todos los recursos
</Button>
