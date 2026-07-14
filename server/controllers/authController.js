import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpire,
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - BlogSphere",
      text: `Hello ${user.name},\n\nPlease verify your email by clicking the link: ${verificationUrl}\n\nThank you!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #5B2EFF;">Welcome to BlogSphere! 🚀</h2>
          <p>Hi ${user.name},</p>
          <p>Thank you for registering. Please verify your email address to unlock full writing privileges on our platform.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #5B2EFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #666;">If you did not sign up for this account, you can ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      message: "User Registered Successfully. A verification email has been sent.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: false,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role || "user",
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// VERIFY EMAIL
// ==============================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully! You can now access all features.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// FORGOT PASSWORD
// ==============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - BlogSphere",
      text: `Hello ${user.name},\n\nYou requested a password reset. Please click the link to reset your password: ${resetUrl}\n\nThis link expires in 30 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #5B2EFF;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your BlogSphere account password. Please click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #5B2EFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #666;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// RESET PASSWORD
// ==============================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully! You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// RESEND VERIFICATION EMAIL
// ==============================
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // Regulate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - BlogSphere",
      text: `Hello ${user.name},\n\nPlease verify your email by clicking the link: ${verificationUrl}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #5B2EFF;">Verify Your Email - BlogSphere</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address to unlock full writing privileges.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #5B2EFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: bold;">Verify Email</a>
          </div>
        </div>
      `,
    });

    res.status(200).json({
      message: "Verification email resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};