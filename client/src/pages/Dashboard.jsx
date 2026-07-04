import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
  try {
    const res = await API.get("/blogs/myblogs");
    setBlogs(res.data.blogs);
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this blog?"
  );

  if (!confirmDelete) return;

  try {
    await API.delete(`/blogs/${id}`);

    alert("Blog deleted successfully!");

    fetchMyBlogs();
  } catch (error) {
    alert(error.response?.data?.message || "Delete failed");
  }
};

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">
            Welcome, {user?.name} 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your blogs here.
          </p>
        </div>

        <Link
          to="/create-blog"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + New Blog
        </Link>
      </div>

      {/* My Blogs */}
      <h2 className="text-2xl font-bold mb-6">
        My Blogs
      </h2>

      {blogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <h3 className="text-2xl font-semibold">
            No blogs yet
          </h3>

          <p className="text-gray-500 mt-2">
            Click "New Blog" to publish your first article.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white shadow-md rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">
                  {blog.title}
                </h3>

                <p className="text-gray-500">
                  {blog.category}
                </p>
              </div>

              <div className="flex gap-3">

                <Link
                  to={`/blog/${blog._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View
                </Link>

                <Link
  to={`/edit-blog/${blog._id}`}
  className="bg-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500"
>
  Edit
</Link>

                <button
  onClick={() => handleDelete(blog._id)}
  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
>
  Delete
</button>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Dashboard;