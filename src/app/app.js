const config = require("../config");
const express = require('express');
const morgan = require('morgan');
const app = express();

var createError = require('http-errors');
const cors = require('cors');
var path = require('path');
/////////7
const routerfacultad = require("../router/routerfacultad");
const routercarreras= require("../router/routercarreras");
const routerusuarios=require("../router/routerusuario");
const routerproyectos=require("../router/routerproyecto");
const routerintegrantes=require("../router/routerintegrantes");
const routerArchivos =require("../router/routerArchivos");
const routerMensajes=require ("../router/routerMensajes");
///////////
app.use(morgan("dev"));
app.get('/', (req, res) => {
    res.send('express');
});
app.use(express.json());
app.use('/MEDIA', express.static(path.join(__dirname, 'MEDIA')));
app.use(cors(config.application.cors.server));

app.use("/api/v1", routerfacultad);
app.use("/api/v1",routercarreras);
app.use("/api/v1",routerusuarios);
app.use("/api/v1",routerproyectos);
app.use("/api/v1",routerintegrantes);
app.use("/api/v1",routerArchivos);
app.use("/api/v1",routerMensajes);





module.exports = app;
