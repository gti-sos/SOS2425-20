
const BASE_API = "/api/v1";
let trafficData = [
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

function loadBackendJCJ(app) {
    // Cargar datos iniciales si el array está vacío
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
}
export{loadBackendJCJ};