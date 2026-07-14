import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("stats"); // 'stats', 'users', 'blogs'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (activeTab === "stats") {
        const res = await API.get("/admin/stats");
        setStats(res.data.stats || {});
        setRecentUsers(res.data.recentUsers || []);
      } else if (activeTab === "users") {
        const res = await API.get("/admin/users");
        setUsers(res.data || []);
      } else if (activeTab === "blogs") {
        const res = await API.get("/admin/blogs");
        setBlogs(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(res.data.message);
      
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will remove all their articles and comments!")) return;

    try {
      const res = await API.delete(`/admin/users/${userId}`);
      toast.success(res.data.message);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await API.delete(`/admin/blogs/${blogId}`);
      toast.success(res.data.message);
      setBlogs(prev => prev.filter(b => b._id !== blogId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <span className="text-xs font-semibold text-purple-deep bg-purple-lilac/30 px-3.5 py-1.5 rounded-full border border-purple-lilac/60">
            System Administration
          </span>
          <h1 className="text-4xl font-poppins font-black text-brand-text mt-3">
            👑 Admin Command Center
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Oversee user accounts, review articles, and check global platform analytics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 border-b border-brand-border">
        {[
          { id: "stats", label: "📊 System Metrics" },
          { id: "users", label: "👤 Accounts List" },
          { id: "blogs", label: "📂 Published Blogs" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-purple-primary text-white shadow-sm"
                : "bg-brand-card text-brand-muted border border-brand-border hover:bg-purple-lilac/30 hover:text-brand-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
        </div>
      ) : (
        <div>
          {/* STATS TAB */}
          {activeTab === "stats" && (
            <div className="space-y-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-purple-lilac/30 border border-purple-lilac/60 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase font-bold text-purple-deep">Total Users</p>
                  <h2 className="text-3xl font-bold text-purple-deep mt-2">👥 {stats.totalUsers || 0}</h2>
                </div>
                <div className="bg-purple-primary/10 border border-purple-primary/20 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase font-bold text-purple-primary">Total Articles</p>
                  <h2 className="text-3xl font-bold text-purple-primary mt-2">📝 {stats.totalBlogs || 0}</h2>
                </div>
                <div className="bg-rose-gold/15 border border-rose-gold/30 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase font-bold text-[#8A5A4D]">Total Views</p>
                  <h2 className="text-3xl font-bold text-[#8A5A4D] mt-2">👁️ {stats.totalViews || 0}</h2>
                </div>
                <div className="bg-[#EBF5FC] border border-[#CDE5F7] rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase font-bold text-[#2A6B9C]">Comments Posted</p>
                  <h2 className="text-3xl font-bold text-[#2A6B9C] mt-2">💬 {stats.totalComments || 0}</h2>
                </div>
              </div>

              {/* Recent user list */}
              <div className="glass-card border border-brand-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-poppins font-bold text-brand-text mb-6">
                  👤 Recently Registered Users
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/60 text-brand-muted uppercase font-bold tracking-wider">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30">
                      {recentUsers.map(u => (
                        <tr key={u._id} className="hover:bg-brand-bg/50">
                          <td className="py-3.5 font-semibold text-brand-text">{u.name}</td>
                          <td className="py-3.5 text-brand-muted">{u.email}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              u.role === "admin" ? "bg-purple-primary text-white" : "bg-brand-bg border border-brand-border text-brand-muted"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 text-brand-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS LIST TAB */}
          {activeTab === "users" && (
            <div className="glass-card border border-brand-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-poppins font-bold text-brand-text mb-6">
                👥 Manage User Accounts
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border/60 text-brand-muted uppercase font-bold tracking-wider">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Verified</th>
                      <th className="pb-3">Registration Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-brand-bg/50">
                        <td className="py-3.5 font-semibold text-brand-text">{u.name}</td>
                        <td className="py-3.5 text-brand-muted">{u.email}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            u.role === "admin" ? "bg-purple-primary text-white" : "bg-brand-bg border border-brand-border text-brand-muted"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-brand-muted">{u.isVerified ? "✅ Yes" : "❌ No"}</td>
                        <td className="py-3.5 text-brand-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleRole(u._id, u.role)}
                            className="bg-purple-lilac/30 hover:bg-purple-lilac/50 border border-purple-lilac/60 text-purple-deep px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-[10px]"
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-[#FCEBEA] border border-[#E9C7C5] text-[#7A3633] hover:bg-[#F2DBDA] px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-[10px]"
                          >
                            Delete Account
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BLOGS LIST TAB */}
          {activeTab === "blogs" && (
            <div className="glass-card border border-brand-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-poppins font-bold text-brand-text mb-6">
                📂 Manage Articles
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border/60 text-brand-muted uppercase font-bold tracking-wider">
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Author</th>
                      <th className="pb-3">Views</th>
                      <th className="pb-3">Likes</th>
                      <th className="pb-3">Published Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {blogs.map(b => (
                      <tr key={b._id} className="hover:bg-brand-bg/50">
                        <td className="py-3.5 font-semibold text-brand-text truncate max-w-xs">{b.title}</td>
                        <td className="py-3.5">
                          <span className="bg-purple-lilac/20 border border-purple-lilac/40 text-purple-deep px-2.5 py-0.5 rounded-full text-[9px]">
                            {b.category}
                          </span>
                        </td>
                        <td className="py-3.5 text-brand-muted">{b.author?.name || "Unknown"}</td>
                        <td className="py-3.5 text-brand-muted">{b.views || 0}</td>
                        <td className="py-3.5 text-brand-muted">{b.likes?.length || 0}</td>
                        <td className="py-3.5 text-brand-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteBlog(b._id)}
                            className="bg-[#FCEBEA] border border-[#E9C7C5] text-[#7A3633] hover:bg-[#F2DBDA] px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-[10px]"
                          >
                            Delete Article
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
