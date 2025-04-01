import dataStore from "nedb";
const BASE_API = "/api/v1";
let db = new dataStore();

let initialData = [
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
    // Load Initial Data
    app.get(`${BASE_API}/traffic-accidents/loadInitialData`, (req, res) => {
        console.log("GET /traffic-accidents/loadInitialData");
        db.find({}, (_err, data) => {
            if (data.length > 0) {
                console.log("Datos ya existentes");
                return res.status(400).json({ message: "El array ya contiene datos" });
            }
            db.insert(initialData);
            console.log("Datos iniciales cargados correctamente");
            return res.status(201).json(initialData);
        });
    });

    // GET All
    app.get(`${BASE_API}/traffic-accidents`, (req, res) => {
        console.log("GET /traffic-accidents");
        db.find({}, (_err, data) => {
            data.forEach(d => delete d._id);
            res.status(200).json(data);
        });
    });

    // GET by Community
    app.get(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
        const community = req.params.community;
        console.log(`GET /traffic-accidents/${community}`);
        db.find({ autonomous_community: community }, (_err, data) => {
            if (data.length === 0) {
                console.log("No encontrado");
                return res.status(404).json({ error: `No se encuentran datos de ${community}` });
            }
            data.forEach(d => delete d._id);
            res.status(200).json(data);
        });
    });

    // POST
    app.post(`${BASE_API}/traffic-accidents`, (req, res) => {
        console.log("POST /traffic-accidents");
        let newData = req.body;

        if (!newData.year || !newData.autonomous_community || !newData.fatal_accidents || !newData.deceased || !newData.vehicles_without_mot) {
            console.log("Faltan datos requeridos");
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }

        db.find({ year: newData.year, autonomous_community: newData.autonomous_community }, (_err, existingData) => {
            if (existingData.length > 0) {
                console.log("Dato duplicado");
                return res.status(409).json({ error: "Ya existe un dato con esa comunidad y año" });
            }
            db.insert(newData);
            console.log("Dato insertado correctamente");
            return res.sendStatus(201);
        });
    });

    app.post(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
        console.log("POST no permitido con comunidad específica");
        res.status(405).json({ error: "Método POST no permitido" });
    });

    // PUT General (no permitido)
    app.put(`${BASE_API}/traffic-accidents`, (req, res) => {
        console.log("PUT no permitido");
        res.status(405).json({ error: "Método PUT no permitido" });
    });

    // PUT por comunidad
    app.put(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
        const community = req.params.community;
        const updatedData = req.body;
        console.log(`PUT /traffic-accidents/${community}`);

        if (!updatedData.autonomous_community || updatedData.autonomous_community !== community) {
            console.log("Error: comunidad no coincide");
            return res.status(400).json({ error: "El nombre de la comunidad en la URL y en el cuerpo de la solicitud deben coincidir" });
        }

        db.update(
            { autonomous_community: community, year: updatedData.year },
            { $set: updatedData },
            {},
            (_err, numReplaced) => {
                if (numReplaced === 0) {
                    console.log("Dato no encontrado para actualizar");
                    return res.status(404).json({ error: `No se encuentran datos de ${community}` });
                }
                console.log("Dato actualizado correctamente");
                return res.status(200).json({ message: "Datos actualizados", data: updatedData });
            }
        );
    });

    // DELETE all
    app.delete(`${BASE_API}/traffic-accidents`, (req, res) => {
        console.log("DELETE /traffic-accidents");
        db.remove({}, { multi: true }, (_err, numRemoved) => {
            console.log(`Eliminados ${numRemoved} registros`);
            res.status(200).json({ message: "Todos los datos han sido eliminados" });
        });
    });

    // DELETE por comunidad
    app.delete(`${BASE_API}/traffic-accidents/:community`, (req, res) => {
        const community = req.params.community;
        console.log(`DELETE /traffic-accidents/${community}`);
        db.remove({ autonomous_community: community }, { multi: true }, (_err, numRemoved) => {
            if (numRemoved === 0) {
                console.log("No encontrado para eliminar");
                return res.status(404).json({ error: `No se encuentran datos de ${community}` });
            }
            console.log(`Eliminados ${numRemoved} registros de ${community}`);
            res.status(200).json({ message: `Datos de ${community} eliminados` });
        });
    });

    // Redirección a documentación
    app.get(BASE_API + "/traffic-accidents/docs", (req, res) => {
        console.log("GET /traffic-accidents/docs");
        res.redirect("https://documenter.getpostman.com/view/42526065/2sB2cRE5Ny");
    });
}

export { loadBackendJCJ };