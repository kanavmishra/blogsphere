import express from "express";
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllBlogsAdmin,
  deleteBlogAdmin,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Apply protect and admin to all routes
router.use(protect);
router.use(admin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);
router.get("/blogs", getAllBlogsAdmin);
router.delete("/blogs/:id", deleteBlogAdmin);

export default router;
