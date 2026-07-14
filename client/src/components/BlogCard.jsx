import { Link } from "react-router-dom";

function BlogCard({ blog }) {

  console.log("BLOG:", blog);
  console.log("IMAGE:", blog.image);
  // Safe default image fallback
  const fallbackImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60";
  const blogImage = blog.image && blog.image.startsWith("http") ? blog.image : fallbackImage;

  // Custom formatted date
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  // Category styling color mappings
  const getCategoryColor = (cat) => {
    const category = cat?.toLowerCase() || "";
    if (category.includes("tech") || category.includes("react") || category.includes("js") || category.includes("web")) {
      return "bg-purple-lilac/30 text-purple-deep border-purple-lilac/60";
    }
    if (category.includes("ai") || category.includes("programming")) {
      return "bg-purple-primary/10 text-purple-primary border-purple-primary/20";
    }
    return "bg-rose-gold/15 text-[#8A5A4D] border-rose-gold/30";
  };

  return (
    <div className="group flex flex-col justify-between glass rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-primary/10 hover:border-purple-primary/40 hover:-translate-y-1.5 transition-all duration-500">
      <div>
        {/* Blog Image */}
        <div className="relative overflow-hidden aspect-video bg-purple-deep/10">
          <img
            src={blogImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card/40 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category Tag */}
          <span className={`inline-block border text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${getCategoryColor(blog.category)}`}>
            {blog.category || "General"}
          </span>

          {/* Title */}
          <h3 className="text-xl font-poppins font-bold mt-4 text-brand-text group-hover:text-purple-primary line-clamp-2 transition-colors duration-300">
            <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
          </h3>

          {/* Content Preview */}
          <p className="text-brand-muted text-sm mt-3 line-clamp-3 leading-relaxed">
            {blog.content}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-4 border-t border-brand-border flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-primary to-rose-gold flex items-center justify-center font-bold text-white text-xs">
            {blog.author?.name ? blog.author.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <Link
              to={`/profile/${blog.author?._id}`}
              className="text-xs font-semibold text-brand-text hover:text-purple-primary transition"
            >
              {blog.author?.name || "Unknown Author"}
            </Link>
            <p className="text-[10px] text-brand-muted/70 font-medium">
              {formattedDate} • 5 min read
            </p>
          </div>
        </div>

        <Link
          to={`/blog/${blog._id}`}
          className="text-xs font-bold text-purple-primary hover:text-purple-deep flex items-center gap-1 transition"
        >
          Read Article <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}

export default BlogCard;