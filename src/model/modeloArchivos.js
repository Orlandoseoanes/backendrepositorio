const { Model, DataTypes } = require("sequelize");

// Option 3: Passing parameters separately (other dialects)
const sequelize = require("../app/conexion");

const Proyecto = require("./modeloproyecto");

class Archivos extends Model {}
Archivos.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    archivo: {
      type: DataTypes.TEXT, // Cambiado a BLOB para almacenar archivos binarios
    },
    proyectoId: {
      type: DataTypes.STRING, // Puedes ajustar según el tipo de id_proyecto
      references: {
        model: Proyecto,
        key: "id_proyecto",
      },
    },
    fechapublicado: {
      type: DataTypes.DATE,
    },
    TipoArchivo:{
      type: DataTypes.STRING
    }
  },
  {
    sequelize,
    modelName: "Archivos",
    timestamps: false, // Agregar esta línea para incluir createdAt y updatedAt
    updatedAt: false, //
  }
);
Archivos.belongsTo(Proyecto, { foreignKey: "proyectoId" });

module.exports = Archivos;
