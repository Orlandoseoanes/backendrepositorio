const { Model, DataTypes } = require("sequelize");

const sequelize = require("../app/conexion");
const Carrera = require("./modeloscarreras"); // Asegúrate de que la ruta al modelo sea correcta

class Proyecto extends Model {}

Proyecto.init(
  {
    id_proyecto: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    título: {
      type: DataTypes.STRING,
    },
    descripción: {
      type: DataTypes.TEXT,
    },
    fecha_radicado: {
      type: DataTypes.DATE,
    },
    estado: {
      type: DataTypes.STRING,
    },
    carreraId: {
      type: DataTypes.INTEGER,
      references: {
        model: Carrera,
        key: 'id'
      }
    },
  },
  {
    sequelize,
    modelName: "Proyecto",
    createdAt: false,
    updatedAt: false,
  }
);

module.exports = Proyecto;
