const BASE_API = "/api/v1";
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

function loadBackendJAC(app){

    db.find({},(err,accidentData)=>{
        if (accidentData.length < 1){
            db.insert(InitialaccidentData);
        }
    });


    app.get(`${BASE_API}/accidents-with-animals/loadInitialData`, (req, res) => {
        console.log("New GET to /loadInitialData");
        db.find({}, (err, accidentData) => {
            if (accidentData.length > 0) {
                console.log("Datos ya existentes");
                return res.status(400).json({ message: "El array ya contiene datos" });
            }
            db.insert(InitialaccidentData);
            console.log("Datos iniciales cargados correctamente");
            return res.status(201).json(InitialaccidentData);
        });
    });


    
    
    // GET: Obtener todos los accidentes
    app.get(`${BASE_API}/accidents-with-animals`, (req, res) => {
        console.log("New GET to /accidents-with-animals")

        db.find({},(err,accidentData)=>{
            res.send(JSON.stringify(accidentData.map((c)=>{
                delete c._id;
                return c;
            }),null,2));
        });
    });
    
    // GET: Obtener accidentes por comunidad autónoma
    app.get(`${BASE_API}/accidents-with-animals/:community`, (req, res) => {
        console.log("New GET to /accidents-with-animals/:community")
        const community = req.params.community.toLowerCase();
        db.find({ autonomous_community: community }, (err, accidentData) => {
            if (accidentData.length === 0) {
                console.log("No encontrado");
                return res.status(404).json({ error: `No se encuentran datos de ${community}` });
            }
            accidentData.forEach(d => delete d._id);
            res.status(200).json(accidentData);
        });
    });
    
    // POST: Añadir un nuevo accidente (evitar duplicados)
    app.post(`${BASE_API}/accidents-with-animals`, (req, res) => {
        console.log("New POST to /accidents-with-animals")
        let newData = req.body;
        
        if (newData.id === undefined || newData.n_deceased === undefined || newData.n_injures_hospitalized === undefined || newData.n_injured_no_hospitalized === undefined || newData.accident_date === undefined
            || newData.accident_hour === undefined || newData.anyo === undefined || newData.autonomous_community === undefined || newData.province === undefined || newData.ine_municipality === undefined || newData.road === undefined 
            || newData.km_road === undefined  || newData.type_of_road === undefined  || newData.animal_group === undefined  || newData.other_animal_group === undefined) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        
        db.find({ id: newData.id }, (err, existingData) => {
            if (existingData.length > 0) {
                console.log("Dato duplicado");
                return res.status(409).json({ error: "Ya existe un dato con ese Id" });
            }
            db.insert(newData);
            console.log("Dato insertado correctamente");
            return res.sendStatus(201);
        });
    });
    
    // PUT: Actualizar datos de un accidente específico
    app.put(`${BASE_API}/accidents-with-animals/:id`, (req, res) => {
        console.log("New PUT to /accidents-with-animals/:id")
        const id = req.params.id;
        const updatedData = req.body;

        if (updatedData.id && updatedData.id !== id) {
            return res.status(400).json({ error: "El ID en la URL y el cuerpo deben coincidir" });
        }

        db.find({ id: id }, (err, existingData) => {
            if (err) return res.sendStatus(500);
            if (!existingData.length) {
                return res.status(404).json({ error: "Accidente no encontrado" });
            }

            db.update({ id: id }, updatedData, {}, (err, num) => {
                if (err || num === 0) return res.sendStatus(500);
                return res.sendStatus(200);
            });
        });
    });
    
    // DELETE: Eliminar un accidente específico
    app.delete(`${BASE_API}/accidents-with-animals/:id`, (req, res) => {
        const id = req.params.id;
        console.log(`DELETE /traffic-accidents/:id`);
        db.remove({ id: id }, { multi: true }, (_err, numRemoved) => {
            if (numRemoved === 0) {
                console.log("No encontrado para eliminar");
                return res.status(404).json({ error: `No se encuentran datos de ${id}` });
            }
            console.log(`Eliminados ${numRemoved} registros de ${id}`);
            res.status(200).json({ message: `Datos de ${id} eliminados` });
        });
    });
    
    // DELETE: Eliminar todos los accidentes
    app.delete(`${BASE_API}/accidents-with-animals`, (req, res) => {
        console.log("New DELETE to /accidents-with-animals")
        db.remove({}, {multi:true}, (err, numRemoved) => {
            console.log(`Eliminados ${numRemoved} registros`);
            res.status(200).json({ message: "Todos los registros eliminados"})
        });
    });
    
    // Manejar todos los otros métodos no permitidos
    app.all(`${BASE_API}/accidents-with-animals/*`, (req, res) => {
        res.sendStatus(405);
      });
    
    
    app.put(`${BASE_API}/accidents-with-animals`, (req, res) => {
        res.sendStatus(405);
      });
}

export { loadBackendJAC };