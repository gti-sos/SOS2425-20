let accidentData = [
    { id: "202306203193", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "29/9/2023", accident_hour: "7:00", anyo: 2023, autonomous_community: "extremadura", province: "badajoz", ine_municipality: 0, road: "EX-105", km_road: "90", type_of_road: 2, animal_group: 20, other_animal_group: 2 },
    { id: "202305203064", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "24/8/2023", accident_hour: "8:30", anyo: 2023, autonomous_community: "castilla y león", province: "ávila", ine_municipality: 0, road: "N-502", km_road: "57,514", type_of_road: 2, animal_group: 2, other_animal_group: 1 },
    { id: "202304202441", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "13/2/2023", accident_hour: "0:05", anyo: 2023, autonomous_community: "andalucía", province: "almería", ine_municipality: 0, road: "A-7", km_road: "697", type_of_road: 1, animal_group: 17, other_animal_group: 1 },
    { id: "202304202454", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "18/10/2023", accident_hour: "17:15", anyo: 2023, autonomous_community: "andalucía", province: "almería", ine_municipality: 4102, road: "A-7", km_road: "799,75", type_of_road: 1, animal_group: 20, other_animal_group: 2 },
    { id: "202305203075", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "24/11/2023", accident_hour: "19:30", anyo: 2023, autonomous_community: "castilla y león", province: "ávila", ine_municipality: 0, road: "AV-941", km_road: "36,963", type_of_road: 2, animal_group: 3, other_animal_group: 1 },
    { id: "202304202464", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "3/1/2023", accident_hour: "6:45", anyo: 2023, autonomous_community: "andalucía", province: "almería", ine_municipality: 4902, road: "CEJ-7", km_road: "3", type_of_road: 2, animal_group: 20, other_animal_group: 2 },
    { id: "202303201994", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "23/2/2023", accident_hour: "21:50", anyo: 2023, autonomous_community: "comunidad valenciana", province: "alicante", ine_municipality: 3105, road: "CV-836", km_road: "3", type_of_road: 2, animal_group: 8, other_animal_group: 1 },
    { id: "202332222366", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "5/10/2023", accident_hour: "4:40", anyo: 2023, autonomous_community: "galicia", province: "ourense", ine_municipality: 0, road: "OU-0106", km_road: "1,1", type_of_road: 2, animal_group: 8, other_animal_group: 1 },
    { id: "202332222371", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "22/11/2023", accident_hour: "11:15", anyo: 2023, autonomous_community: "galicia", province: "ourense", ine_municipality: 0, road: "OU-536", km_road: "19,864", type_of_road: 2, animal_group: 5, other_animal_group: 1 },
    { id: "202302200964", n_deceased: 0, n_injures_hospitalized: 0, n_injured_no_hospitalized: 0, accident_date: "17/1/2023", accident_hour: "21:45", anyo: 2023, autonomous_community: "castilla-la mancha", province: "albacete", ine_municipality: 2003, road: "AB-104", km_road: "3,4", type_of_road: 2, animal_group: 17, other_animal_group: 1 }
];

// OBTENER LA MEDIA DE ACCIDENTES POR GRUPO DE ANIMALES
let animalGroupCount = {};

// Contar cuántos accidentes hay por grupo de animales
accidentData.forEach(entry => {
    let animalGroup = entry.animal_group;
    if (animalGroupCount[animalGroup]) {
        animalGroupCount[animalGroup]++;
    } else {
        animalGroupCount[animalGroup] = 1;
    }
});

// Calcular la media de accidentes por grupo de animales
let totalGroups = Object.keys(animalGroupCount).length; // Número de grupos de animales
let totalAccidents = accidentData.length; // Total de accidentes en el array

if (totalGroups > 0) {
    let averageAccidentsPerGroup = totalAccidents / totalGroups;
    console.log(`La media de accidentes por grupo de animales es: ${averageAccidentsPerGroup.toFixed(2)}`);
} else {
    console.log("No se encontraron datos de grupos de animales en los accidentes.");
}

// Mostrar el número de accidentes por grupo de animales
//console.log("Número de accidentes por grupo de animales:");
//for (let group in animalGroupCount) {
//    console.log(`Grupo ${group}: ${animalGroupCount[group]} accidentes`);
//}