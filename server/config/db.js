const { Sequelize } = require("sequelize");
const dbConfig = require("./dbconfig");

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false
  }
);

module.exports = sequelize;
