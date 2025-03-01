const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;

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

let trafficData = [
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

app.get("/samples/CMR", (req, res) => {
    // Filtrar ciudades con más de 50,000 multas por radar
    let filteredData = trafficData.filter(entry => entry.fixed_radar > 50000);

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