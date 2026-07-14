import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
  updateComment,
} from "../controllers/commentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Add Comment
router.post("/:blogId", protect, addComment);

// Get Comments of a Blog
router.get("/:blogId", getComments);

// Delete Comment
router.delete("/:commentId", protect, deleteComment);

router.put("/:commentId", protect, updateComment);

export default router;