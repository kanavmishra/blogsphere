import { Link } from "react-router-dom";
import "../styles/blogcard.css";

function BlogCard({ blog }) {
  return (
    <div className="blog-card">

      <img
        src={blog.image}
        alt={blog.title}
        className="blog-image"
      />

      <span className="category">
        {blog.category}
      </span>

      <h3>{blog.title}</h3>

      <p>{blog.description}</p>

      <small>
        👤 {blog.author}
      </small>

      <br />

      <small>
        📅 {blog.date}
      </small>

      <Link to={`/blog/${blog.id}`}>
        <button>Read More →</button>
      </Link>

    </div>
  );
}

export default BlogCard;