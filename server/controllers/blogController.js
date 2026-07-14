import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
   const { title, content, category, image, status } = req.body;
    // Check required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      category,
      image,
      status: status || "published",
      author: req.user.id,
    });

    res.status(201).json({
      message: "Blog created successfully",
      blog,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL BLOGS + SEARCH
export const getAllBlogs = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search) {
      filter = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      };
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      blogs,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE BLOG + INCREASE VIEW COUNT
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    // Increase view count
    blog.views += 1;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    const { title, content, category, image, status } = req.body;

    const blog = await Blog.findById(req.params.id);


    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    // Check if the logged-in user owns this blog
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.image = image !== undefined ? image : blog.image;
    blog.status = status || blog.status;

    const updatedBlog = await blog.save();

    res.status(200).json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    // Check ownership
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      message: "Blog deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET LOGGED-IN USER'S BLOGS
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      author: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ❤️ LIKE / UNLIKE BLOG
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    // If likes doesn't exist, initialize it
    if (!blog.likes) {
      blog.likes = [];
    }

    const userId = req.user.id;

    const alreadyLiked = blog.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      blog.likes = blog.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      blog.likes.push(userId);

      // Create like notification
      if (blog.author.toString() !== userId) {
        const notification = await Notification.create({
          recipient: blog.author,
          sender: userId,
          type: "like",
          blog: blog._id,
        });

        if (global.io) {
          const senderUser = await User.findById(userId).select("name");
          global.io.to(blog.author.toString()).emit("newNotification", {
            _id: notification._id,
            type: "like",
            blog: { _id: blog._id, title: blog.title },
            sender: {
              _id: userId,
              name: senderUser?.name || "Someone",
            },
            isRead: false,
            createdAt: notification.createdAt,
          });
        }
      }
    }

    await blog.save();

    res.status(200).json({
      message: alreadyLiked
        ? "Blog unliked successfully"
        : "Blog liked successfully",
      likes: blog.likes.length,
      liked: !alreadyLiked,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// 🔖 BOOKMARK / REMOVE BOOKMARK
export const bookmarkBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    const userId = req.user.id;

    // Make sure bookmarks array exists
    if (!blog.bookmarks) {
      blog.bookmarks = [];
    }

    const alreadyBookmarked = blog.bookmarks.some(
      (id) => id.toString() === userId
    );

    if (alreadyBookmarked) {
      // Remove bookmark
      blog.bookmarks = blog.bookmarks.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Add bookmark
      blog.bookmarks.push(userId);

      // Create bookmark notification
      if (blog.author.toString() !== userId) {
        const notification = await Notification.create({
          recipient: blog.author,
          sender: userId,
          type: "bookmark",
          blog: blog._id,
        });

        if (global.io) {
          const senderUser = await User.findById(userId).select("name");
          global.io.to(blog.author.toString()).emit("newNotification", {
            _id: notification._id,
            type: "bookmark",
            blog: { _id: blog._id, title: blog.title },
            sender: {
              _id: userId,
              name: senderUser?.name || "Someone",
            },
            isRead: false,
            createdAt: notification.createdAt,
          });
        }
      }
    }

    await blog.save();

    res.status(200).json({
      message: alreadyBookmarked
        ? "Bookmark removed"
        : "Blog bookmarked",

      bookmarked: !alreadyBookmarked,
      bookmarks: blog.bookmarks.length,
    });

  } catch (error) {
    console.error("BOOKMARK ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// 📑 GET MY BOOKMARKED BLOGS
export const getBookmarkedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      bookmarks: req.user.id,
    }).populate("author", "name email");

    res.status(200).json({
      blogs,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 📊 Dashboard Analytics
export const getDashboardStats = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id });
    const user = await User.findById(req.user.id);

    const totalBlogs = blogs.length;

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

    // Calculate category breakdown
    const categoryStats = {};
    blogs.forEach((blog) => {
      const cat = blog.category || "Uncategorized";
      if (!categoryStats[cat]) {
        categoryStats[cat] = { count: 0, views: 0, likes: 0 };
      }
      categoryStats[cat].count += 1;
      categoryStats[cat].views += blog.views || 0;
      categoryStats[cat].likes += blog.likes?.length || 0;
    });

    const categoryBreakdown = Object.keys(categoryStats).map((cat) => ({
      name: cat,
      blogs: categoryStats[cat].count,
      views: categoryStats[cat].views,
      likes: categoryStats[cat].likes,
    }));

    res.json({
      totalBlogs,
      totalViews,
      totalLikes,
      totalBookmarks,
      totalFollowers: user?.followers?.length || 0,
      totalFollowing: user?.following?.length || 0,
      categoryBreakdown,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};