import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

// ==============================
// GET ADMIN DASHBOARD STATS
// ==============================
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalComments = await Comment.countDocuments();

    const blogs = await Blog.find().select("views");
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

    // Get active writers (users with blogs)
    const writers = await User.find().select("name email role createdAt").limit(10).sort({ createdAt: -1 });

    res.status(200).json({
      stats: {
        totalUsers,
        totalBlogs,
        totalComments,
        totalViews,
      },
      recentUsers: writers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// LIST ALL USERS
// ==============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// DELETE USER
// ==============================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin" && user._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    // Delete user's blogs & comments
    await Blog.deleteMany({ author: user._id });
    await Comment.deleteMany({ author: user._id });
    await user.deleteOne();

    res.status(200).json({
      message: "User and all their contents deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// UPDATE USER ROLE
// ==============================
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role specified",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `User role updated to ${role} successfully`,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// LIST ALL BLOGS
// ==============================
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// DELETE BLOG BY ADMIN
// ==============================
export const deleteBlogAdmin = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    await blog.deleteOne();
    res.status(200).json({
      message: "Blog deleted successfully by admin",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
