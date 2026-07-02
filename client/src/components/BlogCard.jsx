import "../styles/blogcard.css";

function BlogCard({ title, description }) {
  return (
    <div className="blog-card">
      <div className="blog-image"></div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button>Read More</button>
    </div>
  );
}

export default BlogCard;