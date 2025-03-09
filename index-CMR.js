let trafficData1 = [
    { city: "Badajoz", itv: 10774, alcohol_rate: 662, fixed_radar: 52155, year: 2023},
    { city: "Coruña", itv: 10104, alcohol_rate: 4367, fixed_radar: 52765, year: 2023},
    { city: "Madrid", itv: 93644, alcohol_rate: 5870, fixed_radar: 302579, year: 2023},
    { city: "Murcia", itv: 24173, alcohol_rate: 2505, fixed_radar: 56081, year: 2023},
    { city: "Santa Criz de Tenerife", itv: 11976, alcohol_rate: 3597, fixed_radar: 19760, year: 2023},  
    { city: "Sevilla", itv: 28614, alcohol_rate: 4777, fixed_radar: 174985, year: 2023},
    { city: "Toledo", itv: 19577, alcohol_rate: 861, fixed_radar: 67338, year: 2023},
    { city: "Valencia", itv: 43444, alcohol_rate: 4339, fixed_radar: 122354, year: 2023},
    { city: "Valladolid", itv: 7857, alcohol_rate: 671, fixed_radar: 28561, year: 2023},
    { city: "Zaragoza", itv: 11704, alcohol_rate: 817, fixed_radar: 45231, year: 2023}
]


// FILTRAR CIUDADES CON MÁS DE 50.000 MULTAS POR RADAR
let filteredData = trafficData1.filter(entry => entry.fixed_radar > 50000);

// CALCULAR LA MEDIA DE MULTAS 
if (filteredData.length > 0) {
    let avg = filteredData.reduce((sum, entry) => sum + entry.itv, 0) / filteredData.length;

    console.log(`Media de multas por ITV en ciudades con más de 50.000 multas por radar: ${avg.toFixed(2)}`);
} else {
    console.log(" No hay ciudades con más de 50.000 multas por radar en los datos.");
}
module.exports = { trafficData1 };