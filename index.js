const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;
const BASE_API = "/api/v1";

// Importar datos
const { trafficData } = require("./index-JCJ");
const { trafficData1 } = require("./index-CMR");
const { accidentData } = require("./index-JAC");

// Middleware
app.use("/", express.static("./public"));
app.use(express.json());

// Rutas básicas
app.get("/hello", (req, res) => res.send("Hello from the server!"));
app.get("/cool", (req, res) => res.send(cool()));
app.get("/about", (req, res) => res.redirect("/about.html"));

//  Ruta para obtener todos los accidentes de tráfico
app.get(`${BASE_API}/traffic-accidents`, (req, res) => {
    console.log("New GET to /traffic-accidents");
    res.json(trafficData);
});

//  Ruta para calcular la media de fallecidos en comunidades con más de 100 accidentes mortales
app.get(`${BASE_API}/traffic-accidents/stats`, (req, res) => {
    let filteredData = trafficData.filter(entry => entry.fatal_accidents > 100);

    if (filteredData.length > 0) {
        let totalDeceased = filteredData.reduce((sum, entry) => sum + entry.deceased, 0);
        let avgDeceased = totalDeceased / filteredData.length;
        res.json({ message: `Media de fallecidos en comunidades con más de 100 accidentes mortales: ${avgDeceased.toFixed(2)}` });
    } else {
        res.status(404).json({ error: "No hay comunidades con más de 100 accidentes mortales en los datos." });
    }
});

//  Ruta para CMR (Mantenimiento de radares y alcoholímetros)
app.get(`${BASE_API}/samples/CMR`, (req, res) => {
    let filteredData = trafficData1.filter(entry => entry.fixed_radar > 50000);

    if (filteredData.length > 0) {
        let avg = filteredData.reduce((sum, entry) => sum + entry.itv, 0) / filteredData.length;
        res.json({ message: `Media de multas por ITV en ciudades con más de 50.000 multas por radar: ${avg.toFixed(2)}` });
    } else {
        res.status(404).json({ error: "No hay ciudades con más de 50.000 multas por radar en los datos." });
    }
});

//  Ruta para JAC (Accidentes con animales)
app.get(`${BASE_API}/samples/JAC`, (req, res) => {
    let animalGroupCount = {};
    accidentData.forEach(entry => {
        let animalGroup = entry.animal_group;
        animalGroupCount[animalGroup] = (animalGroupCount[animalGroup] || 0) + 1;
    });

    let totalGroups = Object.keys(animalGroupCount).length;
    let totalAccidents = accidentData.length;
    
    if (totalGroups > 0) {
        let averageAccidentsPerGroup = totalAccidents / totalGroups;
        res.json({ message: `La media de accidentes por grupo de animales es: ${averageAccidentsPerGroup.toFixed(2)}` });
    } else {
        res.status(404).json({ error: "No se encontraron datos de grupos de animales en los accidentes." });
    }
});

//  Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
});
