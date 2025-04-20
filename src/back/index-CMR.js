import dataStore from "nedb";

const BASE_API = "/api/v1";

let db = new dataStore();

let InitialTrafficData = [
    { city: "Badajoz", itv: 10774, alcohol_rate: 662, fixed_radar: 52155, year: 2023},
    { city: "Coruña", itv: 10104, alcohol_rate: 4367, fixed_radar: 52765, year: 2023},
    { city: "Madrid", itv: 93644, alcohol_rate: 5870, fixed_radar: 302579, year: 2023},
    { city: "Murcia", itv: 24173, alcohol_rate: 2505, fixed_radar: 56081, year: 2023},
    { city: "Santa Cruz de Tenerife", itv: 11976, alcohol_rate: 3597, fixed_radar: 19760, year: 2023},  
    { city: "Sevilla", itv: 28614, alcohol_rate: 4777, fixed_radar: 174985, year: 2023},
    { city: "Toledo", itv: 19577, alcohol_rate: 861, fixed_radar: 67338, year: 2023},
    { city: "Valencia", itv: 43444, alcohol_rate: 4339, fixed_radar: 122354, year: 2023},
    { city: "Valladolid", itv: 7857, alcohol_rate: 671, fixed_radar: 28561, year: 2023},
    { city: "Zaragoza", itv: 11704, alcohol_rate: 817, fixed_radar: 45231, year: 2023}
]

db.find({}, (err, data) => {
    if (data.length < 1) {
        db.insert(InitialTrafficData);
    }
});



function loadBackendCMR(app){

    // Redirección a documentación
    app.get(BASE_API + "/fines/docs", (req, res) => {
        console.log("GET /fines/docs");
        res.redirect("https://documenter.getpostman.com/view/42564550/2sB2cSi4pF#f75f8fcc-06f9-49f4-a869-e872b253cb7f");
    });

    // Load Initial Data
    app.get(`${BASE_API}/fines/loadInitialData`, (req, res) => {
        console.log("GET /fines/loadInitialData");
        db.find({}, (_err, data) => {
            if (data.length > 0) {
                console.log("Datos ya existentes");
                return res.status(400).json({ message: "El array ya contiene datos" });
            }
            db.insert(InitialTrafficData);
            console.log("Datos iniciales cargados correctamente");
            return res.status(201).json(InitialTrafficData);
        });
    });


    // GET All CON FILTROS Y PAGINACION 
    app.get(`${BASE_API}/fines`, (req, res) => {
        console.log("GET /fines con filtros y paginación");
    
        const { city, year, itv, fixed_radar, alcohol_rate, from, to } = req.query;
        const query = {};
    
        if (city) query.city = city;
        if (year) query.year = parseInt(year);
        if (itv) query.itv = parseInt(itv);
        if (fixed_radar) query.fixed_radar = parseInt(fixed_radar);
        if (alcohol_rate) query.alcohol_rate = parseInt(alcohol_rate);
    
        if (from && to) {
            query.year = { $gte: parseInt(from), $lte: parseInt(to) };
        } else if (from) {
            query.year = { $gte: parseInt(from) };
        } else if (to) {
            query.year = { $lte: parseInt(to) };
        }
    
        let limit = parseInt(req.query.limit) || 0;
        let offset = parseInt(req.query.offset) || 0;
    
        db.find(query).skip(offset).limit(limit).exec((_err, data) => {
            data.forEach(d => delete d._id);
            res.status(200).json(data);
        });
    });

    
    
    // GET
    // Obtener todas las multas
    app.get(`${BASE_API}/fines`, (req, res) => {
        console.log("New GET to /fines");
        db.find({}, (err, data) => {
            res.json(data.map(entry => {
                delete entry._id; // Eliminar el campo _id antes de enviar la respuesta
                return entry;
            }));
        });
    });

    
    
    // Obtener multas de una ciudad específica
    app.get(`${BASE_API}/fines/:city`, (req, res) => {
        const city = req.params.city;
        console.log(`New GET to /fines/${city}`);
        db.find({ city: city }, (err, data) => {
            if (data.length > 0) {
                res.json(data.map(entry => {
                    delete entry._id;
                    return entry;
                }));
            } else {
                res.status(404).json({ error: `No se encuentran datos de ${city}` });
            }
        });
    });


    // GET específico por comunidad y año
    app.get(`${BASE_API}/fines/:city/:year`, (req, res) => {
        const city = req.params.city;
        const year = req.params.year;
        console.log(`GET /fines/${city}/${year}`);
        db.findOne({ city: city, year: parseInt(year) }, (_err, data) => {
            if (!data) {
                console.log("No encontrado");
                return res.status(404).json({ error: `No se encuentran datos de ${city} en ${year}` });
            }
            delete data._id;
            res.status(200).json(data);
        });
    });
    
    
    // POST: Añadir un nueva multa 
    app.post(`${BASE_API}/fines`, (req, res) => {
        console.log("New POST to /fines");
        let newData = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!newData.year || !newData.city || !newData.itv || 
            !newData.alcohol_rate || !newData.fixed_radar) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }

        db.find({ city: newData.city, year: newData.year }, (err, data) => {
            if (data.length > 0) {
                return res.status(409).json({ error: "Ya existe un dato con esa ciudad y año" });
            }
            db.insert(newData);
            console.log("Dato insertado correctamente");
            return res.sendStatus(201);
        });
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
    
    // Actualizar los datos de una ciudad en un año específico
    app.put(`${BASE_API}/fines/:city/:year`, (req, res) => {
        const city = req.params.city;
        const year = parseInt(req.params.year);
        const updatedData = req.body;

        // Validación básica: asegurar que los datos coinciden con la URL
        if (
            !updatedData.city ||
            !updatedData.year ||
            updatedData.city !== city ||
            parseInt(updatedData.year) !== year
        ) {
            return res.status(400).json({ error: "El identificador del recurso en la URL debe coincidir con el cuerpo" });
        }

        db.update(
            { city: city, year: year },
            { $set: updatedData },
            {},
            (_err, numReplaced) => {
                if (numReplaced === 0) {
                    return res.status(404).json({ error: `No se encuentra el recurso para actualizar` });
                }
                res.status(200).json({ message: "Datos actualizados", data: updatedData });
            }
        );
    });

    
    
    // Actualizar los datos de una ciudad específica
    app.put(`${BASE_API}/fines/:city`, (req, res) => {
        const city = req.params.city;
        let updatedData = req.body;
        
        // Verificar que la ciudad en la URL coincida con la del cuerpo de la solicitud
        if (updatedData.city !== city) {
            return res.status(400).json({ error: "El nombre de la ciudad en la URL y en el cuerpo de la solicitud deben coincidir" });
        }
        
        // Actualizar los datos en la base de datos
        db.update({ city: city }, { $set: updatedData }, {}, (err, numUpdated) => {
            if (numUpdated > 0) {
                res.status(200).json({ message: "Datos actualizados" });
            } else {
                res.status(404).json({ error: `No se encuentran datos de ${city}` });
            }
        });
    });
    
    // Eliminar los datos de una ciudad en un año específico
    app.delete(`${BASE_API}/fines/:city/:year`, (req, res) => {
        const city = req.params.city;
        const year = parseInt(req.params.year);
        console.log(`New DELETE to /fines/${city}/${year}`);

        db.remove({ city: city, year: year }, {}, (err, numRemoved) => {
            if (numRemoved > 0) {
                res.status(200).json({ message: `Datos de ${city} en ${year} eliminados` });
            } else {
                res.status(404).json({ error: `No se encuentran datos de ${city} en ${year}` });
            }
        });
    });

    
    // Eliminar los datos de una ciudad específica
    app.delete(`${BASE_API}/fines/:city`, (req, res) => {
        const city = req.params.city;
        console.log(`New DELETE to /fines/${city}`);
        db.remove({ city: city }, {}, (err, numRemoved) => {
            if (numRemoved > 0) {
                res.status(200).json({ message: `Datos de ${city} eliminados` });
            } else {
                res.status(404).json({ error: `No se encuentran datos de ${city}` });
            }
        });
    });

    // Eliminar todas las multas
    app.delete(`${BASE_API}/fines`, (req, res) => {
        console.log("New DELETE to /fines");
        db.remove({}, { multi: true }, () => {
            res.status(200).json({ message: "Todos los datos han sido eliminados" });
        });
    });
}
export{loadBackendCMR};