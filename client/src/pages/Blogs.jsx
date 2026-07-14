import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BlogCard from "../components/BlogCard";
import API from "../services/api";
import { toast } from "react-toastify";

function Blogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [minViews, setMinViews] = useState(0);

  const search = searchParams.get("search") || "";
  const categories = ["All", "Technology", "Programming", "AI", "Cybersecurity", "Web Development", "Lifestyle"];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ search: value });
    } else {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
  };

  const filteredBlogs = blogs
    .filter((blog) => {
      const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.content.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" ||
        blog.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesViews = (blog.views || 0) >= minViews;
      return matchesSearch && matchesCategory && matchesViews;
    })
    .sort((a, b) => {
      if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === "likes") {
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="bg-brand-bg min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto animate-reveal">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-poppins font-black tracking-tight bg-gradient-to-r from-purple-primary via-rose-gold to-[#B89CFF] bg-clip-text text-transparent mb-4">
            The Knowledge Feed
          </h1>
          <p className="text-brand-muted text-sm md:text-base leading-relaxed font-sans">
            Browse our full library of tech insights, tutorials, and discussions created by developers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main content grid */}
          <div className="lg:col-span-3">
            {/* Filters Panel */}
            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 mb-12 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                        selectedCategory === cat
                          ? "bg-purple-primary text-white border-purple-primary shadow-sm"
                          : "bg-brand-bg text-brand-muted border-brand-border hover:bg-purple-lilac/30 hover:text-brand-text"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search bar */}
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search all blogs..."
                    value={search}
                    onChange={handleSearchChange}
                    className="bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-full px-5 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                  />
                  {search && (
                    <button
                      onClick={() => {
                        searchParams.delete("search");
                        setSearchParams(searchParams);
                      }}
                      className="absolute right-4 top-3 text-brand-muted hover:text-brand-text text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Filters Sub-row */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-brand-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-brand-muted uppercase tracking-wider text-[10px]">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-primary"
                  >
                    <option value="date">📅 Newest First</option>
                    <option value="views">👁️ Most Viewed</option>
                    <option value="likes">❤️ Most Liked</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <span className="font-semibold text-brand-muted uppercase tracking-wider text-[10px] whitespace-nowrap">Min Views: {minViews}</span>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={minViews}
                    onChange={(e) => setMinViews(parseInt(e.target.value))}
                    className="flex-1 accent-purple-primary h-1 bg-brand-bg rounded-lg cursor-pointer"
                  />
                  {minViews > 0 && (
                    <button
                      onClick={() => setMinViews(0)}
                      className="text-purple-primary hover:underline font-bold text-[10px]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Feed List Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse glass-card border border-brand-border rounded-2xl p-6 h-96 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="bg-[#EAE4DA] h-44 rounded-xl"></div>
                      <div className="bg-[#EAE4DA] h-6 w-3/4 rounded"></div>
                      <div className="bg-[#EAE4DA] h-4 w-5/6 rounded"></div>
                    </div>
                    <div className="bg-[#EAE4DA] h-8 w-1/3 rounded-full mt-4"></div>
                  </div>
                ))}
              </div>
            ) : filteredBlogs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-brand-card/40 rounded-2xl border border-brand-border border-dashed max-w-2xl mx-auto p-6">
                <span className="text-4xl">📚</span>
                <h3 className="text-xl font-poppins font-bold mt-4 text-brand-text">No Articles Found</h3>
                <p className="text-brand-muted text-sm mt-2">
                  We couldn't find any articles matching your search query or selected category.
                </p>
                {(search || selectedCategory !== "All") && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      searchParams.delete("search");
                      setSearchParams(searchParams);
                    }}
                    className="mt-6 bg-purple-lilac/30 hover:bg-purple-lilac/50 border border-brand-border text-purple-deep text-xs font-semibold px-5 py-2.5 rounded-full transition cursor-pointer"
                  >
                    Reset Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Newsletter card */}
            <div className="glass-card rounded-2xl p-6 border border-brand-border shadow-sm">
              <h3 className="text-lg font-poppins font-bold text-brand-text mb-2">
                📬 Tech Insights newsletter
              </h3>
              <p className="text-brand-muted text-xs mb-4 leading-relaxed">
                Stay updated with the latest in AI, frontend engineering, and futuristic UI design. Delivered weekly.
              </p>
              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success("Subscribed successfully!");
                e.target.reset();
              }} className="space-y-3">
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-purple-primary text-white text-xs font-semibold py-2.5 rounded-xl transition duration-300 shadow-md hover:shadow-lg hover:bg-purple-primary/90 glow-button-purple cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* trending tags */}
            <div className="glass-card rounded-2xl p-6 border border-brand-border shadow-sm">
              <h3 className="text-lg font-poppins font-bold text-brand-text mb-4">
                🔥 Trending Topics
              </h3>
              <div className="space-y-4">
                {[
                  { id: 1, title: "Building Futurized Glassmorphism UIs in React", category: "Web Design", reads: "1.2k reads" },
                  { id: 2, title: "MERN Stack State management best practices", category: "Programming", reads: "980 reads" },
                  { id: 3, title: "The rise of Agentic AI workflows in 2026", category: "AI", reads: "850 reads" }
                ].map((item) => (
                  <div key={item.id} className="pb-3 border-b border-brand-border/60 last:border-b-0">
                    <span className="text-[9px] uppercase font-bold text-rose-gold tracking-wide">{item.category}</span>
                    <h4
                      onClick={() => {
                        searchParams.set("search", item.title);
                        setSearchParams(searchParams);
                      }}
                      className="text-xs font-semibold text-brand-text mt-1 hover:text-purple-primary cursor-pointer transition"
                    >
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-brand-muted mt-1">{item.reads}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blogs;