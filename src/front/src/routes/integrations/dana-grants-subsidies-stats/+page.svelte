<svelte:head>
  <!-- Cargar estilos de C3.js -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css" />
</svelte:head>

<script>
  import { onMount } from 'svelte';

  let chart;

  onMount(async () => {
    const d3 = await import('d3');
    const c3 = await import('c3');

    try {
      const [resFines, resGrants] = await Promise.all([
        fetch('https://sos2425-20.onrender.com/api/v1/fines'),
        fetch('https://sos2425-18.onrender.com/api/v2/dana-grants-subsidies-stats')
      ]);

      const finesData = await resFines.json();
      const grantsData = await resGrants.json();

      // Calcular totales SIN filtrar por año
      // @ts-ignore
      const totalITVFines = finesData.reduce((sum, item) => sum + (item.itv || 0), 0);
      // @ts-ignore
      const totalGrants = grantsData.reduce((sum, item) => sum + (item.amt_granted || 0), 0);

      chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: [
            ['Multas por ITV', totalITVFines],
            ['Subvenciones DANA', totalGrants]
          ],
          type: 'donut'
        },
        donut: {
          title: 'ITV vs Subvenciones'
        },
        tooltip: {
          format: {
            // @ts-ignore
            value: function (value) {
              return value.toLocaleString();
            }
          }
        },
        legend: {
          position: 'right'
        }
      });
    } catch (error) {
      console.error('Error al cargar o procesar los datos:', error);
    }
  });
</script>

<!-- Contenedor del gráfico -->
<div id="chart" style="max-width: 600px; height: 400px; margin: auto;"></div>
