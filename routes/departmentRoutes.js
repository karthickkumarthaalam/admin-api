const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

router.post("/create", departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.patch("/:id/status", departmentController.updateDepartmentStatus);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
