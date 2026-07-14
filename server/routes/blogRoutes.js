import express from "express";

import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getMyBlogs,
  updateBlog,
  deleteBlog,
  likeBlog,
  bookmarkBlog,
  getBookmarkedBlogs,
  getDashboardStats,
} from "../controllers/blogController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Create Blog (Protected)
router.post("/", protect, upload.single("image"), createBlog);

// Get All Blogs (Public)
router.get("/", getAllBlogs);

// Get Logged-in User's Blogs (Protected)
router.get("/myblogs", protect, getMyBlogs);

router.get("/dashboard/stats", protect, getDashboardStats);

router.put("/:id/like", protect, likeBlog);

//bookmark
router.put("/:id/bookmark", protect, bookmarkBlog);

router.get("/bookmarks/my", protect, getBookmarkedBlogs);

// Get Single Blog (Public)
router.get("/:id", getBlogById);

// Update Blog (Protected)
router.put("/:id", protect, upload.single("image"), updateBlog);

// Delete Blog (Protected)
router.delete("/:id", protect, deleteBlog);

export default router;