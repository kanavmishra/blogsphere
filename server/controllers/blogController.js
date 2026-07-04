import Blog from "../models/Blog.js";

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, image } = req.body;

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

// GET ALL BLOGS
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name email");

    res.status(200).json({
      blogs,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE BLOG
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

    res.status(200).json(blog);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    const { title, content, category, image } = req.body;

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
    blog.image = image || blog.image;

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