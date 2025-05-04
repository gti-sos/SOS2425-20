<script>
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
  
    // @ts-ignore
    let canvas;
    // @ts-ignore
    let chart;
  
    onMount(async () => {
      // Coordenadas estimadas de Sevilla; ajústalas si necesitas otra ubicación
      const lat = 37.3891;
      const lon = -5.9845;
      const timezone = 'Europe/Madrid';
  
      // 1) Llamada a Open-Meteo para temperaturas diarias
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lon}` +
        `&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=${encodeURIComponent(timezone)}`
      );
      const data = await res.json();
  
      // 2) Extraer los próximos 7 días
      const labels = data.daily.time.slice(0, 7);
      const maxTemps = data.daily.temperature_2m_max.slice(0, 7);
      const minTemps = data.daily.temperature_2m_min.slice(0, 7);
  
      // 3) Crear radar chart
      // @ts-ignore
      chart = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
          labels,
          datasets: [
            {
              label: 'Temp máxima (°C)',
              data: maxTemps
            },
            {
              label: 'Temp mínima (°C)',
              data: minTemps
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { display: true },
              suggestedMin: Math.min(...minTemps) - 5,
              suggestedMax: Math.max(...maxTemps) + 5,
              ticks: {
                callback: v => v + '°C'
              }
            }
          },
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: ctx =>
                  `${ctx.dataset.label}: ${ctx.formattedValue}°C`
              }
            }
          }
        }
      });
    });
  
    onDestroy(() => {
      // @ts-ignore
      chart?.destroy();
    });
  </script>
  
  <style>
    .chart-container {
      width: 100%;
      max-width: 800px;
      height: 500px;
      margin: 2rem auto;
    }
  </style>
  
  <div class="chart-container">
    <h2>Radar Chart: Temperaturas en Sevilla (Próximos 7 días)</h2>
    <canvas bind:this={canvas}></canvas>
  </div>
  