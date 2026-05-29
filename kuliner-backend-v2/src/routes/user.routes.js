const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth");
const { validateRequired } = require("../middlewares/validate");

router.use(verifyToken, authorizeRole("ADMIN"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", validateRequired(["nama", "username", "password"]), authController.register);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.put("/:id/reset-password", validateRequired(["passwordBaru"]), userController.resetPassword);

module.exports = router;