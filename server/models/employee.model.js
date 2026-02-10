const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Employee = sequelize.define(
  "Employee",
  {
    employeeid: { type: DataTypes.STRING, primaryKey: true },
    cfms_id: { type: DataTypes.STRING },

    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    fathername: DataTypes.STRING,

    designation: DataTypes.STRING,
    desgcode: DataTypes.STRING,

    dept_id: DataTypes.INTEGER,
    department_name: DataTypes.STRING,
    department_code: DataTypes.STRING,

    distcode: DataTypes.STRING,
    distname: DataTypes.STRING,

    mobileno: DataTypes.STRING,
    email1: DataTypes.STRING,

    doj: DataTypes.DATE,
    dor: DataTypes.DATE,
    dob: DataTypes.DATE, // Date of birth

    basicpay: DataTypes.FLOAT,
    gross: DataTypes.FLOAT,

    gender_desc: DataTypes.STRING,
    employee_status: DataTypes.STRING
  },
  {
    tableName: "ext_cfms_stg_t",
    timestamps: false
  }
);

module.exports = Employee;
