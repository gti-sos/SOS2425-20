<script>
    // @ts-nocheck
    
        import { onMount, onDestroy } from 'svelte';
        import Chart from 'chart.js/auto';
    
        // @ts-ignore
        let canvas;
        // @ts-ignore
        let chart;
    
        onMount(async () => {
            // 1) Traer top 10 películas desde IMDb
            const url = 'https://imdb-top-100-movies.p.rapidapi.com/';
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '2c001ce06cmsh489140de8de67d7p1f0f32jsncf17ff25ca89',
                    'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com'
                }
            };
            
            const res = await fetch(url, options);
            const data = await res.json();
    
            // 2) Preparar etiquetas y datos
            const labels = data.slice(0, 10).map(movie => movie.title); // Top 10 películas
            const ratings = data.slice(0, 10).map(movie => Number(movie.rating) || 0); // Calificaciones
    
            // 3) Crear gráfico de área polar
            chart = new Chart(canvas.getContext('2d'), {
                type: 'polarArea',
                data: {
                    labels,
                    datasets: [{
                        label: 'IMDb Ratings',
                        data: ratings,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#E7E9ED', '#8A2BE2',
                            '#00CED1', '#DC143C'
                        ]
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: ({ parsed }) => `${parsed} ⭐`
                            }
                        },
                        title: {
                            display: true,
                            text: 'Top 10 IMDb Movies - Polar Area Chart'
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
        <h2>Top 10 IMDb Movies</h2>
        <canvas bind:this={canvas}></canvas>
    </div>
    