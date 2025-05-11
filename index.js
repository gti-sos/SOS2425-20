import express from "express";
//v1
import { loadBackendJCJ } from "./src/back/index-JCJ.js";
import { loadBackendJAC } from "./src/back/index-JAC.js"; 
import { loadBackendCMR } from "./src/back/index-CMR.js";
//v2
import { loadBackendJCJv2 } from "./src/back/index-JCJ-v2.js";
import { loadBackendCMRv2 } from "./src/back/index-CMR-v2.js";
import { loadBackendJACv2 } from "./src/back/index-JAC-v2.js";

import path from "path";


import {handler} from "./src/front/build/handler.js";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 16078;



// Middleware para parsear JSON
app.use(express.json()); //  Debe ir antes de definir las rutas
app.use(cors()); // permite peticiones desde otros orígenes (útil para integraciones)


//Cargar Backend 

//v1
loadBackendJCJ(app);
loadBackendJAC(app);
loadBackendCMR(app);

//v2
loadBackendJCJv2(app);
loadBackendCMRv2(app);
loadBackendJACv2(app);

//servimos la aplicación Svelte 
app.use(handler); 

// Arrancar servidor
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}!`);
});

