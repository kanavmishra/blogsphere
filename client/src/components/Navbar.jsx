import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";
import API from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { socket, unreadCount, setUnreadCount } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
      const count = (res.data.notifications || []).filter(
        (n) => !n.isRead
      ).length;
      setUnreadCount(count);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", () => {
      fetchNotifications();
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  const handleNotificationClick = async (notification) => {
    try {
      await API.put(`/notifications/${notification._id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id
            ? { ...n, isRead: true }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setShowNotifications(false);

      if (notification.blog) {
        navigate(`/blog/${notification.blog._id}`);
      } else {
        navigate(`/profile/${notification.sender._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchQuery.trim()) {
        navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm border-b border-brand-border transition-all duration-300 bg-brand-card/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-poppins font-bold tracking-tight bg-gradient-to-r from-purple-primary via-rose-gold to-[#B89CFF] bg-clip-text text-transparent hover:opacity-90 transition duration-300 flex-shrink-0"
        >
          ✨ BlogSphere
        </Link>

        {/* Centered Navigation */}
        <div className="hidden md:flex items-center justify-center gap-6 flex-grow mx-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium nav-transition hover:text-purple-primary ${
                isActive ? "text-purple-primary border-b-2 border-purple-primary pb-1 font-semibold" : "text-brand-muted"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/blogs"
            className={({ isActive }) =>
              `text-sm font-medium nav-transition hover:text-purple-primary ${
                isActive ? "text-purple-primary border-b-2 border-purple-primary pb-1 font-semibold" : "text-brand-muted"
              }`
            }
          >
            Blogs
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-medium nav-transition hover:text-purple-primary ${
                isActive ? "text-purple-primary border-b-2 border-purple-primary pb-1 font-semibold" : "text-brand-muted"
              }`
            }
          >
            About
          </NavLink>

          {token && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium nav-transition hover:text-purple-primary ${
                  isActive ? "text-purple-primary border-b-2 border-purple-primary pb-1 font-semibold" : "text-brand-muted"
                }`
              }
            >
              Dashboard
            </NavLink>
          )}

          {token && (
            <NavLink
              to="/bookmarks"
              className={({ isActive }) =>
                `text-sm font-medium nav-transition hover:text-purple-primary ${
                  isActive ? "text-purple-primary border-b-2 border-purple-primary pb-1 font-semibold" : "text-brand-muted"
                }`
              }
            >
              📑 Bookmarks
            </NavLink>
          )}

          {token && user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium nav-transition hover:text-purple-primary ${
                  isActive ? "text-purple-primary border-b-2 border-purple-primary pb-1 font-semibold" : "text-brand-muted"
                }`
              }
            >
              👑 Admin Panel
            </NavLink>
          )}
        </div>

        {/* Right Section: Search, Toggle & Auth */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-full px-5 py-2 w-48 focus:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={handleSearchSubmit}
              className="absolute right-4 top-2.5 text-brand-muted hover:text-purple-primary transition cursor-pointer"
            >
              🔍
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-brand-bg border border-brand-border text-sm hover:bg-purple-lilac/35 transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {!token ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-brand-muted hover:text-brand-text px-4 py-2 hover:bg-brand-border/40 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-purple-primary/90 transition duration-300 glow-button-purple"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-brand-bg border border-brand-border text-lg transition cursor-pointer"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-brand-card rounded-2xl shadow-xl border border-brand-border z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-bg">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Notifications</span>
                      <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs text-purple-primary hover:underline">
                        View All
                      </Link>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="p-6 text-sm text-center text-brand-muted">No notifications</p>
                    ) : (
                      <div className="divide-y divide-brand-border/50">
                        {notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 cursor-pointer hover:bg-brand-bg transition duration-150 ${
                              !n.isRead ? "bg-purple-lilac/10 font-medium" : ""
                            }`}
                          >
                            <p className="text-xs text-brand-text">
                              <span className="font-bold">{n.sender?.name || "Someone"}</span>{" "}
                              {n.type === "comment" && "commented on your article"}
                              {n.type === "reply" && "replied to your comment"}
                              {n.type === "like" && "liked your article"}
                              {n.type === "bookmark" && "bookmarked your article"}
                              {n.type === "follow" && "started following you"}
                            </p>
                            {n.blog && (
                              <p className="text-[10px] text-brand-muted mt-1 truncate">
                                "{n.blog.title}"
                              </p>
                            )}
                            <p className="text-[8px] text-brand-muted mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                to={`/profile/${user?.id || user?._id}`}
                className="flex items-center gap-2 hover:opacity-85 transition group"
                title="View Profile"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-primary to-rose-gold flex items-center justify-center font-bold text-white text-xs shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-sm text-brand-muted font-medium group-hover:text-purple-primary transition">
                  Profile
                </span>
              </Link>
              <Link
                to="/create-blog"
                className="bg-purple-lilac/45 border border-brand-border hover:bg-purple-lilac/70 text-purple-deep text-xs font-semibold px-4 py-2 rounded-full transition duration-300"
              >
                + Write
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#FCEBEA] border border-[#E9C7C5] hover:bg-[#F2DBDA] text-[#7A3633] text-xs font-semibold px-4 py-2 rounded-full transition duration-300 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle & Theme toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-brand-bg border border-brand-border text-xs"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {token && (
            <Link
              to={`/profile/${user?.id || user?._id}`}
              className="text-xs text-purple-primary font-semibold hover:underline"
              title="View Profile"
            >
              Profile
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-brand-text focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-card border-b border-brand-border px-6 py-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-full px-5 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 transition-all duration-300"
            />
            <button
              onClick={handleSearchSubmit}
              className="absolute right-4 top-2 text-brand-muted"
            >
              🔍
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-brand-muted hover:text-brand-text"
            >
              Home
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-brand-muted hover:text-brand-text"
            >
              Blogs
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-brand-muted hover:text-brand-text"
            >
              About
            </Link>
            {token && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-brand-muted hover:text-brand-text"
              >
                Dashboard
              </Link>
            )}
            {token && (
              <Link
                to={`/profile/${user?.id || user?._id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-brand-muted hover:text-brand-text"
              >
                Profile
              </Link>
            )}
            <hr className="border-brand-border" />
            {!token ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-medium text-brand-muted hover:text-brand-text border border-brand-border py-2 rounded-full"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold bg-purple-primary text-white py-2 rounded-full hover:bg-purple-primary/95"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/create-blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-semibold bg-purple-lilac/45 border border-brand-border text-purple-deep py-2.5 rounded-full"
                >
                  + Create Blog
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-center text-xs font-semibold bg-[#FCEBEA] border border-[#E9C7C5] text-[#7A3633] py-2.5 rounded-full"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;