import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likes: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

// ❤️ Users who bookmarked this blog
bookmarks: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

// 👁 Number of views
views: {
  type: Number,
  default: 0,
},

status: {
  type: String,
  enum: ["published", "draft"],
  default: "published",
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Blog", blogSchema);