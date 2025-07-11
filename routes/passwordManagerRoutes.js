const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordManagerController");
const passwordManagerAccessController = require("../controllers/passwordManagerAccessController");

router.post("/", passwordController.createPassword);

router.put("/:id", passwordController.updatePassword);

router.delete("/:id", passwordController.deletePassword);

router.get("/", passwordController.getAllPasswords);

router.get("/:id", passwordController.getPasswordById);

router.post("/verify-access-manager", passwordManagerAccessController.verifyPassword);

router.post("/update-access-manager", passwordManagerAccessController.updatePassword);

module.exports = router;
