import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { toast } from "react-toastify";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    categoryBreakdown: []
  });

  const fetchMyBlogs = async () => {
    try {
      const res = await API.get("/blogs/myblogs");
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.error("Error fetching my blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/blogs/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
    fetchStats();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog post?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/blogs/${id}`);
      toast.success("Blog deleted successfully!");
      fetchMyBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // Calculate stats
  const totalLikes = stats.totalLikes;
  const totalViews = stats.totalViews;
  const totalBookmarks = stats.totalBookmarks;

  const chartData = blogs.map((blog) => ({
    title:
      blog.title.length > 15
        ? blog.title.substring(0, 15) + "..."
        : blog.title,
    views: blog.views || 0,
    likes: blog.likes?.length || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-reveal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <span className="text-xs font-semibold text-purple-deep bg-purple-lilac/30 px-3.5 py-1.5 rounded-full border border-purple-lilac/60">
            Creator Studio
          </span>
          <h1 className="text-4xl font-poppins font-bold text-brand-text mt-3">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Manage your published articles and track engagement stats.
          </p>
        </div>

        <Link
          to="/create-blog"
          className="bg-purple-primary hover:bg-purple-primary/90 text-white font-semibold px-6 py-3 rounded-full transition shadow-md shadow-purple-primary/25 flex items-center gap-2 cursor-pointer glow-button-purple"
        >
          <span>✍️</span> Write New Blog
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-purple-lilac/30 border border-purple-lilac/60 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase font-bold text-purple-deep">Articles</p>
          <h2 className="text-2xl font-bold text-purple-deep mt-2">
            📝 {blogs.length}
          </h2>
        </div>

        <div className="bg-[#FCEBEA] border border-[#E9C7C5] rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#7A3633]">Likes</p>
          <h2 className="text-2xl font-bold text-[#7A3633] mt-2">
            ❤️ {totalLikes}
          </h2>
        </div>

        <div className="bg-purple-primary/10 border border-purple-primary/20 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase font-bold text-purple-primary">Views</p>
          <h2 className="text-2xl font-bold text-purple-primary mt-2">
            👁️ {totalViews}
          </h2>
        </div>

        <div className="bg-rose-gold/15 border border-rose-gold/30 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8A5A4D]">Bookmarks</p>
          <h2 className="text-2xl font-bold text-[#8A5A4D] mt-2">
            🔖 {totalBookmarks}
          </h2>
        </div>

        <div className="bg-[#EBF5FC] border border-[#CDE5F7] rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#2A6B9C]">Followers</p>
          <h2 className="text-2xl font-bold text-[#2A6B9C] mt-2">
            👤 {stats.totalFollowers || 0}
          </h2>
        </div>

        <div className="bg-[#F7EDFC] border border-[#ECD1F7] rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#7A2A9C]">Following</p>
          <h2 className="text-2xl font-bold text-[#7A2A9C] mt-2">
            👥 {stats.totalFollowing || 0}
          </h2>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Blog Performance Chart */}
        <div className="glass-card border border-brand-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-poppins font-bold text-brand-text mb-6">
            📊 Blog Performance (Views)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="title" stroke="#A692C4" />
                <YAxis stroke="#A692C4" />
                <Tooltip />
                <Bar dataKey="views" fill="#5B2EFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown Chart */}
        <div className="glass-card border border-brand-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-poppins font-bold text-brand-text mb-6">
            📈 Category Breakdown (Views & Likes)
          </h2>
          <div className="h-80">
            {stats.categoryBreakdown?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-brand-muted text-sm">
                No category breakdown data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryBreakdown}>
                  <XAxis dataKey="name" stroke="#A692C4" />
                  <YAxis stroke="#A692C4" />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Views" />
                  <Bar dataKey="likes" fill="#EC4899" radius={[8, 8, 0, 0]} name="Likes" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* My Blogs Header */}
      <h2 className="text-2xl font-poppins font-bold text-brand-text mb-6 flex items-center gap-2">
        <span>📂</span> Published Posts
      </h2>

      {blogs.length === 0 ? (
        <div className="bg-brand-card/50 rounded-2xl border border-brand-border border-dashed p-12 text-center max-w-xl mx-auto">
          <span className="text-4xl">📝</span>
          <h3 className="text-xl font-poppins font-bold mt-4 text-brand-text">
            No published posts yet
          </h3>
          <p className="text-brand-muted text-sm mt-2">
            You haven't written any blogs. Share your knowledge with the world by creating your first article.
          </p>
          <Link
            to="/create-blog"
            className="mt-6 inline-block bg-purple-primary hover:bg-purple-primary/95 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-sm glow-button-purple"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-brand-card border border-brand-border hover:border-purple-primary/30 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-200 shadow-sm"
            >
              <div>
                <span className="text-[10px] font-bold text-purple-deep uppercase bg-purple-lilac/30 border border-purple-lilac/60 px-2 py-0.5 rounded-full">
                  {blog.category}
                </span>
                <h3 className="text-lg font-poppins font-bold text-brand-text mt-2 hover:text-purple-primary transition-colors">
                  <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
                </h3>
                <p className="text-xs text-brand-muted/80 mt-2 flex flex-wrap gap-4">
                  <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span>👀 {blog.views || 0}</span>
                  <span>❤️ {blog.likes?.length || 0}</span>
                  <span>🔖 {blog.bookmarks?.length || 0}</span>
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Link
                  to={`/blog/${blog._id}`}
                  className="flex-1 md:flex-initial text-center bg-brand-card hover:bg-brand-bg text-brand-muted border border-brand-border px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  View
                </Link>

                <Link
                  to={`/edit-blog/${blog._id}`}
                  className="flex-1 md:flex-initial text-center bg-purple-lilac/30 hover:bg-purple-lilac/50 border border-purple-lilac/60 text-purple-deep px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(blog._id)}
                  className="flex-1 md:flex-initial bg-[#FCEBEA] border border-[#E9C7C5] text-[#7A3633] hover:bg-[#F2DBDA] px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;