const BASE_API = "/api/v2/accidents-with-animals";
import dataStore from "nedb";

let db = new dataStore();

let InitialaccidentData = [
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

/*
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
*/

function loadBackendJACv2(app){

    // Redirección a documentación
    app.get(BASE_API + "/docs", (req, res) => {
        console.log("GET /accidents-with-animals/docs");
        res.redirect("https://documenter.getpostman.com/view/42547496/2sB2iwEEEj");
    });

    app.get(`${BASE_API}/loadInitialData`, (req, res) => {
        console.log("GET /accidents-with-animals/loadInitialData");
        db.find({}, (_err, data) => {
            if (data.length > 0) {
                console.log("Datos ya existentes");
                return res.status(400).json({ message: "El array ya contiene datos" });
            }
            db.insert(InitialaccidentData);
            console.log("Datos iniciales cargados correctamente");
            return res.status(201).json(InitialaccidentData);
        });
    });

    app.get(BASE_API, (req, res) => {
        const {
            from,
            to,
            limit,
            offset,
            ...filters // esto captura todos los demás filtros automáticamente
        } = req.query;
    
        const query = {};
    
        // Conversión de tipos y construcción dinámica del query
        for (const key in filters) {
            if (filters.hasOwnProperty(key)) {
                // Convertir a número si corresponde
                const value = filters[key];
                if (!isNaN(value)) {
                    query[key] = parseFloat(value);
                } else {
                    query[key] = value;
                }
            }
        }
    
        // Manejo especial de "anyo" si hay "from" y/o "to"
        if (from && to) {
            query.anyo = { $gte: parseInt(from), $lte: parseInt(to) };
        } else if (from) {
            query.anyo = { $gte: parseInt(from) };
        } else if (to) {
            query.anyo = { $lte: parseInt(to) };
        }
    
        // Paginación
        const lim = parseInt(limit) || 0;
        const off = parseInt(offset) || 0;
    
        db.find(query).skip(off).limit(lim).exec((err, data) => {
            if (err) {
                res.status(500).send("Error interno del servidor");
                return;
            }
    
            data.forEach(d => delete d._id);
            res.status(200).json(data);
        });
        
    });

     // GET por ID
    app.get(`${BASE_API}/:id`, (req, res) => {
        const id = req.params.id;

        db.findOne({ id: id }, (err, data) => {
            if (!data) {
                return res.status(404).json({ error: `No se encuentra el accidente con ID ${id}` });
            }
            delete data._id;
            return res.status(200).json(data);
        });
    });   
    

    // GET por comunidad
    app.get(`${BASE_API}/:community`, (req, res) => {
        const community = req.params.community;
        db.find({ autonomous_community: community }, (err, data) => {
            if (data.length === 0) {
                return res.status(404).json({ error: `No se encuentran datos de ${community}` });
            }
            data.forEach(d => delete d._id);
            res.status(200).json(data);
        });
    });

    // POST
    app.post(BASE_API, (req, res) => {
        let newData = req.body;

        const expectedFields = [
            "id", "n_deceased", "n_injures_hospitalized", "n_injured_no_hospitalized",
            "accident_date", "accident_hour", "anyo", "autonomous_community",
            "province", "ine_municipality", "road", "km_road", "type_of_road",
            "animal_group", "other_animal_group"
        ];

        const receivedFields = Object.keys(newData);

        // Verificar que todos los campos requeridos estén presentes
        const missingFields = expectedFields.filter(field => !receivedFields.includes(field));

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: "Faltan campos requeridos",
                missingFields
            });
        }

        db.find({ id: newData.id }, (err, existingData) => {
            if (existingData.length > 0) {
                return res.status(409).json({ error: "Ya existe un dato con ese ID" });
            }
            db.insert(newData);
            return res.sendStatus(201);
        });
    });



    app.post(`${BASE_API}/:community`, (req, res) => {
        res.status(405).json({ error: "Método POST no permitido" });
    });

    // PUT no permitido global
    app.put(BASE_API, (req, res) => {
        res.status(405).json({ error: "Método PUT no permitido" });
    });




    // PUT por id
    app.put(`${BASE_API}/:id`, (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;

        if (updatedData.id !== id) {
            return res.status(400).json({ error: "El id en la URL y en el cuerpo deben coincidir" });
        }

        db.update(
            { id: id },
            { $set: updatedData },
            {},
            (err, numReplaced) => {
                if (numReplaced === 0) {
                    return res.status(404).json({ error: `No se encuentran datos de ${id}` });
                }
                return res.status(200).json({ message: "Datos actualizados", data: updatedData });
            }
        );
    });

    // DELETE all
    app.delete(`${BASE_API}`, (req, res) => {
        console.log("DELETE /accidents-with-animals");
        db.remove({}, { multi: true }, (_err, numRemoved) => {
            console.log(`Eliminados ${numRemoved} registros`);
            res.status(200).json({ message: "Todos los datos han sido eliminados" });
        });
    });
    

    // DELETE por id
    app.delete(`${BASE_API}/:id`, (req, res) => {
        const id = req.params.id;
        db.remove({ id: id }, { multi: true }, (err, numRemoved) => {
            if (numRemoved === 0) {
                return res.status(404).json({ error: `No se encuentran datos de ${id}` });
            }
            res.status(200).json({ message: `Datos de ${id} eliminados` });
        });
    });

    //Punto 7
   // GET recurso por provincia y grupo de animal (identificador compuesto)
    app.get(`${BASE_API}/:province/:animal_group`, (req, res) => {
        const { province, animal_group } = req.params;
        db.find({ province: province.toLowerCase(), animal_group: parseInt(animal_group) }, (err, data) => {
            if (data.length === 0) {
                return res.status(404).json({ error: `No se encuentran datos de ${province} con grupo animal ${animal_group}` });
            }
            data.forEach(d => delete d._id);
            
            // Comprobamos si hay uno o varios
            if (data.length === 1) {
                res.status(200).json(data[0]); // Devolver objeto
            } else {
                res.status(200).json(data);    // Devolver array
            }
        });
    });

    
        // PUT recurso por provincia y grupo de animal (identificador compuesto)
    app.put(`${BASE_API}/:province/:animal_group`, (req, res) => {
        const { province, animal_group } = req.params;
        const updatedData = req.body;
    
        db.update(
            { province: province.toLowerCase(), animal_group: parseInt(animal_group) },
            { $set: updatedData },
            { multi: true }, // en caso de múltiples coincidencias
            (err, numReplaced) => {
                if (numReplaced === 0) {
                    return res.status(404).json({ error: `No se encuentran datos de ${province} con grupo animal ${animal_group}` });
                }
                return res.status(200).json({ message: `${numReplaced} datos actualizados en ${province} con grupo ${animal_group}` });
            }
        );
    });
    
    // DELETE recurso por provincia y grupo de animal (identificador compuesto)
    app.delete(`${BASE_API}/:province/:animal_group`, (req, res) => {
        const { province, animal_group } = req.params;
    
        db.remove({ province: province.toLowerCase(), animal_group: parseInt(animal_group) }, { multi: true }, (err, numRemoved) => {
            if (numRemoved === 0) {
                return res.status(404).json({ error: `No se encuentran datos de ${province} con grupo animal ${animal_group}` });
            }
            return res.status(200).json({ message: `${numRemoved} datos eliminados de ${province} con grupo ${animal_group}` });
        });
    });
    
    
}

export { loadBackendJACv2 };