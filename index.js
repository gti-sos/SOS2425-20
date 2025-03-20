const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;


const { trafficData } = require("./index-JCJ");
const { trafficData1 } = require("./index-CMR");
const { accidentData } = require("./index-JAC");

app.use("/",express.static("./public"));

app.get("/hello",(request,response)=>{
    response.send("Hello from the server!");
});

app.get("/cool",(request,response)=>{
    response.send(cool());
});

app.get("/about",(request,response)=>{
    response.redirect("/about.html");
});



// index-CMR
app.get("/samples/CMR", (req, res) => {
    // Filtrar ciudades con más de 50,000 multas por radar
    let filteredData = trafficData1.filter(entry => entry.fixed_radar > 50000);

    let responseMessage;

    if (filteredData.length > 0) {
        // Calcular la media de multas por ITV
        let avg = filteredData.reduce((sum, entry) => sum + entry.itv, 0) / filteredData.length;

        responseMessage = `Media de multas por ITV en ciudades con más de 50.000 multas por radar: ${avg.toFixed(2)}`;
    } else {
        responseMessage = "No hay ciudades con más de 50.000 multas por radar en los datos.";
    }

    // Enviar la respuesta en texto plano
    res.send(responseMessage);
});



app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}!`);
});

// index-JCJ
// Ruta para acceder a los cálculos en "/samples/JCJ"
app.get("/samples/JCJ", (req, res) => {
    // Filtrar comunidades con más de 100 accidentes mortales
    let filteredData = trafficData.filter(entry => entry.fatal_accidents > 100);

    let responseMessage;

    if (filteredData.length > 0) {
        // Calcular la media de fallecidos
        let totalDeceased = filteredData.reduce((sum, entry) => sum + entry.deceased, 0);
        let avgDeceased = totalDeceased / filteredData.length;

        responseMessage = `Media de fallecidos en comunidades con más de 100 accidentes mortales: ${avgDeceased.toFixed(2)}`;
    } else {
        responseMessage = "No hay comunidades con más de 100 accidentes mortales en los datos.";
    }

    // Enviar la respuesta al navegador
    res.send(responseMessage);
});


// Ruta para acceder a los cálculos en "/samples/JAC"
app.get("/samples/JAC", (req, res) => {
    // Contar cuántos accidentes hay por grupo de animales
    let animalGroupCount = {};
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
    let responseMessage;
    
    if (totalGroups > 0) {
        let averageAccidentsPerGroup = totalAccidents / totalGroups;
        responseMessage = `La media de accidentes por grupo de animales es: ${averageAccidentsPerGroup.toFixed(2)}`;
    } else {
        responseMessage = ` No se encontraron datos de grupos de animales en los accidentes.`;
    }

    // Enviar la respuesta al navegador
    res.send(responseMessage);
});