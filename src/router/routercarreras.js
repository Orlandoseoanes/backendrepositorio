const router =require("express").Router()

const  Carreras  = require("../model/modeloscarreras");


router.get('/carreras', async (req, res) => {
    try {
      const carreras = await Carreras.findAll();
      console.log('Facultades encontradas:', carreras); // Agrega esta línea para imprimir las facultades en la consola
  
      res.status(200).json({
        status: 200,
        data: carreras,
      });
    } catch (error) {
      console.error('Error al obtener las facultades:', error);
      res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
      });
    }
  });

  

  module.exports=router
