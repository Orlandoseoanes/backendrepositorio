const { Model, DataTypes } = require("sequelize");
const sequelize = require("../app/conexion");

const Proyecto = require("./modeloproyecto");
const Integrantes = require("./modelointegrantes");

class Mensajes extends Model {}

Mensajes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Categoria: {
      type: DataTypes.INTEGER
    },
    TipoMensaje: {
      type: DataTypes.STRING
    },
    ProyectoId: {
      type: DataTypes.STRING, // Corregido a STRING
    },
    mensaje: {
      type: DataTypes.TEXT,
    },
    cedula_usuario: {
      type: DataTypes.BIGINT,
    },
    fecha: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Mensajes",
    timestamps: false,
    updatedAt: false,
  }
);

Mensajes.belongsTo(Proyecto, { foreignKey: 'ProyectoId' });
Mensajes.belongsTo(Integrantes, { foreignKey: 'cedula_usuario' });

module.exports = Mensajes;
