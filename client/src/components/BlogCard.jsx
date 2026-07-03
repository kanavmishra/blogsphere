import { Link } from "react-router-dom";

function BlogCard({ blog }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

      {/* Blog Image */}
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-56 object-cover"
      />

      {/* Content */}
      <div className="p-6">

        {/* Category */}
        <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
          {blog.category}
        </span>

        {/* Title */}
        <h2 className="text-2xl font-bold mt-4">
          {blog.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mt-3 line-clamp-3">
          {blog.description}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">

          <div>
            <p className="font-semibold">{blog.author}</p>
            <p className="text-sm text-gray-500">5 min read</p>
          </div>

          <Link
            to={`/blog/${blog.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Read More
          </Link>

        </div>

      </div>

    </div>
  );
}

export default BlogCard;