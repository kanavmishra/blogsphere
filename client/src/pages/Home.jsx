import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import BlogCard from "../components/BlogCard";
import API from "../services/api";
import { toast } from "react-toastify";

function Home() {
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Technology", "Programming", "AI", "Cybersecurity", "Web Development", "Lifestyle"];

  useEffect(() => {
  const delay = setTimeout(() => {
    fetchBlogs(search);
  }, 400);

  return () => clearTimeout(delay);
}, [search]);

  const fetchBlogs = async (searchTerm = "") => {
  try {
    setLoading(true);

    const res = await API.get("/blogs", {
      params: {
        search: searchTerm,
      },
    });

    console.log("Blogs from backend:", res.data.blogs);
    setBlogs(res.data.blogs || []);
  } catch (error) {
    console.error("Error fetching blogs:", error);
  } finally {
    setLoading(false);
  }
};

  const filteredBlogs = blogs.filter((blog) => {
  return (
    selectedCategory === "All" ||
    blog.category?.toLowerCase() === selectedCategory.toLowerCase()
  );
});

  return (
    <div className="bg-brand-bg min-h-screen">
      <Hero />

      <section className="max-w-7xl mx-auto px-6 py-16 animate-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main content column (3/4 width on large screens) */}
          <div className="lg:col-span-3">
            {/* Filter Controls Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-poppins font-bold text-brand-text tracking-tight">
                  Featured Articles
                </h2>
                <p className="text-brand-muted text-sm mt-1">
                  Explore the latest insights from our dev community.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-brand-card text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-full px-5 py-2.5 w-72 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-3.5 text-brand-muted hover:text-brand-text text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 -mx-6 px-6 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                    selectedCategory === cat
                      ? "bg-purple-primary text-white border-purple-primary shadow-sm"
                      : "bg-brand-card text-brand-muted border-brand-border hover:bg-purple-lilac/30 hover:text-brand-text"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Blog Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse glass-card rounded-2xl border border-brand-border p-6 h-96 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="bg-purple-lilac/20 h-44 rounded-xl"></div>
                      <div className="bg-purple-lilac/20 h-6 w-3/4 rounded"></div>
                      <div className="bg-purple-lilac/20 h-4 w-5/6 rounded"></div>
                    </div>
                    <div className="bg-purple-lilac/20 h-8 w-1/3 rounded-full mt-4"></div>
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
              <div className="text-center py-20 bg-brand-card/40 rounded-2xl border border-brand-border border-dashed p-6">
                <span className="text-4xl">🔍</span>
                <h3 className="text-xl font-poppins font-bold mt-4 text-brand-text">No Articles Found</h3>
                <p className="text-brand-muted text-sm mt-2 max-w-md mx-auto">
                  We couldn't find any articles matching your filters. Try selecting another category or refining your search.
                </p>
                {(search || selectedCategory !== "All") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("All");
                    }}
                    className="mt-6 bg-purple-lilac/30 hover:bg-purple-lilac/50 border border-brand-border text-purple-deep text-xs font-semibold px-5 py-2.5 rounded-full transition cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column (1/4 width on large screens) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Newsletter Card */}
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

            {/* Trending Articles Card */}
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
                      onClick={() => setSearch(item.title)}
                      className="text-xs font-semibold text-brand-text mt-1 hover:text-purple-primary cursor-pointer transition"
                    >
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-brand-muted mt-1">{item.reads}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Categories pills */}
            <div className="glass-card rounded-2xl p-6 border border-brand-border shadow-sm">
              <h3 className="text-lg font-poppins font-bold text-brand-text mb-4">
                🏷️ Popular tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {["React", "Node.js", "AI", "Vite", "UX/UI", "Glassmorphic", "Next.js", "Tailwind"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-brand-bg text-brand-muted border border-brand-border rounded-full text-[10px] font-semibold hover:text-purple-primary hover:border-purple-primary cursor-pointer transition"
                    onClick={() => {
                      setSearch(tag);
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;