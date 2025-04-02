import express from "express";
import { loadBackendJCJ } from "./src/back/index-JCJ.js";
import { loadBackendJAC } from "./src/back/index-JAC.js"; 
import path from "path";
import { loadBackendCMR } from "./src/back/index-CMR.js";


const app = express();
const PORT = process.env.PORT || 16078;



// Middleware para parsear JSON
app.use(express.json()); //  Debe ir antes de definir las rutas


app.use("/",express.static("./public"));

//Cargar Backend
loadBackendJCJ(app);
loadBackendJAC(app);
loadBackendCMR(app);

//Ruta about
app.get("/about",(request,response)=>{
    response.redirect("/about.html");
});

// Arrancar servidor
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}!`);
});

