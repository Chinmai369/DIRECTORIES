const express = require("express");
const router = express.Router();

const employeeController = require("../server/controllers/employee.controller");

router.get("/", employeeController.getEmployees);
router.get("/stats", employeeController.getEmployeeStats);
router.get("/:id", employeeController.getEmployeeById);

module.exports = router;
