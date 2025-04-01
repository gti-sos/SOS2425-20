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
    { city: "Zaragoza", itv: 11704, alcohol_rate: 817, fixed_radar: 45231, year: 2023},
    { city: "Madrid", itv: 11704, alcohol_rate: 817, fixed_radar: 45231, year: 2024}
]

function loadBackendCMR(app){
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
            { city: "Zaragoza", itv: 11704, alcohol_rate: 817, fixed_radar: 45231, year: 2023},
            { city: "Madrid", itv: 11704, alcohol_rate: 817, fixed_radar: 45231, year: 2024}
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
    
    
    app.get(`${BASE_API}/fines/:city`, (req, res) => {
        const city = req.params.city;
        console.log(`New GET to /fines/${city}`);
    
        const search = trafficData1.filter(entry => entry.city === city);
        
        if (search.length > 0) {
            return res.status(200).json(search);
        } else {   
            return res.status(404).json({ error: `No se encuentran datos de ${city}` });
        }
    });
    
    
    // POST: Añadir un nueva multa 
    app.post(`${BASE_API}/fines`, (req, res) => {
        console.log("New POST to /fines");
        let newData = req.body;
    
        // Verificar si ya existe un dato con la misma ciudad y año
        if (trafficData1.some(entry => 
            entry.year === newData.year && 
            entry.city === newData.city)) {
            return res.status(409).json({ error: "Ya existe un dato con esa comunidad y año" });
        }
    
        // Validar que todos los campos requeridos estén presentes
        if (!newData.year || !newData.city || !newData.itv || 
            !newData.alcohol_rate || !newData.fixed_radar) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
    
            // Agregar el nuevo dato 
            trafficData1.push(newData);
            res.sendStatus(201);
    });
    
    
    app.post(`${BASE_API}/fines/:city`, (req, res) => {
        const city = req.params.city;
        console.log(`New POST to /fines/${city}`);
        res.status(405).json({ error: "Método POST no permitido" });
    });
    
    // PUT no permitido a nivel general
    app.put(`${BASE_API}/fines`, (req, res) => {
        console.log("New PUT to /fines");
        res.status(405).json({ error: "Método PUT no permitido" });
    });
    
    
    // Actualizar los datos de una ciudad específica
    app.put(`${BASE_API}/fines/:city`, (req, res) => {
        let city = req.params.city; // Obtener ciudad desde la URL
        console.log(`New PUT to /fines/${city}`);
    
        const index = trafficData1.findIndex(entry => entry.city === city);
    
        //  Verificar si la ciudad de la URL existe en los datos
        if (index < 0) {
            return res.status(404).json({ error: `No se encuentran datos de ${ciudad}` });
        }
    
        let updatedData = req.body;
    
        //  Verificar que el JSON contenga el mismo nombre que la URL
        if (updatedData.city !== city) {
            return res.status(400).json({ error: "El nombre de la ciudad en la URL y en el cuerpo de la solicitud deben coincidir" });
        }
    
        // Actualizar solo los campos permitidos, sin cambiar la ciudad
        trafficData1[index] = {
            ...trafficData1[index], // Mantiene los datos actuales
            ...updatedData        // Sobrescribe solo los campos enviados
        };
    
        res.status(200).json({ message: "Datos actualizados", data: trafficData1[index] });
    });
    
    
    // Eliminar todas las multas
    app.delete(`${BASE_API}/fines`, (req, res) => {
        console.log("New DELETE to /fines");
        trafficData1 = []; //  Se reasigna correctamente el array
        res.status(200).json({ message: "Todos los datos han sido eliminados" });
    });
    
    
    // Eliminar los datos de una comunidad autónoma específica
    app.delete(`${BASE_API}/fines/:city`, (req, res) => {
        const city = req.params.city;
        console.log(`New DELETE to /fines/${city}`);
    
        const exists = trafficData1.some(entry => entry.city === city);
        
        if (exists) {
            trafficData1 = trafficData1.filter(entry => entry.city !== city);
            res.status(200).json({ message: `Datos de ${city} eliminados`, data: trafficData1 });
        } else {
            res.status(404).json({ error: `No se encuentran datos de ${city}` });
        }
    });
}
export{loadBackendCMR};