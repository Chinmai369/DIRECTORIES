const express = require("express");
const router = express.Router();

const employeeController = require("../server/controllers/employee.controller");

router.get("/", employeeController.getEmployees);
router.get("/stats", employeeController.getEmployeeStats);
router.get("/validate/:cfmsId", employeeController.validateCfmsId);
router.get("/search-all", employeeController.searchAllEmployees);
router.delete("/remove/:cfmsId", employeeController.removeEmployee);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.addEmployee);

module.exports = router;
