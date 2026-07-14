import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";

function Notifications() {
  const navigate = useNavigate();
  const { socket, setUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
      const count = (res.data.notifications || []).filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("newNotification", () => {
      fetchNotifications();
    });
    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length === 0) return;

      // Call endpoint for each or update locally if endpoint doesn't support bulk.
      // Since individual exists, let's fire bulk promises.
      await Promise.all(
        unread.map(n => API.put(`/notifications/${n._id}/read`))
      );

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark all as read");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-brand-text">
            Notifications 🔔
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Stay updated with likes, comments, and new followers.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs bg-purple-lilac/35 hover:bg-purple-lilac/65 text-purple-deep border border-purple-lilac/60 px-4 py-2.5 rounded-full font-semibold transition cursor-pointer"
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-brand-border mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
            filter === "all"
              ? "border-purple-primary text-purple-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
            filter === "unread"
              ? "border-purple-primary text-purple-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-brand-card rounded-2xl border border-brand-border p-12 text-center">
          <span className="text-4xl">🔔</span>
          <h3 className="text-lg font-poppins font-bold mt-4 text-brand-text">
            No notifications yet
          </h3>
          <p className="text-brand-muted text-sm mt-1">
            We will let you know when someone interacts with your posts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              className={`bg-brand-card border border-brand-border rounded-2xl p-5 flex justify-between items-center transition duration-200 shadow-sm ${
                !n.isRead ? "border-l-4 border-l-purple-primary bg-purple-lilac/5" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {n.type === "like" && "❤️"}
                    {n.type === "comment" && "💬"}
                    {n.type === "reply" && "🔁"}
                    {n.type === "bookmark" && "🔖"}
                    {n.type === "follow" && "👤"}
                  </span>
                  <p className="text-sm text-brand-text">
                    <Link to={`/profile/${n.sender?._id}`} className="font-bold hover:underline hover:text-purple-primary">
                      {n.sender?.name || "Someone"}
                    </Link>{" "}
                    {n.type === "like" && "liked your article"}
                    {n.type === "comment" && "commented on your article"}
                    {n.type === "reply" && "replied to your comment"}
                    {n.type === "bookmark" && "bookmarked your article"}
                    {n.type === "follow" && "started following you"}
                  </p>
                </div>

                {n.blog && (
                  <p className="text-xs text-brand-muted mt-2 pl-8 font-poppins">
                    Article:{" "}
                    <Link to={`/blog/${n.blog._id}`} className="hover:underline text-purple-primary font-medium">
                      "{n.blog.title}"
                    </Link>
                  </p>
                )}

                <p className="text-[10px] text-brand-muted pl-8 mt-1.5">
                  📅 {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  className="bg-brand-bg hover:bg-brand-border border border-brand-border text-brand-muted hover:text-brand-text p-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
