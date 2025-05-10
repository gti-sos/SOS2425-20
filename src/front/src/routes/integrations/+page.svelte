<!-- src/routes/integrations/+page.svelte -->
<svelte:head>
  <title>Integraciones SOS2425</title>
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"/>
</svelte:head>

<script>
  // Widget Jose (apis externas)
  const integracionesJose = [
    { path: 'countries',    label: 'Países más poblados' },
    { path: 'crypto',      label: 'Criptomonedas' },
    { path: 'weather',     label: 'Tiempo (Open-Meteo)' }
  ];

  // "APIs de SOS" (botones bajo el mismo autor)
  const apisDeSOS = [
    { path: 'annual-evolutions', label: 'Evoluciones Anuales' },
    { path: 'forest-fires',      label: 'Incendios Forestales' },
    { path: 'dana-erte-stats',    label: 'DANA ERTE Stats' },
    { path: 'water-supply-improvements',    label: 'Mejoras Suministro De Agua' }
  ];

  const apisJavi = [
    { path: 'IMDb', label: 'Rating peliculas'},
    { path: 'football-leagues', label: 'Ligas populares'},
    { path: 'covid-19', label: 'Covid-19 por paises'}
  ]

  const integracionesJavi = [
    { path: 'accidentsanimals-fpbasic', label: 'accidentsanimals-fpbasic'},
    { path: 'accidentsanimals-ticket', label: 'accidentsanimals-ticket'},
    { path: 'accidentsanimals-autonomy', label: 'accidentsanimals-autonomy'}
  ]

  const apisCarlos = [
    { path: 'exchange-rates', label: 'Tasas de cambio'},
    { path: 'covid-spain', label: 'Casos de covid en España'}
  ]

  const integracionesCarlos = [
    { path: 'radar-stats', label: 'radar-stats'},
    { path: 'dana-grants-subsidies-stats', label: 'dana-grants-subsidies-stats'}
  ]
</script>

<div class="container my-5">
  <h1 class="text-center mb-4">Integraciones SOS2425</h1>

  <h2 class="h5 mb-3">Widget Jose (APIs externas)</h2>
  <div class="row mb-5">
    {#each integracionesJose as integ}
      <div class="col-6 col-md-4 mb-3">
        <a href={`/integrations/${integ.path}`} class="btn btn-primary w-100">
          {integ.label}
        </a>
      </div>
    {/each}
  </div>

  <h2 class="h5 mb-3">Widget Javi (APIs externas)</h2>
  <div class="row mb-5">
    {#each apisJavi as integ}
      <div class="col-6 col-md-4 mb-3">
        <a href={`/integrations/${integ.path}`} class="btn btn-primary w-100">
          {integ.label}
        </a>
      </div>
    {/each}
  </div>

  <h2 class="h5 mb-3">Widget Carlos (APIs externas)</h2>
  <div class="row mb-5">
    {#each apisCarlos as integ}
      <div class="col-6 col-md-4 mb-3">
        <a href={`/integrations/${integ.path}`} class="btn btn-primary w-100">
          {integ.label}
        </a>
      </div>
    {/each}
  </div>

  <h2 class="h5 mb-3">Integraciones Javi (APIs externas)</h2>
  <div class="row mb-5">
    {#each integracionesJavi as integ}
      <div class="col-6 col-md-4 mb-3">
        <a href={`/integrations/${integ.path}`} class="btn btn-primary w-100">
          {integ.label}
        </a>
      </div>
    {/each}
  </div>

  

  <h2 class="h5 mb-3">Integraciones/Widget José (APIs de SOS)</h2>
  <div class="row">
    {#each apisDeSOS as api}
      <div class="col-6 col-md-4 mb-3">
        <a href={`/integrations/${api.path}`} class="btn btn-primary w-100">
          {api.label}
        </a>
      </div>
    {/each}
  </div>


  <h2 class="h5 mb-3">Integraciones Carlos (APIs de SOS)</h2>
  <div class="row mb-5">
    {#each integracionesCarlos as integ}
      <div class="col-6 col-md-4 mb-3">
        <a href={`/integrations/${integ.path}`} class="btn btn-primary w-100">
          {integ.label}
        </a>
      </div>
    {/each}
  </div>
</div>
