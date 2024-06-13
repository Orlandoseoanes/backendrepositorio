const router = require("express").Router();

const Mensajes = require("../model/modeloMensajes");
const Proyecto = require('../model/modeloproyecto'); // Asegúrate de que la ruta al modelo sea correcta
const Integrantes= require("../model/modelointegrantes");

// traer todos los mensajes


//mandar un mensajes
router.post('/mensajes', async (req, res) => {
  try {
    // Obtén los datos del cuerpo de la solicitud
    const {
      Categoria,
      TipoMensaje,
      ProyectoId,
      mensaje,
      cedula_usuario,
      fecha
    } = req.body;
    // Crea un nuevo mensaje en la base de datos
    const nuevoMensaje = await Mensajes.create({
      Categoria,
      TipoMensaje,
      ProyectoId,
      mensaje,
      cedula_usuario,
      fecha: fecha,
    });

    // Devuelve el nuevo mensaje creado como respuesta
    return res.status(201).json(nuevoMensaje);
  } catch (error) {
    // Manejo de errores
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});
//traer mensajes por proyecto id
router.get('/mensajes/:idProyecto', async (req, res) => {
  try {
    // Obtén el ID del proyecto desde los parámetros de la ruta
    const idProyecto = req.params.idProyecto;

    // Busca el proyecto por su ID
    const proyecto = await Proyecto.findByPk(idProyecto);

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Busca todos los mensajes ligados al proyecto
    const mensajes = await Mensajes.findAll({
      where: {
        ProyectoId: idProyecto,
      },
    });

    // Devuelve los mensajes como respuesta
    return res.status(200).json(mensajes);
  } catch (error) {
    // Manejo de errores
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//consulta para que muestre todos los mensajes que tiene una persona por proyecto id y cedula
router.get('/mensajesporcedula/:cedulaUsuario/:proyectoId', async (req, res) => {
  const { cedulaUsuario, proyectoId } = req.params;

  try {
    // Primero, busca el ID del proyecto al que pertenece el integrante
    const integrante = await Integrantes.findOne({
      where: {
        cedula_usuario: cedulaUsuario,
        proyectoId: proyectoId,
      },
    });

    if (!integrante) {
      return res.status(404).json({ message: 'Integrante no encontrado' });
    }

    // Luego, obtén todos los mensajes relacionados con ese proyecto
    const mensajes = await Mensajes.findAll({
      where: {
        ProyectoId: proyectoId,
      },
    });

    res.json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});
//mensajes por cedula
router.get('/mensajesporcedula/:cedulaUsuario', async (req, res) => {
  const { cedulaUsuario } = req.params;

  try {
    // Primero, busca todos los proyectos en los que participa el usuario
    const proyectosDelUsuario = await Integrantes.findAll({
      where: {
        cedula_usuario: cedulaUsuario,
      },
    });

    // Obtén los mensajes de todos los proyectos en los que participa el usuario
    const mensajesDelUsuario = await Mensajes.findAll({
      where: {
        ProyectoId: proyectosDelUsuario.map(proyecto => proyecto.proyectoId),
      },
    });

    res.json(mensajesDelUsuario);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});





module.exports = router;
