import { Link } from "react-router-dom";

const myBlogs = [
  {
    id: 1,
    title: "Getting Started with React",
    category: "React",
  },
  {
    id: 2,
    title: "Cybersecurity Basics",
    category: "Cybersecurity",
  },
  {
    id: 3,
    title: "JavaScript ES6 Features",
    category: "JavaScript",
  },
];

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">
            Welcome, Kanav 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your blogs here.
          </p>
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          + New Blog
        </button>
      </div>

      {/* My Blogs */}
      <h2 className="text-2xl font-bold mb-6">
        My Blogs
      </h2>

      <div className="space-y-4">
        {myBlogs.map((blog) => (
          <div
            key={blog.id}
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
              <button className="bg-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500">
                Edit
              </button>

              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Delete
              </button>

              <Link
                to={`/blog/${blog.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;