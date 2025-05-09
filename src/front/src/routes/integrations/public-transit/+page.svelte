<script>
  import { onMount } from 'svelte';

  let accidents = [];
  let transit = [];

  // Definir la función getData
  // @ts-ignore
  async function getData(API) {
    try {
      const res = await fetch(API);
      let result = await res.json();

      // Si no hay datos, intentar cargar los datos iniciales
      if (result.length === 0) {
        const init = await fetch(API + "/loadInitialData");
        if (init.ok) {
          result = await init.json();
          console.log("Datos iniciales cargados automáticamente.");
        } else {
          console.error("Error al cargar datos iniciales.");
        }
      }

      return result;
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }

  // Cargar la librería de Google Charts de forma dinámica
  function loadGoogleCharts() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      // @ts-ignore
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.body.appendChild(script);
    });
  }

  onMount(async () => {
    // Cargar Google Charts
    await loadGoogleCharts();

    // Cargar el paquete para el gráfico de burbujas
    // @ts-ignore
    google.charts.load('current', { packages: ['corechart', 'bubble'] });

    // Esperar a que Google Charts esté listo
    // @ts-ignore
    google.charts.setOnLoadCallback(async () => {
      // Obtener datos de ambas APIs
      accidents = await getData("https://sos2425-20.onrender.com/api/v1/accidents-with-animals");
      transit = await getData("https://sos2425-21.onrender.com/api/v1/public-transit-stats");

      console.log("Datos de accidentes:", accidents);
      console.log("Datos de transporte público:", transit);

      // Agrupar accidentes por año
      const accidentsByYear = {};
      // @ts-ignore
      accidents.forEach(d => {
        if (!d.anyo) return;
        // @ts-ignore
        accidentsByYear[d.anyo] = (accidentsByYear[d.anyo] || 0) + 1;
      });

      // Agrupar viajes totales por año
      const transitByYear = {};
      // @ts-ignore
      transit.forEach(d => {
        if (!d.year) return;
        // @ts-ignore
        transitByYear[d.year] = (transitByYear[d.year] || 0) + d.total_trips;
      });

      console.log("Accidentes agrupados por año:", accidentsByYear);
      console.log("Transporte público agrupado por año:", transitByYear);

      // Años comunes entre accidentes y viajes
      const commonYears = Object.keys(accidentsByYear)
        .filter(y => y in transitByYear)
        .sort();

      console.log("Años comunes:", commonYears);

      // Si no hay años comunes, mostramos un mensaje
      if (commonYears.length === 0) {
        console.log("No hay años comunes para comparar.");
        return;
      }

      // Preparar los datos para el gráfico
      const dataTable = [['Año', 'Accidentes', 'Viajes Totales', { role: 'size' }]]; // Define la estructura de los datos
      commonYears.forEach(y => {
        // @ts-ignore
        const accidentCount = accidentsByYear[y] || 0;
        // @ts-ignore
        const transitCount = transitByYear[y] || 0;
        dataTable.push([y, accidentCount, transitCount, accidentCount]); // El último valor es para el tamaño de la burbuja
      });

      // Dibujar el gráfico después de que Google Charts haya terminado de cargar
      // @ts-ignore
      const data = google.visualization.arrayToDataTable(dataTable);

      const options = {
        title: 'Comparativa: Accidentes con Animales vs Viajes Totales',
        hAxis: { title: 'Año' },
        vAxis: { title: 'Cantidad' },
        bubble: { textStyle: { fontSize: 12 } },
        sizeAxis: { minSize: 5, maxSize: 15 },
        colors: ['#ff7f0e', '#1f77b4']
      };

      // @ts-ignore
      const chart = new google.visualization.BubbleChart(document.getElementById('chart'));
      chart.draw(data, options);
    });
  });
</script>

<h2 style="text-align: center;">Comparativa: Accidentes con Animales vs Viajes Totales</h2>
<div id="chart" style="margin: 2rem auto; max-width: 900px; background: #f8f8f8; padding: 20px; border-radius: 10px;"></div>
