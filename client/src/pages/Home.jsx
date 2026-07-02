import Hero from "../components/Hero";
import BlogCard from "../components/BlogCard";
import Categories from "../components/Categories";
import Footer from "../components/Footer";

import blogs from "../data/blogs";

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
              blog={blog}
            />
          ))}
        </div>
      </section>

      <Categories />

      <Footer />
    </div>
  );
}

export default Home;