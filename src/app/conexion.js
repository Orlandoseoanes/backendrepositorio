const { Sequelize } = require("sequelize");

const sequelize = new Sequelize('proyecto', 'prueba', 'tMeque+2023+', {
    host: 'srv435312.hstgr.cloud',
    dialect: "mysql",
});

module.exports = sequelize;