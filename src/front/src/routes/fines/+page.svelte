<svelte:head>
	<title>Multas</title>
</svelte:head>

<script>
    // @ts-nocheck
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import { Button, Table } from "@sveltestrap/sveltestrap";

    let DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/fines";

    if (dev) API = DEVEL_HOST + API;

    let fines = [];
    let resultStatus = null;
    let result = null;
    let newCity = "";
    let newYear = "";
    let newItv = "";
    let newAlcoholRate = "";
    let newFixedRadar = "";

    let searchCity = "";
    let searchFrom = "";
    let searchTo = "";
    let searchItv = "";
    let searchAlcoholRate = "";
    let searchFixedRadar = "";

    let firstLoad = true;

    async function getFines() {
        try {
            const res = await fetch(API);
            const data = await res.json();
            fines = data;

            if (firstLoad && data.length === 0) {
                const initRes = await fetch(API + "/loadInitialData");
                if (initRes.status === 201 || initRes.status === 200) {
                    const loaded = await initRes.json();
                    fines = loaded;
                    resultStatus = 201;
                }
            }

            firstLoad = false;
        } catch (error) {
            console.log(`ERROR al obtener datos de ${API}: ${error}`);
        }
    }

    async function createFine() {
        resultStatus = null;

        if (!newCity || !newYear || !newItv || !newAlcoholRate || !newFixedRadar) {
            resultStatus = 400;
            return;
        }

        const newEntry = {
            city: newCity,
            year: parseInt(newYear),
            itv: parseInt(newItv),
            alcohol_rate: parseFloat(newAlcoholRate),
            fixed_radar: parseInt(newFixedRadar),
        };

        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry),
            });

            resultStatus = res.status;

            if (res.status == 201) {
                await getFines();
            }
        } catch (error) {
            console.log(`ERROR en POST a ${API}: ${error}`);
        }
    }

    async function deleteAllFines() {
        resultStatus = null;
        try {
            const res = await fetch(API, { method: "DELETE" });
            resultStatus = res.status;
            if (res.status === 200) await getFines();
        } catch (error) {
            console.log(`ERROR al hacer DELETE total: ${error}`);
        }
    }

    async function deleteFine(city, year) {
        resultStatus = null;
        try {
            const res = await fetch(`${API}/${city}/${year}`, {
                method: "DELETE",
            });
            resultStatus = res.status;
            if (res.status == 200) await getFines();
        } catch (error) {
            console.log(`ERROR al eliminar: ${error}`);
        }
    }

    async function searchFines() {
        let url = new URL(API, window.location.origin);
        if (searchCity) url.searchParams.append("city", searchCity);
        if (searchFrom) url.searchParams.append("from", searchFrom);
        if (searchTo) url.searchParams.append("to", searchTo);
        if (searchItv) url.searchParams.append("itv", searchItv);
        if (searchAlcoholRate) url.searchParams.append("alcohol_rate", searchAlcoholRate);
        if (searchFixedRadar) url.searchParams.append("fixed_radar", searchFixedRadar);

        resultStatus = null;
        try {
            const res = await fetch(url);
            const data = await res.json();
            fines = data;
            resultStatus = res.status;
        } catch (error) {
            console.log(`ERROR al buscar: ${error}`);
        }
    }

    onMount(getFines);
</script>

<h2>Listado de Multas</h2>

{#if resultStatus !== null}
    <p>
        {#if resultStatus === 201}
            <i class="bi bi-check-circle-fill text-success"></i> Entrada creada correctamente.
        {:else if resultStatus === 200}
            <i class="bi bi-check-circle-fill text-success"></i> Operación completada correctamente.
        {:else if resultStatus === 400}
            <i class="bi bi-exclamation-triangle-fill text-warning"></i> Faltan datos. Por favor, revisa todos los campos.
        {:else if resultStatus === 409}
            <i class="bi bi-x-circle-fill text-danger"></i> Ya existe una entrada con esa ciudad y año.
        {:else if resultStatus === 404}
            <i class="bi bi-x-circle-fill text-danger"></i> Recurso no encontrado.
        {:else}
            <i class="bi bi-x-circle-fill text-danger"></i> Error inesperado (código {resultStatus}).
        {/if}
    </p>
{/if}

<h4><i class="bi bi-search"></i> Buscar registros</h4>
<div class="mb-4">
    <input class="form-control mb-1" bind:value={searchCity} placeholder="Ciudad" />
    <input class="form-control mb-1" bind:value={searchFrom} placeholder="Desde (año)" type="number" />
    <input class="form-control mb-1" bind:value={searchTo} placeholder="Hasta (año)" type="number" />
    <input class="form-control mb-1" bind:value={searchItv} placeholder="Multas ITV" type="number" />
    <input class="form-control mb-1" bind:value={searchAlcoholRate} placeholder="Tasa Alcohol" type="number" />
    <input class="form-control mb-1" bind:value={searchFixedRadar} placeholder="Radar Fijo" type="number" />
    <Button color="primary" on:click={searchFines}>
        <i class="bi bi-search"></i> Buscar
    </Button>
    <Button color="secondary" class="ms-2" on:click={getFines}>
        <i class="bi bi-arrow-clockwise"></i> Limpiar
    </Button>
</div>

<Table>
    <thead>
        <tr>
            <th>Ciudad</th>
            <th>Año</th>
            <th>Multas ITV</th>
            <th>Tasa Alcohol</th>
            <th>Radar Fijo</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input bind:value={newCity} placeholder="Ciudad" data-testid="input-city" /></td>
            <td><input type="number" bind:value={newYear} placeholder="Año" data-testid="input-year" /></td>
            <td><input type="number" bind:value={newItv} placeholder="Multas ITV" data-testid="input-itv" /></td>
            <td><input type="number" bind:value={newAlcoholRate} placeholder="Multas Alcohol" data-testid="input-alcohol" /></td>
            <td><input type="number" bind:value={newFixedRadar} placeholder="Multas Radar" data-testid="input-radar" /></td>
            <td>
              <Button color="success" on:click={createFine}>
                <i class="bi bi-plus-circle-fill"></i> Crear
              </Button>
            </td>
          </tr>
          
        {#each fines as fine}
            <tr>
                <td>{fine.city}</td>
                <td>{fine.year}</td>
                <td>{fine.itv}</td>
                <td>{fine.alcohol_rate}</td>
                <td>{fine.fixed_radar}</td>
                <td>
                    <Button color="warning" href={`/fines/${fine.city}/${fine.year}`} class="me-2">
                        <i class="bi bi-pencil-fill"></i> Editar
                    </Button>
                    <Button color="danger" on:click={() => deleteFine(fine.city, fine.year)}>
                        <i class="bi bi-trash3-fill"></i> Eliminar
                    </Button>
                </td>
            </tr>
        {/each}
    </tbody>
</Table>

<Button color="danger" class="mt-3" on:click={deleteAllFines}>
    <i class="bi bi-trash-fill"></i> Eliminar todos los recursos
</Button>
