<script>
  
  // @ts-nocheck

  import { onMount, tick } from "svelte";
  import Chart from 'chart.js/auto';
  import { dev } from "$app/environment";

  // Construimos la URL de la API, usando el backend local en desarrollo
  let DEVEL_HOST = "http://localhost:16078";
  let API = "/api/v1/traffic-accidents";
  if (dev) API = DEVEL_HOST + API;

  // Estado de la aplicación: datos completos, lista de comunidades y años
  let data = [];
  let communities = [];
  let years = [];

  // Selecciones de usuario
  let selectedCommunity = "";
  let selectedYear = "";

  // Referencias para el canvas y la instancia de Chart.js
  let canvasRef;
  let chartInstance;

  //1) Carga inicial de datos desde la API.
  
  async function getData() {
    try {
      const res = await fetch(API);
      let result = await res.json();

      if (result.length === 0) {
        const init = await fetch(API + "/loadInitialData");
        if (init.ok) {
          result = await init.json();
          console.log("Datos iniciales cargados automáticamente.");
        } else {
          console.error("Error al cargar datos iniciales.");
        }
      }

      data = result;
      communities = [...new Set(data.map(d => d.autonomous_community))].sort();
      years       = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }

  /**
   * 2) Dibuja o actualiza el gráfico polar según la comunidad y el año seleccionados.
   *    - Esperamos a que el DOM se actualice (tick) para que canvasRef esté disponible.
   *    - Filtramos los datos, sumamos totales y configuramos Chart.js.
   */
  async function drawChart() {
    await tick();
    if (!selectedCommunity) return;  // No dibujar si no hay comunidad seleccionada

    // Filtrado de datos por comunidad y (opcional) por año
    let filtered = data.filter(d => d.autonomous_community === selectedCommunity);
    let labelSuffix = "todos los años";
    if (selectedYear !== "") {
      filtered = filtered.filter(d => d.year === parseInt(selectedYear));
      labelSuffix = selectedYear;
    }
    if (filtered.length === 0) return;  // No dibujar si el filtro no encontró nada

    // Agregamos cada métrica en un único objeto total
    const total = { fatal_accidents: 0, deceased: 0, vehicles_without_mot: 0 };
    filtered.forEach(d => {
      total.fatal_accidents     += d.fatal_accidents || 0;
      total.deceased            += d.deceased || 0;
      total.vehicles_without_mot += d.vehicles_without_mot || 0;
    });

    // Destruir instancia previa para evitar duplicados
    if (chartInstance) chartInstance.destroy();

    // Inicializar el polarArea chart
    const ctx = canvasRef.getContext("2d");
    chartInstance = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: ["Accidentes mortales", "Fallecidos", "Sin ITV"],
        datasets: [{
          data: [
            total.fatal_accidents,
            total.deceased,
            total.vehicles_without_mot
          ],
          // Colores con un poco de opacidad
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Distribución en ${selectedCommunity} (${labelSuffix})`
          }
        }
      }
    });
  }

  // 3) Al montar el componente, cargamos los datos iniciales
  onMount(getData);
</script>

<style>
  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    width: 100%;
  }
  select {
    padding: 0.5rem;
    font-size: 1rem;
    max-width: 300px;
  }
  .canvas-wrapper {
    width: 500px;
    height: 500px;
    max-width: 90vw;
    max-height: 90vw;
    position: relative;
  }
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>

<div class="chart-container">
  <h2>Distribución de accidentes por comunidad</h2>

  <!-- Selector de comunidad -->
  <select bind:value={selectedCommunity} on:change={drawChart}>
    <option value="">-- Selecciona comunidad --</option>
    {#each communities as c}
      <option value={c}>{c}</option>
    {/each}
  </select>

  <!-- Selector de año, deshabilitado hasta elegir comunidad -->
  <select bind:value={selectedYear} on:change={drawChart} disabled={!selectedCommunity}>
    <option value="">Todos los años</option>
    {#each years as y}
      <option value={y}>{y}</option>
    {/each}
  </select>

  <!-- Solo mostramos el canvas tras elegir comunidad -->
  {#if selectedCommunity}
    <div class="canvas-wrapper">
      <canvas bind:this={canvasRef}></canvas>
    </div>
  {/if}
</div>
