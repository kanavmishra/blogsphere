import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },

    parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", commentSchema);