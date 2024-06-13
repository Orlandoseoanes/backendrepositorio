const router =require("express").Router()
const PDFDocument = require("pdfkit-table");
const  Proyecto  = require("../model/modeloproyecto");
const path = require('path'); // Importa el módulo path para manejar rutas de archivos
const fs = require('fs');
const axios = require('axios');


 //todos los proyectos

router.get('/Proyectos', async (req, res) => {
    try {
      const proyecto = await Proyecto.findAll();
      console.log('Facultades encontradas:', proyecto); // Agrega esta línea para imprimir las facultades en la consola
  
      res.status(200).json({
        status: 200,
        data: proyecto,
      });
    } catch (error) {
      console.error('Error al obtener las facultades:', error);
      res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
      });
    }
  });

  //crear proyecto
  router.post('/proyectos', async (req, res) => {
    try {
      // Extrae los datos del cuerpo de la solicitud
      const { id_proyecto, título, descripción, fecha_radicado, estado, facultadId, carreraId } = req.body;
  
      // Crea un nuevo proyecto en la base de datos
      const nuevoProyecto = await Proyecto.create({
        id_proyecto,
        título,
        descripción,
        fecha_radicado,
        estado,
        facultadId,
        carreraId,
      });
  
      // Envía la respuesta con el nuevo proyecto creado
      res.status(201).json(nuevoProyecto);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
    }
  });

  //cambiar estado proyecto
  router.put('/proyectos/:id_proyecto', async (req, res) => {
    try {
      const { id_proyecto } = req.params;
      const { estado } = req.body;
  
      // Busca el proyecto por su ID
      const proyecto = await Proyecto.findOne({ where: { id_proyecto } });
  
      if (!proyecto) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
  
      // Actualiza el estado del proyecto
      proyecto.estado = estado;
      await proyecto.save();
  
      res.json(proyecto);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
    }
  });

  //busqueda individual por proyecto

  router.get('/proyectos/:id_proyecto', async (req, res) => {
    try {
      const { id_proyecto } = req.params;
  
      const proyecto = await Proyecto.findOne({ where: { id_proyecto } });
  
      if (!proyecto) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
  
      res.json(proyecto);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
    }
  });

  router.get('/proyecto/generar-reporte', async (req, res) => {
    try {
        // Realizar la consulta a la base de datos para obtener todos los proyectos
        const proyectos = await Proyecto.findAll();

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
        doc.fontSize(16).text('Reporte de Proyectos', { align: 'center' });
        doc.moveDown(); // Moverse hacia abajo después del título

        // Definir las cabeceras de la tabla
        const headers = ['ID de Proyecto', 'Título', 'Descripción', 'Fecha Radicado', 'Estado', 'Integrantes'];

        // Mapear los datos de los proyectos para la tabla
        const data = await Promise.all(proyectos.map(async (proyecto) => {
            // Realizar la solicitud para obtener los integrantes del proyecto
            const integrantesResponse = await axios.get(`http://srv435312.hstgr.cloud:3001/api/v1/integrantes/personas/${proyecto.id_proyecto}`);
            const integrantes = integrantesResponse.data.data.map(integrante => `${integrante.Usuario.nombre} ${integrante.Usuario.apellido}`).join(', ');

            return [
                proyecto.id_proyecto,
                proyecto.título,
                proyecto.descripción,
                proyecto.fecha_radicado,
                proyecto.estado,
                integrantes
            ];
        }));

        // Configurar las opciones de la tabla
        const tableOptions = {
            headers,
            rows: data,
            columnsAlignment: ['center', 'left', 'left', 'center', 'center', 'center'],
        };

        // Generar la tabla en el documento PDF
        doc.table(tableOptions, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
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
        console.error('Error al generar el reporte de proyectos:', error);
        res.status(500).json({
            status: 500,
            message: 'Error interno del servidor',
        });
    }
});


  

  router.get('/proyecto/:id_proyecto/reporte', async (req, res) => {
    try {
      const id_proyecto = req.params.id_proyecto;
  
      // Realizar la consulta a la base de datos para obtener el proyecto específico
      const proyecto = await Proyecto.findOne({ where: { id_proyecto } });
  
      // Realizar la consulta a la API para obtener los integrantes del proyecto
      const integrantesResponse = await axios.get(`http://srv435312.hstgr.cloud:3001/api/v1/integrantes/personas/${id_proyecto}`);
  
      // Extraer los integrantes del cuerpo de la respuesta
      const integrantes = integrantesResponse.data.data;
  
      // Crear un nuevo documento PDF en memoria
      let doc = new PDFDocument({ margin: 30, size: 'A4' });
  
      // Establecer el tipo de contenido de la respuesta HTTP como PDF
      res.setHeader('Content-Type', 'application/pdf');
  
      // Adjuntar el archivo PDF como flujo de datos a la respuesta HTTP
      doc.pipe(res);
  
      // Agregar el logo al documento
      const logoPath = 'src/LOGO-UPC (1).png'; // Ruta de tu archivo de logo
      doc.image(logoPath, { width: 150 }); // Ajustar el tamaño del logo
  
      // Agregar el título del reporte de proyectos
      doc.fontSize(16).text('Reporte de Proyecto Individual', { align: 'center' });
      doc.moveDown(); // Moverse hacia abajo después del título
  
      // Agregar información del proyecto al PDF
      doc.fontSize(14).text(`ID Proyecto: ${proyecto.id_proyecto}`);
      doc.fontSize(14).text(`Título: ${proyecto.título}`);
      doc.fontSize(14).text(`Descripción: ${proyecto.descripción}`);
      doc.fontSize(14).text(`Fecha Radicado: ${proyecto.fecha_radicado}`);
      doc.fontSize(14).text(`Estado: ${proyecto.estado}`);
      doc.moveDown(); // Moverse hacia abajo después de la información del proyecto
  
      // Definir las cabeceras de la tabla para los integrantes
      const integrantesHeaders = ['Nombre', 'Rol'];
  
      // Mapear los datos de los integrantes para la tabla
      const integrantesData = integrantes.map(integrante => {
        return [
          integrante.Usuario.nombre,
          integrante.rol,
        ];
      });
  
      // Configurar las opciones de la tabla para los integrantes
      const integrantesTableOptions = {
        headers: integrantesHeaders,
        rows: integrantesData,
        columnsAlignment: ['left', 'left'],
      };
  
      // Generar la tabla para los integrantes en el documento PDF
      doc.moveDown().fontSize(16).text('Integrantes del Proyecto', { align: 'center' });
      doc.moveDown(); // Moverse hacia abajo después del título
      doc.table(integrantesTableOptions, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font("Helvetica").fontSize(8);
          indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
        },
      });
  
      // Agregar la fecha actual al pie de página
      const currentDate = new Date().toLocaleDateString();
      doc.moveDown().fontSize(8).text(`Fecha: ${currentDate}`, { align: 'right' });
  
      // Finalizar el documento PDF
      doc.end();
    } catch (error) {
      console.error('Error al generar el reporte del proyecto:', error);
      res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
      });
    }
  });

  

  module.exports=router
