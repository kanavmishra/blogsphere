import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Blog from "../models/Blog.js";

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }


const comment = await Comment.create({
  text,
  author: req.user.id,
  blog: req.params.blogId,
  parentComment: parentComment || null,
});

const blog = await Blog.findById(req.params.blogId);

if (
  blog &&
  blog.author.toString() !== req.user.id &&
  !parentComment
) {
  const notification = await Notification.create({
    recipient: blog.author,
    sender: req.user.id,
    type: "comment",
    blog: blog._id,
    comment: comment._id,
  });

  if (global.io) {
    global.io.to(blog.author.toString()).emit("newNotification", {
      _id: notification._id,
      type: "comment",
      blog: { _id: blog._id, title: blog.title },
      sender: {
        _id: req.user.id,
        name: req.user.name,
      },
      isRead: false,
      createdAt: notification.createdAt,
    });
  }
}

if (parentComment) {
  const parent = await Comment.findById(parentComment);

  if (
    parent &&
    parent.author.toString() !== req.user.id
  ) {
    const notification = await Notification.create({
      recipient: parent.author,
      sender: req.user.id,
      type: "reply",
      blog: parent.blog,
      comment: comment._id,
    });

    if (global.io) {
      global.io.to(parent.author.toString()).emit("newNotification", {
        _id: notification._id,
        type: "reply",
        blog: { _id: parent.blog },
        sender: {
          _id: req.user.id,
          name: req.user.name,
        },
        isRead: false,
        createdAt: notification.createdAt,
      });
    }
  }
}

await comment.populate("author", "name _id profilePictureUrl");

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET COMMENTS OF A BLOG
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
  blog: req.params.blogId,
  parentComment: null,
})
  .populate("author", "name _id profilePictureUrl")
  .sort({ createdAt: -1 });

  for (const comment of comments) {
  const replies = await Comment.find({
    parentComment: comment._id,
  })
    .populate("author", "name _id profilePictureUrl")
    .sort({ createdAt: 1 });

  comment._doc.replies = replies;
}

    res.status(200).json({
      comments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    console.log("Comment Author:", comment.author.toString());
console.log("Logged In User:", req.user.id);
console.log("Decoded User:", req.user);

    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE COMMENT
export const updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    comment.text = text;

await comment.save();

// Populate author before sending back
await comment.populate("author", "name _id profilePictureUrl");

res.status(200).json({
  message: "Comment updated successfully",
  comment,
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};