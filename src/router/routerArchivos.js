const router = require("express").Router();
const multer = require("multer");
const path = require("path");
global.__basedir = path.resolve(__dirname);

const Archivos = require("../model/modeloArchivos");
const Proyecto = require("../model/modeloproyecto"); // Ajusta la ruta según tu estructura de archivos

// Configura Multer para guardar archivos en la carpeta 'MEDIA'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__basedir, "MEDIA"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "archivo-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
//mostrar todos los proyectos
router.get("/Archivos", async (req, res) => {
  try {
    const archivo = await Archivos.findAll();
    console.log("Facultades encontradas:", archivo); // Agrega esta línea para imprimir las facultades en la consola

    res.status(200).json({
      status: 200,
      data: archivo,
    });
  } catch (error) {
    console.error("Error al obtener las facultades:", error);
    res.status(500).json({
      status: 500,
      message: "Error interno del servidor",
    });
  }
});
//crear archivo
router.post("/archivos", upload.single("archivo"), async (req, res) => {
  try {
    const { proyectoId,
          fechapublicado,
          tipoArchivo } = req.body;

    // Verifica si el proyecto existe en la base de datos
    const proyecto = await Proyecto.findOne({
      where: { id_proyecto: proyectoId },
    });
    if (!proyecto) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    // Construye la ruta completa al archivo utilizando __basedir
    const nuevaRuta = path.join(__basedir, "MEDIA", req.file.filename);

    // Guarda la ruta del archivo en la base de datos
    const nuevoArchivo = await Archivos.create({
      archivo: nuevaRuta,
      proyectoId: proyectoId,
      fechapublicado:fechapublicado,
      TipoArchivo:tipoArchivo
    });

    res.status(201).json(nuevoArchivo);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

//mostrar en navegador
router.get("/archivos/proyecto/mostrar/:proyectoId", async (req, res) => {
  try {
    const { proyectoId } = req.params;

    // Busca el primer archivo por proyectoId
    const archivo = await Archivos.findOne({
      where: {
        proyectoId: proyectoId,
      },
    });

    if (!archivo) {
      return res
        .status(404)
        .json({ error: "Archivo no encontrado para el proyecto especificado" });
    }

    // Envía el archivo como respuesta
    const filePath = path.resolve(archivo.archivo);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        res.status(500).json({
          status: 500,
          message: "Error al enviar el archivo",
        });
      }
    });
  } catch (error) {
    console.error("Error al mostrar el archivo por proyectoId:", error);
    res.status(500).json({
      status: 500,
      message: "Error interno del servidor",
    });
  }
});
//mostrar archivos por id
router.get("/archivos/proyecto/:proyectoId", async (req, res) => {
  try {
    const { proyectoId } = req.params;

    // Buscar archivos por proyectoId
    const archivos = await Archivos.findAll({
      where: {
        proyectoId: proyectoId,
      },
    });

    res.status(200).json({
      status: 200,
      data: archivos,
    });
  } catch (error) {
    console.error("Error al obtener archivos por proyectoId:", error);
    res.status(500).json({
      status: 500,
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
