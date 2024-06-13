const router =require("express").Router()






const  Facultads  = require("../model/modelosfacultad");
const { route } = require("./routerproyecto");

router.get('/facultades', async (req, res) => {
  try {
    const facultades = await Facultads.findAll();

    res.status(200).json({
      status: 200,
      data: facultades,
    });
  } catch (error) {
    console.error('Error al obtener las facultades:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
    });
  }
});



// Crear una nueva facultad
router.post('/facultades', async (req, res) => {
  const facultad = req.body;

  try {
    const nuevaFacultad = await Facultads.create(facultad);

    res.status(201).json({
      status: 201,
      body: {
        id: nuevaFacultad.id,
        nombre: nuevaFacultad.nombre,
      },
    });
  } catch (error) {
    console.error('Error al crear la facultad:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
    });
  }
});

//mandar nombre facultad
router.get('/facultades/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Busca la Facultad por su ID en la base de datos
    const facultad = await Facultads.findByPk(id, { attributes: ['nombre'] });

    if (!facultad) {
      return res.status(404).json({ message: 'Facultad no encontrada' });
    }

    // Devuelve el nombre de la Facultad como respuesta
    res.json({ nombre: facultad.nombre });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


module.exports=router