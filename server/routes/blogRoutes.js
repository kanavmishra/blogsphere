import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getMyBlogs,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Blog (Protected)
router.post("/", protect, createBlog);

// Get All Blogs (Public)
router.get("/", getAllBlogs);

// Get Logged-in User's Blogs (Protected)
router.get("/myblogs", protect, getMyBlogs);

// Get Single Blog (Public)
router.get("/:id", getBlogById);

// Update Blog (Protected)
router.put("/:id", protect, updateBlog);

// Delete Blog (Protected)
router.delete("/:id", protect, deleteBlog);

export default router;