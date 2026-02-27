const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CmsnrDirectory = sequelize.define(
  "CmsnrDirectory",
  {
    sno: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    cfms_id: { type: DataTypes.STRING(20) },
    employee_id: { type: DataTypes.STRING(20) },
    employee_name: { type: DataTypes.STRING(150) }, // full name fallback
    sir_name: { type: DataTypes.STRING(100) },      // surname
    first_name: { type: DataTypes.STRING(100) },    // first name
    mobile_no: { type: DataTypes.STRING(15) },
    position: { type: DataTypes.STRING(150) },
    role: { type: DataTypes.STRING(100) },
    dob: { type: DataTypes.DATEONLY },
    age: { type: DataTypes.INTEGER },
    dor: { type: DataTypes.DATEONLY },
    time_to_retire: { type: DataTypes.STRING(50) },
    status: { type: DataTypes.STRING(50), defaultValue: "ACTIVE" },
    gender: { type: DataTypes.STRING(20) },
    designation: { type: DataTypes.STRING(150) },
    department: { type: DataTypes.STRING(150) },
    district: { type: DataTypes.STRING(150) },
    email: { type: DataTypes.STRING(150) },
    created_at: { type: DataTypes.DATE }
  },
  {
    tableName: "cdma_cmsnr_drctry",
    timestamps: false
  }
);

module.exports = CmsnrDirectory;
