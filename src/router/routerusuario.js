const router =require("express").Router()
const bcrypt = require('bcrypt');
const  Usuario  = require("../model/modelosusuario");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); // Importa la biblioteca jsonwebtoken
const fs = require('fs');
const path = require('path');
const PDFDocument = require("pdfkit-table");

router.get('/usuario/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;

    if (!cedula) {
      return res.status(400).json({ error: 'Cedula is required' });
    }

    const usuario = await Usuario.findOne({
      where: { cedula },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario not found' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/usuarios', async (req, res) => {
    try {
      const usuario = await Usuario.findAll();
      console.log('Facultades encontradas:', usuario); // Agrega esta línea para imprimir las facultades en la consola
  
      res.status(200).json({
        status: 200,
        data: usuario,
      });
    } catch (error) {
      console.error('Error al obtener las facultades:', error);
      res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
      });
    }
  });

  router.post('/usuarios', async (req, res) => {
    const { cedula, nombre, apellido, correo, usuario, contrasena, rol, carreraId } = req.body;
  
    try {
      const newUsuario = await Usuario.create({
        cedula,
        nombre,
        apellido,
        correo,
        usuario,
        contrasena,
        rol,
        carreraId,
      });
  
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        usuario: newUsuario,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al crear usuario',
        error,
      });
    }
  });
  
//login
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const usuarioEncontrado = await Usuario.findOne({
      where: {
        usuario: usuario,
      },
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({
        message: 'Usuario no encontrado',
      });
    }

    const esValido = await usuarioEncontrado.comparePassword(contrasena);

    if (!esValido) {
      return res.status(401).json({
        message: 'Contraseña incorrecta',
      });
    }


    const payload = {
      usuarioId: usuarioEncontrado.id,
      cedula: usuarioEncontrado.cedula,
      nombre: usuarioEncontrado.nombre,
      apellido: usuarioEncontrado.apellido,
      correo: usuarioEncontrado.correo,
      rol: usuarioEncontrado.rol,
      carreraId: usuarioEncontrado.carreraId,
    };

    const token = jwt.sign(payload, 'secretoDelToken'); // Cambia 'secretoDelToken' por tu secreto real

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      status:200,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error,
    });
  }
});

//cambiar rol de usuario
router.post('/cambiar-rol/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const { nuevoRol } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({
      where: { cedula },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Cambiar el rol del usuario
    usuario.rol = nuevoRol;
    await usuario.save();

    // Enviar la respuesta
    res.status(200).json({
      status: 200,
      message: `Rol del usuario con cédula ${cedula} cambiado a ${nuevoRol}`,
    });
  } catch (error) {
    console.error('Error al cambiar el rol del usuario:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
    });
  }
});


//Usuarios inactivos
router.get('/usuarios/inactivos', async (req, res) => {
  try {
    const usuariosInactivos = await Usuario.findAll({
      where: {
        rol: 'INACTIVO',
      },
    });

    res.status(200).json({
      status: 200,
      data: usuariosInactivos,
    });
  } catch (error) {
    console.error('Error al obtener usuarios inactivos:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
    });
  }
});

router.get('/usuarios/reporte', async (req, res) => {
  try {
    // Creamos un nuevo documento PDF en memoria
    let doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Establecemos el tipo de contenido de la respuesta HTTP como PDF
    res.setHeader('Content-Type', 'application/pdf');
    
    // Adjuntamos el archivo PDF como flujo de datos a la respuesta HTTP
    doc.pipe(res);

    // Agregar el logo al documento
    const logoPath = 'src/router/LOGO-UPC (1).png'; // Ruta de tu archivo de logo
    doc.image(logoPath, { width: 150 }); // Ajusta el tamaño del logo
    
    // Agregar el título del reporte
    doc.fontSize(16).text('Reporte de Usuarios', { align: 'center' });
    doc.moveDown(); // Moverse hacia abajo después del título

    // Obtener todos los usuarios de la base de datos
    const usuarios = await Usuario.findAll();

    // Definir las cabeceras de la tabla
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Correo', 'Rol'];

    // Mapear los datos de los usuarios para la tabla
    const data = usuarios.map(usuario => {
      return [
        usuario.cedula.toString(),
        usuario.nombre,
        usuario.apellido,
        usuario.correo,
        usuario.rol.toString()
      ];
    });

    // Configurar las opciones de la tabla
    const tableOptions = {
      headers,
      rows: data,
      columnsAlignment: ['center', 'center', 'center', 'center', 'center'],
    };

    // Generar la tabla en el documento PDF
    doc.table(tableOptions, { prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
      },
    });

     // Agregar la fecha actual al pie de página
     const currentDate = new Date().toLocaleDateString();
     doc.moveDown().fontSize(8).text(`Fecha: ${currentDate}`, { align: 'right' });
 
     // Finalizamos el documento PDF
     doc.end();
  } catch (error) {
    console.error('Error al generar el reporte de usuarios:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
    });
  }
});







module.exports = router;

