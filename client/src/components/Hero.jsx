import "../styles/hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Share Your Stories with the World 🌍</h1>

        <p>
          Read amazing blogs, discover new ideas, and share your own
          experiences.
        </p>

        <div className="hero-buttons">
          <button
            className="primary-btn"
            onClick={() => alert("Blogs page coming soon!")}
          >
            Start Reading
          </button>

          <button
            className="secondary-btn"
            onClick={() => alert("Login first to write a blog!")}
          >
            Write a Blog
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;