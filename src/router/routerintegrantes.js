const router =require("express").Router()
const Integrantes  = require("../model/modelointegrantes");
const Usuario =require("../model/modelosusuario");
const Proyecto =require("../model/modeloproyecto")
const axios = require('axios');



router.get('/integrantes', async (req, res) => {
    try {
      const integrante = await Integrantes.findAll();
      console.log('Facultades encontradas:', integrante); // Agrega esta línea para imprimir las facultades en la consola
  
      res.status(200).json({
        status: 200,
        data: integrante,
      });
    } catch (error) {
      console.error('Error al obtener los integrantes:', error);
      res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
      });
    }
  });


//meter integrantes
router.post('/integrantes', async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { cedula_usuario, proyectoId, rol } = req.body;

    // Verificar si el usuario y el proyecto existen en la base de datos
    const usuarioExistente = await Usuario.findByPk(cedula_usuario);
    const proyectoExistente = await Proyecto.findByPk(proyectoId);

    if (!usuarioExistente || !proyectoExistente) {
      return res.status(404).json({ error: 'Usuario o proyecto no encontrado' });
    }

    // Crear un nuevo integrante
    const nuevoIntegrante = await Integrantes.create({
      cedula_usuario,
      proyectoId,
      rol,
    });

    // Enviar la respuesta
    res.status(201).json(nuevoIntegrante);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});


//consultar proyectos por cedula de integrantes
router.get('/proyectos/integrante/:cedula_usuario', async (req, res) => {
  try {
      const { cedula_usuario } = req.params;

      const integrantes = await Integrantes.findAll({
          where: { cedula_usuario },
          include: [
              {
                  model: Proyecto,
                  required: true,
              }
          ],
      });

      if (integrantes.length === 0) {
          return res.status(404).json({ error: 'No se encontraron proyectos para el usuario especificado' });
      }

      res.status(200).json({
          status: 200,
          data: integrantes,
      });
  } catch (error) {
      console.error('Error al obtener proyectos donde el usuario es integrante:', error);
      res.status(500).json({
          status: 500,
          message: 'Error interno del servidor',
      });
  }
});



// Ruta para obtener nombre, apellido y cédula de todas las personas en un proyecto por ID
router.get('/integrantes/personas/:proyectoId', async (req, res) => {
  try {
    const { proyectoId } = req.params;

    // Utiliza el método findAll con la opción include para cargar ansiosamente los usuarios
    const integrantes = await Integrantes.findAll({
      where: { proyectoId },
      include: [
        {
          model: Usuario,
          attributes: ['nombre', 'apellido', 'cedula'], // Selecciona solo los campos deseados
        }
      ],
    });

    res.status(200).json({
      status: 200,
      data: integrantes,
    });
  } catch (error) {
    console.error('Error al obtener personas en un proyecto por ID:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
    });
  }
});

//borrar integrantes
router.delete('/borrar/:cedula/:proyectoId', async (req, res) => {
  try {
    const { cedula, proyectoId } = req.params;

    // Busca y elimina el integrante por cédula y proyectoId
    const resultado = await Integrantes.destroy({
      where: {
        cedula_usuario: cedula,
        proyectoId: proyectoId,
      },
    });

    if (resultado === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No se encontró el integrante con la cédula y proyectoId proporcionados',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Integrante eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al borrar integrante:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
    });
  }
});

//







  module.exports=router