<script>
    import { onMount } from 'svelte';

    // @ts-ignore
    let chartDiv;

    onMount(async () => {
        // Cargar jQuery desde CDN
        const scriptJQuery = document.createElement('script');
        scriptJQuery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        scriptJQuery.onload = () => {
            // Cargar Raphael.js desde CDN
            const scriptRaphael = document.createElement('script');
            scriptRaphael.src = 'https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js';
            scriptRaphael.onload = () => {
                // Cargar Morris.js desde CDN
                const scriptMorris = document.createElement('script');
                scriptMorris.src = 'https://cdnjs.cloudflare.com/ajax/libs/morris.js/0.5.1/morris.min.js';
                scriptMorris.onload = async () => {
                    // Obtener los datos de la API de IMDb
                    const url = 'https://imdb-top-100-movies.p.rapidapi.com/';
                    const options = {
                        method: 'GET',
                        headers: {
                            'x-rapidapi-key': '2c001ce06cmsh489140de8de67d7p1f0f32jsncf17ff25ca89',
                            'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com',
                        },
                    };
                    const res = await fetch(url, options);
                    const data = await res.json();
                    
                    // Preparar las etiquetas (títulos de las películas) y los valores (calificaciones)
                    // @ts-ignore
                    const labels = data.slice(0, 10).map(movie => movie.title); // Top 10 películas
                    // @ts-ignore
                    const ratings = data.slice(0, 10).map(movie => Number(movie.rating) || 0); // Calificaciones
                    
                    // Inicializar el gráfico de donut con Morris.js
                    // @ts-ignore
                    new Morris.Donut({
                        // @ts-ignore
                        element: chartDiv,
                        // @ts-ignore
                        data: labels.map((label, index) => ({
                            label: label,  // Nombre de la película
                            value: ratings[index],  // Calificación de la película
                        })),
                        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00CED1', '#DC143C', '#FFD700'],
                        resize: true,  // Ajustar el tamaño cuando la ventana cambie de tamaño
                    });
                };
                document.body.appendChild(scriptMorris);
            };
            document.body.appendChild(scriptRaphael);
        };
        document.body.appendChild(scriptJQuery);
    });
</script>

<style>
    .chart-container {
        width: 100%;
        max-width: 800px;
        height: 500px;
        margin: 2rem auto;
        text-align: center;
    }
</style>

<div class="chart-container">
    <h2>Top 10 IMDb Movies - Donut Chart</h2>
    <div bind:this={chartDiv}></div>
</div>
