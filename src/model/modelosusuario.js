const { Sequelize, Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../app/conexion");

const Carrera = require("./modeloscarreras");

class Usuario extends Model {}

Usuario.init(
  {
    cedula: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
    },
    apellido: {
      type: DataTypes.STRING,
    },
    correo: {
      type: DataTypes.STRING,
    },
    usuario: {
      type: DataTypes.STRING,
      unique: true,
    },
    contrasena: {
      type: DataTypes.STRING,
    },
    rol: {
      type: DataTypes.STRING,
    },
    carreraId: {
      type: DataTypes.INTEGER,
      references: {
        model: Carrera,
        key: "id",
      },
    },
  },
  {
    hooks: {
      beforeCreate: async (usuario) => {
        // Hash de la contraseña solo si se proporciona
        if (usuario.contrasena) {
          usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
        }
      },
    },
    sequelize,
    modelName: "Usuario",
    createdAt: false,
    updatedAt: false,
  }
);

// Método para comparar contraseñas durante la autenticación
Usuario.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.contrasena);
};

module.exports = Usuario;
