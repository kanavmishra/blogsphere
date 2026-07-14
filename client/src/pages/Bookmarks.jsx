import { useEffect, useState } from "react";
import API from "../services/api";
import BlogCard from "../components/BlogCard";

function Bookmarks() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await API.get("/blogs/bookmarks/my");
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-text">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6 py-16 animate-reveal">
        <h1 className="text-4xl font-poppins font-black text-brand-text">
          📑 My Bookmarks
        </h1>

        <p className="text-brand-muted mt-2 font-medium">
          {blogs.length} saved article{blogs.length !== 1 ? "s" : ""}
        </p>

        {blogs.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl border border-brand-border border-dashed p-6 mt-10">
            <h2 className="text-2xl font-poppins font-bold text-brand-text">
              No bookmarks yet
            </h2>

            <p className="text-brand-muted/70 mt-2">
              Save your favourite blogs and they'll appear here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookmarks;