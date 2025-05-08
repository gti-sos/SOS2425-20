<script>
    import { onMount, onDestroy } from 'svelte';
    import Highcharts from 'highcharts';
    
    // @ts-ignore
    let chart;
    
    onMount(async () => {
      // 1) Fetch a la API del compañero (nuestro proxy)
      const res = await fetch('/integrations/covid-19/proxy');
      const data = await res.json();
    
      if (data && data.response && data.response.length > 0) {
        // 2) Ordenar por número total de casos en orden descendente y seleccionar los 15 primeros
        const sorted = data.response
          // @ts-ignore
          .filter(item => item.cases.total && item.cases.total > 0)
          // @ts-ignore
          .sort((a, b) => b.cases.total - a.cases.total)
          .slice(0, 15);
    
        // @ts-ignore
        const countries = sorted.map(item => item.country);
        // @ts-ignore
        const cases = sorted.map(item => item.cases.total);
    
        // 3) Crear el gráfico con Highcharts (usamos Column Chart)
        // @ts-ignore
        chart = Highcharts.chart('covid-chart', {
          chart: {
            type: 'column'
          },
          title: {
            text: 'Top 15 Continenetes o Países con más Casos de COVID-19'
          },
          xAxis: {
            categories: countries,
            title: {
              text: 'Países'
            }
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Casos Totales',
              align: 'high'
            },
            labels: {
              overflow: 'justify'
            }
          },
          tooltip: {
            valueSuffix: ' casos'
          },
          plotOptions: {
            column: {
              dataLabels: {
                enabled: true
              }
            }
          },
          series: [{
            name: 'Casos',
            data: cases
          }],
          responsive: {
            rules: [{
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                chart: {
                  spacingLeft: 10,
                  spacingRight: 10
                },
                xAxis: {
                  labels: {
                    rotation: -45
                  }
                },
                yAxis: {
                  labels: {
                    style: {
                      fontSize: '8px'
                    }
                  }
                }
              }
            }]
          }
        });
      }
    });
    
    onDestroy(() => {
      // Limpieza del gráfico
      // @ts-ignore
      chart?.destroy();
    });
  </script>
  
  <style>
    .chart-container {
      max-width: 900px;
      margin: 2rem auto;
      text-align: center;
    }
    #covid-chart {
      height: 500px;
    }
  </style>
  
  <div class="chart-container">
    <h2>COVID-19: Top 15 Continentes o Países con más Casos</h2>
    <div id="covid-chart"></div>
  </div>
  