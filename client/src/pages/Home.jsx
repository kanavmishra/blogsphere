import { useState } from "react";
import Hero from "../components/Hero";
import BlogCard from "../components/BlogCard";
import blogs from "../data/blogs";

function Home() {
  const [search, setSearch] = useState("");

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Hero />

      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">
            Featured Blogs
          </h2>

          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No blogs found.
          </p>
        )}

      </section>
    </>
  );
}

export default Home;