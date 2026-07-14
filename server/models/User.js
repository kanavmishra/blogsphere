import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    profilePictureUrl: {
      type: String,
      default: "",
    },

    coverImageUrl: {
      type: String,
      default: "",
    },

    social: {
      github: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },

    stats: {
      postsCount: {
        type: Number,
        default: 0,
      },
      followersCount: {
        type: Number,
        default: 0,
      },
      followingCount: {
        type: Number,
        default: 0,
      },
      likesReceived: {
        type: Number,
        default: 0,
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);