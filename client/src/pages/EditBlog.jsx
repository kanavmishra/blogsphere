import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image: "",
    content: "",
  });

  useEffect(() => {
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/${id}`);

      setFormData({
        title: res.data.title,
        category: res.data.category,
        image: res.data.image,
        content: res.data.content,
      });
    } catch (error) {
      alert("Failed to load blog");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/blogs/${id}`, formData);

      alert("Blog updated successfully!");

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-2">
          Edit Blog ✏️
        </h1>

        <p className="text-gray-500 mb-8">
          Update your article.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full border rounded-lg px-4 py-3"
          />

          <textarea
            rows="10"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Content"
            className="w-full border rounded-lg px-4 py-3"
            required
          ></textarea>

          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
          >
            Update Blog
          </button>

        </form>

      </div>
    </div>
  );
}

export default EditBlog;