import User from "../models/User.js";
import Blog from "../models/Blog.js";
import bcrypt from "bcryptjs";
import Notification from "../models/Notification.js";

// ==============================
// GET PUBLIC USER PROFILE
// ==============================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const blogs = await Blog.find({
      author: user._id,
    }).sort({ createdAt: -1 });

    const totalViews = blogs.reduce(
      (sum, blog) => sum + (blog.views || 0),
      0
    );

    const totalLikes = blogs.reduce(
      (sum, blog) => sum + (blog.likes?.length || 0),
      0
    );

    const totalBookmarks = blogs.reduce(
      (sum, blog) => sum + (blog.bookmarks?.length || 0),
      0
    );

    res.status(200).json({
      user,
      blogs,
      stats: {
        totalBlogs: blogs.length,
        totalViews,
        totalLikes,
        totalBookmarks,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// GET LOGGED IN USER
// ==============================
export const getOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// UPDATE PROFILE
// ==============================
export const updateOwnProfile = async (req, res) => {
  try {
    const {
      username,
      fullName,
      bio,
      location,
      social,
      profilePictureUrl,
      coverImageUrl,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check username uniqueness if modified
    if (username && username !== user.username) {
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          message: "Username must be 3-20 characters long and contain only letters, numbers, underscores, or dashes",
        });
      }

      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({
          message: "Username is already taken",
        });
      }
      user.username = username.toLowerCase();
    }

    if (fullName !== undefined) {
      user.fullName = fullName;
      user.name = fullName;
    }
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    
    if (social) {
      user.social = {
        github: social.github !== undefined ? social.github : user.social?.github || "",
        linkedin: social.linkedin !== undefined ? social.linkedin : user.social?.linkedin || "",
        twitter: social.twitter !== undefined ? social.twitter : user.social?.twitter || "",
        website: social.website !== undefined ? social.website : user.social?.website || "",
      };
    }

    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;
    if (coverImageUrl !== undefined) user.coverImageUrl = coverImageUrl;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// CHANGE PASSWORD
// ==============================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// UPDATE PROFILE PICTURE
// ==============================
export const updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    user.profilePictureUrl = req.file.path;

    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// UPDATE COVER PICTURE
// ==============================
export const updateCoverPicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    user.coverImageUrl = req.file.path;

    await user.save();

    res.status(200).json({
      message: "Cover image updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const drafts = await Blog.find({
      author: req.user.id,
      status: "draft",
    }).sort({ updatedAt: -1 });

    const publishedBlogs = await Blog.find({
      author: req.user.id,
      status: "published",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      drafts,
      likedBlogs: [],
      comments: [],
      publishedBlogs,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// FOLLOW USER
// ==============================
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Initialize arrays if they don't exist
    if (!userToFollow.followers) userToFollow.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      return res.status(400).json({
        message: "You are already following this user",
      });
    }

    // Update followers and following
    userToFollow.followers.push(currentUserId);
    currentUser.following.push(targetUserId);

    // Update counters
    userToFollow.stats.followersCount = userToFollow.followers.length;
    currentUser.stats.followingCount = currentUser.following.length;

    await userToFollow.save();
    await currentUser.save();

    // Create Notification
    const notification = await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: "follow",
    });

    // Handle socket.io emission if server has io instance
    if (global.io) {
      global.io.to(targetUserId).emit("newNotification", {
        _id: notification._id,
        type: "follow",
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          profilePictureUrl: currentUser.profilePictureUrl,
        },
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    res.status(200).json({
      message: "Successfully followed user",
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// UNFOLLOW USER
// ==============================
export const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const userToUnfollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Initialize arrays if they don't exist
    if (!userToUnfollow.followers) userToUnfollow.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (!isFollowing) {
      return res.status(400).json({
        message: "You are not following this user",
      });
    }

    // Remove from followers and following lists
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );

    // Update counters
    userToUnfollow.stats.followersCount = userToUnfollow.followers.length;
    currentUser.stats.followingCount = currentUser.following.length;

    await userToUnfollow.save();
    await currentUser.save();

    res.status(200).json({
      message: "Successfully unfollowed user",
      followersCount: userToUnfollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// CHECK USERNAME AVAILABILITY
// ==============================
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "Username query parameter is required" });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check format (alphanumeric, underscore, dash, between 3 and 20 characters)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(cleanUsername)) {
      return res.status(400).json({
        message: "Username must be 3-20 characters long and contain only letters, numbers, underscores, or dashes",
        available: false,
      });
    }

    const existingUser = await User.findOne({ username: cleanUsername });
    
    if (!existingUser) {
      return res.status(200).json({
        available: true,
        message: "Username is available",
      });
    }

    // If username is taken, generate unique suggestions
    const suggestions = [];
    const base = cleanUsername;
    
    // Generate up to 3 suggestions
    let attempt = 0;
    while (suggestions.length < 3 && attempt < 30) {
      attempt++;
      const suffix = Math.floor(10 + Math.random() * 989); // random number
      const candidate = `${base}${suffix}`;
      const taken = await User.findOne({ username: candidate });
      if (!taken && !suggestions.includes(candidate)) {
        suggestions.push(candidate);
      }
    }

    // Try standard suffix words if we still need suggestions
    const suffixes = ["_dev", "_web", "_code", "_write"];
    for (const suf of suffixes) {
      if (suggestions.length >= 3) break;
      const candidate = `${base}${suf}`;
      const taken = await User.findOne({ username: candidate });
      if (!taken && !suggestions.includes(candidate)) {
        suggestions.push(candidate);
      }
    }

    return res.status(200).json({
      available: false,
      message: "Username is already taken",
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};