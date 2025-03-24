const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;

const BASE_API = "/api/v1"

// Middleware para parsear JSON
app.use(express.json()); //  Debe ir antes de definir las rutas

let { trafficData } = require("./index-JCJ");
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

app.get(`${BASE_API}/accidents/loadInitialData`, (req, res) => {
    console.log("New GET to /loadInitialData");

    accidentData = [
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
    
    console.log("Datos inicializados:", accidentData);
    res.status(201).json(accidentData);
});

// GET: Obtener todos los accidentes
app.get(`${BASE_API}/accidents`, (req, res) => {
    res.json(accidentData);
});

// GET: Obtener accidentes por comunidad autónoma
app.get(`${BASE_API}/accidents/:community`, (req, res) => {
    const community = req.params.community.toLowerCase();
    const result = accidentData.filter(entry => entry.autonomous_community === community);

    if (result.length > 0) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ error: `No se encuentran datos de ${community}` });
    }
});

// POST: Añadir un nuevo accidente (evitar duplicados)
app.post(`${BASE_API}/accidents`, (req, res) => {
    const newData = req.body;
    
    if (newData.id === undefined || newData.n_deceased === undefined || newData.n_injures_hospitalized === undefined || newData.n_injured_no_hospitalized === undefined || newData.accident_date === undefined
        || newData.accident_hour === undefined || newData.anyo === undefined || newData.autonomous_community === undefined || newData.province === undefined || newData.ine_municipality === undefined || newData.road === undefined 
        || newData.km_road === undefined  || newData.type_of_road === undefined  || newData.animal_group === undefined  || newData.other_animal_group === undefined) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }
    
    if (accidentData.some(entry => entry.id === newData.id)) {
        return res.status(409).json({ error: "El accidente con este ID ya existe" });
    }
    
    accidentData.push(newData);
    res.sendStatus(201);
});

// PUT: Actualizar datos de un accidente específico
app.put(`${BASE_API}/accidents/:id`, (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const index = accidentData.findIndex(entry => entry.id === id);
    
    if (index < 0) {
        return res.status(404).json({ error: "Accidente no encontrado" });
    }
    
    if (updatedData.id && updatedData.id !== id) {
        return res.status(400).json({ error: "El ID en la URL y el cuerpo deben coincidir" });
    }
    
    accidentData[index] = { ...accidentData[index], ...updatedData };
    res.status(200).json({ message: "Datos actualizados", data: accidentData[index] });
});

// DELETE: Eliminar un accidente específico
app.delete(`${BASE_API}/accidents/:id`, (req, res) => {
    const id = req.params.id;
    const initialLength = accidentData.length;
    
    accidentData = accidentData.filter(entry => entry.id !== id);
    
    if (accidentData.length === initialLength) {
        return res.status(404).json({ error: "Accidente no encontrado" });
    }
    
    res.status(200).json({ message: "Accidente eliminado" });
});

// DELETE: Eliminar todos los accidentes
app.delete(`${BASE_API}/accidents`, (req, res) => {
    accidentData = [];
    res.status(200).json({ message: "Todos los datos han sido eliminados" });
});

// Manejar todos los otros métodos no permitidos
app.all(`${BASE_API}/accidents/*`, (req, res) => {
    res.sendStatus(405);
  });


app.put(`${BASE_API}/accidents`, (req, res) => {
    res.sendStatus(405);
  });








//CARLOS



app.get(`${BASE_API}/fines/loadInitialData`, (req, res) => {
    console.log("New GET to /loadInitialData");

    trafficData1 = [
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
    
    console.log("Datos inicializados:", trafficData1);
    res.status(201).json(trafficData1);

});


// GET
// Obtener todas las multas
app.get(`${BASE_API}/fines`, (req, res) => {
    console.log("New GET to /fines");
    res.json(trafficData1);
});