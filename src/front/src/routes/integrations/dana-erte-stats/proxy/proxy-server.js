/** 
// proxy-server.js

import express from 'express';
import request from 'request';


const API_PREFIX = '/api';
const API_SERVER_HOST = 'https://sos2425-18.onrender.com/api/v2';

// 1) Proxy de todo lo que llegue a /api/*
const app = express();
app.use(API_PREFIX, (req, res) => {
  // req.url = '/dana-erte-stats?foo=bar'
  const target = API_SERVER_HOST + req.url;
  console.log('piped', req.url, '→', target);
  req.pipe(request(target)).pipe(res);
});


// 3) ¡Ahora sí! Arrancar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});

*/