import { useParams, Link } from "react-router-dom";
import blogs from "../data/blogs";

function BlogDetails() {
  const { id } = useParams();

  const blog = blogs.find((b) => b.id === Number(id));

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold text-red-500">
          Blog Not Found
        </h1>

        <Link
          to="/blogs"
          className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Cover Image */}
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-[450px] object-cover rounded-2xl shadow-lg"
      />

      {/* Title */}
      <h1 className="text-5xl font-bold mt-10">
        {blog.title}
      </h1>

      {/* Meta */}
      <div className="flex gap-6 mt-5 text-gray-600">
        <span>✍️ {blog.author}</span>
        <span>🏷️ {blog.category}</span>
        <span>⏱️ 5 min read</span>
      </div>

      <hr className="my-8" />

      {/* Content */}
      <div className="space-y-6 text-lg leading-8 text-gray-700">

        <p className="whitespace-pre-line">
  {blog.content}
</p>
        <p>
          React makes it simple to build modern and interactive web
          applications using reusable components.
        </p>

        <p>
          This article demonstrates how developers structure projects,
          manage state, and create responsive user interfaces using
          modern tools like React, Tailwind CSS and Vite.
        </p>

        <p>
          As BlogSphere grows, this content will come directly from
          MongoDB instead of hardcoded data.
        </p>

      </div>

      {/* Back Button */}
      <Link
        to="/blogs"
        className="inline-block mt-10 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        ← Back to Blogs
      </Link>

    </div>
  );
}

export default BlogDetails;