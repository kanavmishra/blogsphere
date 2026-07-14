import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import RichTextEditor from "../components/RichTextEditor";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [aiTitles, setAiTitles] = useState([]);

  useEffect(() => {
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/${id}`);
      setFormData({
        title: res.data.title || "",
        category: res.data.category || "",
        image: res.data.image || "",
        content: res.data.content || "",
      });
      setIsDraft(res.data.status === "draft");
    } catch (error) {
      toast.error("Failed to load blog post details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
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
    setUpdating(true);

    try {
      await API.put(`/blogs/${id}`, {
        ...formData,
        status: isDraft ? "draft" : "published",
      });
      toast.success(isDraft ? "Draft saved successfully! 💾" : "Blog updated & published! 🚀");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-reveal">
      <div className="glass-card rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-brand-border">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-brand-text">
              Edit Article ✏️
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              Update details, refresh cover images, and refine content.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-purple-deep bg-purple-lilac/30 px-3.5 py-1.5 rounded-full border border-purple-lilac/60">
              ⚡ Powered by Gemini AI
            </span>
          </div>
        </div>

        {/* AI Suggested Titles Picker */}
        {aiTitles.length > 0 && (
          <div className="mb-8 p-5 bg-purple-lilac/10 border border-purple-lilac/50 rounded-2xl animate-reveal">
            <h3 className="text-sm font-bold text-purple-deep mb-3 flex items-center gap-1.5">
              💡 Choose an AI Suggested Title:
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {aiTitles.map((titleText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, title: titleText });
                    setAiTitles([]);
                    toast.success("Applied AI Suggested Title!");
                  }}
                  className="bg-brand-card hover:bg-purple-lilac/20 border border-brand-border hover:border-purple-lilac text-left px-4 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-brand-text max-w-full truncate"
                >
                  {titleText}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAiTitles([])}
                className="text-[10px] font-bold uppercase tracking-wider text-brand-muted hover:text-brand-text px-3 py-2"
              >
                Clear Suggestions
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Article Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Technology, Programming..."
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Image URL & Preview */}
          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                name="image"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image}
                onChange={handleChange}
                className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Live Image Box preview */}
            <div className="bg-brand-bg border border-brand-border rounded-xl h-[50px] flex items-center justify-center overflow-hidden">
              {formData.image && formData.image.startsWith("http") ? (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="text-[10px] text-brand-muted/70 font-medium">Image Preview</span>
              )}
            </div>
          </div>

          {/* Content Field / Preview */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Content Body
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleChange}
              placeholder="Refine your article content..."
              onTitleSuggest={(suggestionText) => {
                const titles = suggestionText
                  .split("\n")
                  .map((t) => t.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim())
                  .filter((t) => t.length > 0);
                setAiTitles(titles);
              }}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-brand-border">
            <button
              type="submit"
              disabled={updating}
              className="bg-purple-primary hover:bg-purple-primary/90 text-white font-semibold px-8 py-3.5 rounded-full transition duration-300 shadow-md shadow-purple-primary/20 hover:shadow-purple-primary/35 flex items-center gap-2 cursor-pointer glow-button-purple"
            >
              {updating ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Update Article 🚀"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="border border-brand-border bg-brand-bg hover:bg-brand-border/40 text-brand-muted px-6 py-3.5 rounded-full font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlog;