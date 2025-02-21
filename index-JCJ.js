const trafficData = [
    { autonomous_community: "Andalucía", fatal_accidents: 283, deceased: 310, vehicles_without_mot: 33, year: 2023 },
    { autonomous_community: "Aragón", fatal_accidents: 70, deceased: 75, vehicles_without_mot: 12, year: 2023 },
    { autonomous_community: "Asturias, Principado de", fatal_accidents: 45, deceased: 49, vehicles_without_mot: 8, year: 2023 },
    { autonomous_community: "Balears, Illes", fatal_accidents: 60, deceased: 64, vehicles_without_mot: 3, year: 2023 },
    { autonomous_community: "Canarias", fatal_accidents: 67, deceased: 69, vehicles_without_mot: 5, year: 2023 },
    { autonomous_community: "Cantabria", fatal_accidents: 22, deceased: 24, vehicles_without_mot: 2, year: 2023 },
    { autonomous_community: "Castilla-La Mancha", fatal_accidents: 113, deceased: 123, vehicles_without_mot: 15, year: 2023 },
    { autonomous_community: "Castilla y León", fatal_accidents: 151, deceased: 167, vehicles_without_mot: 12, year: 2023 },
    { autonomous_community: "Cataluña", fatal_accidents: 267, deceased: 288, vehicles_without_mot: 36, year: 2023 },
    { autonomous_community: "Extremadura", fatal_accidents: 67, deceased: 70, vehicles_without_mot: 7, year: 2023 },
    { autonomous_community: "Galicia", fatal_accidents: 118, deceased: 128, vehicles_without_mot: 10, year: 2023 }
];

// FILTRAR COMUNIDADES CON MÁS DE 100 ACCIDENTES MORTALES
let filteredData = trafficData.filter(entry => entry.fatal_accidents > 100);

// CALCULAR LA MEDIA DE DECEASED (FALLECIDOS)
if (filteredData.length > 0) {
    let totalDeceased = filteredData.reduce((sum, entry) => sum + entry.deceased, 0);
    let avgDeceased = totalDeceased / filteredData.length;

    console.log(`Media de fallecidos en comunidades con más de 100 accidentes mortales: ${avgDeceased.toFixed(2)}`);
} else {
    console.log(" No hay comunidades con más de 100 accidentes mortales en los datos.");
}