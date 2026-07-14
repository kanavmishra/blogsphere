import User from "../models/User.js";

const admin = async (req, res, next) => {
  try {
    // req.user has decoded token payload which contains id
    const user = await User.findById(req.user.id);
    
    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({
        message: "Not authorized as an admin",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error checking admin privileges",
    });
  }
};

export default admin;
