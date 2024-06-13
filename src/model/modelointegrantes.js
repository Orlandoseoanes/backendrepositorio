const { Model, DataTypes } = require("sequelize");
const sequelize = require("../app/conexion");

const Proyecto = require("./modeloproyecto");
const Usuario = require("./modelosusuario");

class Integrantes extends Model {}

Integrantes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cedula_usuario: {
      type: DataTypes.BIGINT,
    },
    proyectoId: {
      type: DataTypes.STRING,
    },
    rol: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "Integrantes",
    createdAt: false,
    updatedAt: false,
  }
);

Integrantes.belongsTo(Proyecto, { foreignKey: "proyectoId" });
Integrantes.belongsTo(Usuario, { foreignKey: "cedula_usuario" });

module.exports = Integrantes;
