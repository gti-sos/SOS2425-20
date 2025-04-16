<script>
    // @ts-nocheck
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import { Button, Table } from '@sveltestrap/sveltestrap';
    
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
    
    async function getTrafficAccidents() {
        resultStatus = null;
        try {
            const res = await fetch(API, { method: "GET" });
            const data = await res.json();
            trafficAccidents = data;
            console.log(`Respuesta recibida:\n${JSON.stringify(data, null, 2)}`);
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
            vehicles_without_mot: parseInt(newVehiclesWithoutMot)
        };

        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry)
            });

            resultStatus = res.status;

            if (res.status == 201) {
                console.log("Entrada creada correctamente");
                await getTrafficAccidents();
            } else {
                console.log("ERROR al crear entrada:", res.status);
            }
        } catch (error) {
            console.log(`ERROR en POST a ${API}: ${error}`);
        }
    }
    
    async function deleteTrafficAccident(community, year) {
        resultStatus = null;
        try {
            const res = await fetch(`${API}/${community}/${year}`, {
                method: "DELETE"
            });
            resultStatus = res.status;

            if (res.status == 200) {
                console.log("Eliminado correctamente");
                await getTrafficAccidents();
            } else {
                console.log("ERROR al eliminar:", res.status);
            }
        } catch (error) {
            console.log(`ERROR al eliminar en ${API}: ${error}`);
        }
    }
    
    onMount(() => {
        getTrafficAccidents();
    });
</script>

<h2>Listado de Accidentes de Tráfico</h2>

{#if resultStatus !== null}
    <p>
        {#if resultStatus === 201}
            ✅ Entrada creada correctamente.
        {:else if resultStatus === 200}
            ✅ Operación completada correctamente.
        {:else if resultStatus === 400}
            ⚠️ Faltan datos. Por favor, revisa todos los campos.
        {:else if resultStatus === 409}
            ❌ Ya existe una entrada con esa comunidad y año.
        {:else if resultStatus === 404}
            ❌ Recurso no encontrado.
        {:else}
            ❌ Error inesperado (código {resultStatus}).
        {/if}
    </p>
{/if}

<Table>
    <thead>
        <tr>
            <th>Comunidad</th>
            <th>Año</th>
            <th>Accidentes mortales</th>
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
                <Button color="secondary" on:click={createTrafficAccident}>Crear</Button>
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
                <Button color="danger" on:click={() => deleteTrafficAccident(ta.autonomous_community, ta.year)}>Eliminar</Button>
            </td>
        </tr>
        {/each}
    </tbody>
</Table>
