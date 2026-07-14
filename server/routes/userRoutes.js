import express from "express";
import {
  getUserProfile,
  getOwnProfile,
  updateOwnProfile,
  changePassword,
  getUserActivity,
  updateProfilePicture,
  updateCoverPicture,
  followUser,
  unfollowUser,
  checkUsername,
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";

import upload from "../config/multer.js";

const router = express.Router();

// Logged in user's profile
router.get("/profile", protect, getOwnProfile);

// Update profile
router.put("/profile", protect, updateOwnProfile);

// Check username
router.get("/check-username", protect, checkUsername);

// Change password
router.put("/profile/password", protect, changePassword);

router.get("/profile/activity", protect, getUserActivity);

// Public profile
router.get("/:id", getUserProfile);

router.put(
  "/profile/picture",
  protect,
  upload.single("image"),
  updateProfilePicture
);

router.put(
  "/profile/cover",
  protect,
  upload.single("image"),
  updateCoverPicture
);

router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

export default router;