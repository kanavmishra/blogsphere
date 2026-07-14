import Notification from "../models/Notification.js";

// GET ALL NOTIFICATIONS
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    })
      .populate("sender", "name profilePictureUrl")
      .populate("blog", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};