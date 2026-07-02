import Hero from "../components/Hero";
import BlogCard from "../components/BlogCard";
import Categories from "../components/Categories";
import blogs from "../data/blogs";
import Footer from "../components/Footer";

import "../styles/home.css";

function Home() {
  return (
    <div className="home">
      <Hero />

      <section className="featured-section">
        <h2>Featured Blogs</h2>

        <div className="blog-grid">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              title={blog.title}
              description={blog.description}
            />
          ))}
        </div>
      </section>

      <Categories />
    </div>
  );
}

export default Home;
<Footer />