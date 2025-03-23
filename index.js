const dataStore = require("nedb");
let db_JAC = new dataStore();

const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;

const BASE_API = "/api/v1"

// Middleware para parsear JSON
app.use(express.json()); //  Debe ir antes de definir las rutas

let { trafficData } = require("./index-JCJ");
const { trafficData1 } = require("./index-CMR");
let { accidentData } = require("./index-JAC");
let { API_JAC_v1 } = require ("./index-JAC");
API_JAC_v1(app, db_JAC);


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


//L05

//Jose

app.get(`${BASE_API}/traffic-accidents/loadInitialData`, (req, res) => {
    console.log("New GET to /loadInitialData");

    trafficData = [ 
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

    console.log("Datos inicializados:", trafficData);
    res.status(201).json(trafficData);
});



// GET
// Obtener todos los accidentes de tráfico
app.get(`${BASE_API}/traffic-accidents`, (req, res) => {
    console.log("New GET to /traffic-accidents");
    res.json(trafficData);
});


app.get(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
    const community = req.params.community;
    console.log(`New GET to /traffic-accidents/${community}`);

    const search = trafficData.filter(entry => entry.autonomous_community === community);
    
    if (search.length > 0) {
        return res.status(200).json(search);
    } else {   
        return res.status(404).json({ error: `No se encuentran datos de ${community}` });
    }
});

// POST: Añadir un nuevo accidente de tráfico (evitar duplicados)
app.post(`${BASE_API}/traffic-accidents`, (req, res) => {
    console.log("New POST to /traffic-accidents");
    let newData = req.body;

    // Verificar si ya existe un dato con la misma comunidad y año
    if (trafficData.some(entry => 
        entry.year === newData.year && 
        entry.autonomous_community === newData.autonomous_community)) {
        return res.status(409).json({ error: "Ya existe un dato con esa comunidad y año" });
    }

    // Validar que todos los campos requeridos estén presentes
    if (!newData.year || !newData.autonomous_community || !newData.fatal_accidents || 
        !newData.deceased || !newData.vehicles_without_mot) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Agregar el nuevo dato a trafficData
    trafficData.push(newData);
    res.sendStatus(201);
});

app.post(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
    const community = req.params.community;
    console.log(`New POST to /traffic-accidents/${community}`);
    res.status(405).json({ error: "Método POST no permitido" });
});


// PUT no permitido a nivel general
app.put(`${BASE_API}/traffic-accidents`, (req, res) => {
    console.log("New PUT to /traffic-accidents");
    res.status(405).json({ error: "Método PUT no permitido" });
});

// Actualizar los datos de una comunidad autónoma específica
app.put(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
    let community = req.params.community; // Obtener comunidad desde la URL
    console.log(`New PUT to /traffic-accidents/${community}`);

    const index = trafficData.findIndex(entry => entry.autonomous_community === community);

    //  Verificar si la comunidad de la URL existe en los datos
    if (index < 0) {
        return res.status(404).json({ error: `No se encuentran datos de ${community}` });
    }

    let updatedData = req.body;

    //  Verificar que el JSON contenga el mismo nombre que la URL
    if (updatedData.autonomous_community !== community) {
        return res.status(400).json({ error: "El nombre de la comunidad en la URL y en el cuerpo de la solicitud deben coincidir" });
    }

    // Actualizar solo los campos permitidos, sin cambiar la comunidad autónoma
    trafficData[index] = {
        ...trafficData[index], // Mantiene los datos actuales
        ...updatedData        // Sobrescribe solo los campos enviados
    };

    res.status(200).json({ message: "Datos actualizados", data: trafficData[index] });
});

// Eliminar todos los accidentes de tráfico
app.delete(`${BASE_API}/traffic-accidents`, (req, res) => {
    console.log("New DELETE to /traffic-accidents");
    trafficData = []; //  Se reasigna correctamente el array
    res.status(200).json({ message: "Todos los datos han sido eliminados" });
});


// Eliminar los datos de una comunidad autónoma específica
app.delete(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
    const community = req.params.community;
    console.log(`New DELETE to /traffic-accidents/${community}`);

    const exists = trafficData.some(entry => entry.autonomous_community === community);
    
    if (exists) {
        trafficData = trafficData.filter(entry => entry.autonomous_community !== community);
        res.status(200).json({ message: `Datos de ${community} eliminados`, data: trafficData });
    } else {
        res.status(404).json({ error: `No se encuentran datos de ${community}` });
    }
});

//Javi

module.exports = { accidentData };




