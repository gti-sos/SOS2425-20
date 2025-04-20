<svelte:head>
    <title>Accidentes con animales</title> 
</svelte:head>
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
    
    // Campos para creación
    let newId = "";
    let newCommunity = "";
    let newProvince = "";
    let newAccidentDate = "";
    let newAccidentHour = "";
    let newIneMunicipality = "";
    let newRoad = "";
    let newKmRoad = "";
    let newTypeOfRoad = "";
    let newAnimalGroup = "";
    let newOtherAnimalGroup = "";
    let newNDeceased = "";
    let newNInjuresHospitalized = "";
    let newNInjuredNoHospitalized = "";
    let newAnyo = "";
    
    // Campos de búsqueda
    let searchCommunity = "";
    let searchProvince = "";
    let searchAccidentDate = "";
    let searchAccidentHour = "";
    let searchIneMunicipality = "";
    let searchRoad = "";
    let searchKmRoad = "";
    let searchTypeOfRoad = "";
    let searchAnimalGroup = "";
    let searchOtherAnimalGroup = "";
    let searchNDeceased = "";
    let searchNInjuresHospitalized = "";
    let searchNInjuredNoHospitalized = "";
    let searchAnyo = "";
    
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
    
        const requiredFields = [
            newId, newCommunity, newProvince, newAccidentDate, newAccidentHour, 
            newIneMunicipality, newRoad, newKmRoad, newTypeOfRoad, newAnimalGroup,
            newOtherAnimalGroup, newNDeceased, newNInjuresHospitalized,
            newNInjuredNoHospitalized, newAnyo
        ];
    
        if (requiredFields.some(field => field === "")) {
            resultStatus = 400;
            return;
        }
    
        const newEntry = {
            id: newId,
            autonomous_community: newCommunity,
            province: newProvince,
            accident_date: newAccidentDate,
            accident_hour: newAccidentHour,
            ine_municipality: parseInt(newIneMunicipality),
            road: newRoad,
            km_road: newKmRoad,
            type_of_road: parseInt(newTypeOfRoad),
            animal_group: parseInt(newAnimalGroup),
            other_animal_group: parseInt(newOtherAnimalGroup),
            n_deceased: parseInt(newNDeceased),
            n_injures_hospitalized: parseInt(newNInjuresHospitalized),
            n_injured_no_hospitalized: parseInt(newNInjuredNoHospitalized),
            anyo: parseInt(newAnyo)
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
        
        if (searchCommunity) url.searchParams.append("autonomous_community", searchCommunity);
        if (searchProvince) url.searchParams.append("province", searchProvince);
        if (searchAccidentDate) url.searchParams.append("accident_date", searchAccidentDate);
        if (searchAccidentHour) url.searchParams.append("accident_hour", searchAccidentHour);
        if (searchIneMunicipality) url.searchParams.append("ine_municipality", searchIneMunicipality);
        if (searchRoad) url.searchParams.append("road", searchRoad);
        if (searchKmRoad) url.searchParams.append("km_road", searchKmRoad);
        if (searchTypeOfRoad) url.searchParams.append("type_of_road", searchTypeOfRoad);
        if (searchAnimalGroup) url.searchParams.append("animal_group", searchAnimalGroup);
        if (searchOtherAnimalGroup) url.searchParams.append("other_animal_group", searchOtherAnimalGroup);
        if (searchNDeceased) url.searchParams.append("n_deceased", searchNDeceased);
        if (searchNInjuresHospitalized) url.searchParams.append("n_injures_hospitalized", searchNInjuresHospitalized);
        if (searchNInjuredNoHospitalized) url.searchParams.append("n_injured_no_hospitalized", searchNInjuredNoHospitalized);
        if (searchAnyo) url.searchAnyo.append("anyo", searchAnyo);
    
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
        {:else if resultStatus === 409}
            <i class="bi bi-x-circle-fill text-danger"></i> Ya existe un dato con ese ID.
        {:else if resultStatus === 404}
            <i class="bi bi-x-circle-fill text-danger"></i> Recurso no encontrado.
        {:else}
            <i class="bi bi-x-circle-fill text-danger"></i> Error inesperado (código {resultStatus}).
        {/if}
    </p>
{/if}

<h4><i class="bi bi-search"></i> Buscar registros por varios campos</h4>
<div class="mb-4">
    <input class="form-control mb-1" bind:value={searchAccidentDate} placeholder="Fecha" />
    <input class="form-control mb-1" bind:value={searchAccidentHour} placeholder="Hora" />
    <input class="form-control mb-1" bind:value={searchCommunity} placeholder="Comunidad" />
    <input class="form-control mb-1" bind:value={searchProvince} placeholder="Provincia" />
    <input class="form-control mb-1" bind:value={searchIneMunicipality} placeholder="Municipio INE" />
    <input class="form-control mb-1" bind:value={searchRoad} placeholder="Carretera" />
    <input class="form-control mb-1" bind:value={searchKmRoad} placeholder="Km" />
    <input class="form-control mb-1" bind:value={searchTypeOfRoad} placeholder="Tipo carretera" />
    <input class="form-control mb-1" bind:value={searchAnimalGroup} placeholder="Grupo animal" />
    <input class="form-control mb-1" bind:value={searchOtherAnimalGroup} placeholder="Otro grupo" />
    <input class="form-control mb-1" bind:value={searchNDeceased} placeholder="Fallecidos" />
    <input class="form-control mb-1" bind:value={searchNInjuresHospitalized} placeholder="Heridos hospitalizados" />
    <input class="form-control mb-1" bind:value={searchNInjuredNoHospitalized} placeholder="Heridos no hospitalizados" />
    <input class="form-control mb-1" bind:value={searchAnyo} placeholder="Anyo" />
    
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
            <th>Municipio INE</th>
            <th>Carretera</th>
            <th>Km</th>
            <th>Tipo carretera</th>
            <th>Grupo animal</th>
            <th>Otro grupo</th>
            <th>Fallecidos</th>
            <th>Heridos hospitalizados</th>
            <th>Heridos no hospitalizados</th>
            <th>Anyo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input data-testid="input-id" bind:value={newId} placeholder="ID" /></td>
            <td><input data-testid="input-community" bind:value={newCommunity} placeholder="Comunidad" /></td>
            <td><input data-testid="input-province" bind:value={newProvince} placeholder="Provincia" /></td>
            <td><input data-testid="input-date" bind:value={newAccidentDate} placeholder="Fecha" /></td>
            <td><input data-testid="input-hour" bind:value={newAccidentHour} placeholder="Hora" /></td>
            <td><input data-testid="input-ine" bind:value={newIneMunicipality} placeholder="Municipio INE" type="number" /></td>
            <td><input data-testid="input-road" bind:value={newRoad} placeholder="Carretera" /></td>
            <td><input data-testid="input-km" bind:value={newKmRoad} placeholder="Km" /></td>
            <td><input data-testid="input-type" bind:value={newTypeOfRoad} placeholder="Tipo carretera" type="number" /></td>
            <td><input data-testid="input-animal" bind:value={newAnimalGroup} placeholder="Grupo animal" type="number" /></td>
            <td><input data-testid="input-other-animal" bind:value={newOtherAnimalGroup} placeholder="Otro grupo" type="number" /></td>
            <td><input data-testid="input-deceased" bind:value={newNDeceased} placeholder="Fallecidos" type="number" /></td>
            <td><input data-testid="input-hosp" bind:value={newNInjuresHospitalized} placeholder="Heridos hospitalizados" type="number" /></td>
            <td><input data-testid="input-nonhosp" bind:value={newNInjuredNoHospitalized} placeholder="Heridos no hospitalizados" type="number" /></td>
            <td><input data-testid="input-anyo" bind:value={newAnyo} placeholder="Anyo" type="number" /></td>
            <td>
                <Button data-testid="btn-create" color="success" on:click={createAccident}>
                    <i class="bi bi-plus-circle-fill"></i> Crear
                </Button>
            </td>
        </tr>
        

        {#each accidents as accident}
            <tr>
                <td>{accident.id}</td>
                <td>{accident.autonomous_community}</td>
                <td>{accident.province}</td>
                <td>{accident.accident_date}</td>
                <td>{accident.accident_hour}</td>
                <td>{accident.ine_municipality}</td>
                <td>{accident.road}</td>
                <td>{accident.km_road}</td>
                <td>{accident.type_of_road}</td>
                <td>{accident.animal_group}</td>
                <td>{accident.other_animal_group}</td>
                <td>{accident.n_deceased}</td>
                <td>{accident.n_injures_hospitalized}</td>
                <td>{accident.n_injured_no_hospitalized}</td>
                <td>{accident.anyo}</td>
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
