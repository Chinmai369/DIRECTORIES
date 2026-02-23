const express = require("express");
const cors = require("cors");

const employeeRoutes = require("../routes/employee.routes");
const birthdayRoutes = require("../routes/birthday.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/employees", employeeRoutes);
app.use("/api/birthday", birthdayRoutes);

module.exports = app;
