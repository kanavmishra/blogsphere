import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import RichTextEditor from "../components/RichTextEditor";

function CreateBlog() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
  title: "",
  category: "",
  content: "",
});

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [aiTitles, setAiTitles] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setImage(file);
  setPreview(URL.createObjectURL(file));
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let imageUrl = "";

    if (image) {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "ml_default");

      const res = await fetch(
  "https://api.cloudinary.com/v1_1/mmg4sqnw/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

     const cloudData = await res.json();

if (!cloudData.secure_url) {
  toast.error("Image upload failed");
  return;
}

imageUrl = cloudData.secure_url;
    }

    await API.post("/blogs", {
      ...formData,
      image: imageUrl,
      status: isDraft ? "draft" : "published",
    });

    toast.success(isDraft ? "Draft saved successfully! 💾" : "Blog published! 🚀");
    navigate("/dashboard");
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-reveal">
      <div className="glass-card rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-brand-border">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-brand-text">
              Create New Article ✍️
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              Draft your post, add tags, and share your ideas with developers.
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
                placeholder="Enter blog title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Category / Tag
              </label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Technology, AI, React..."
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Cover Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-brand-bg text-brand-muted border border-brand-border rounded-xl px-4 py-3"
              />
            </div>

            <div className="bg-brand-bg border border-brand-border rounded-xl h-36 overflow-hidden flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-brand-muted/70 text-xs">
                  No Image Selected
                </span>
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
              placeholder="Start drafting your masterwork..."
              onTitleSuggest={(suggestionText) => {
                // Split suggestions into lines, filter out numbers/bullets if any
                const titles = suggestionText
                  .split("\n")
                  .map((t) => t.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim())
                  .filter((t) => t.length > 0);
                setAiTitles(titles);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-brand-border">
            <button
              type="submit"
              onClick={() => setIsDraft(false)}
              disabled={loading}
              className="bg-purple-primary hover:bg-purple-primary/90 text-white font-semibold px-8 py-3.5 rounded-full transition duration-300 shadow-md shadow-purple-primary/20 hover:shadow-purple-primary/35 flex items-center gap-2 cursor-pointer glow-button-purple text-xs"
            >
              {loading && !isDraft ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Publish Article 🚀"
              )}
            </button>
            <button
              type="submit"
              onClick={() => setIsDraft(true)}
              disabled={loading}
              className="bg-purple-lilac/30 hover:bg-purple-lilac/50 border border-purple-lilac/60 text-purple-deep px-6 py-3.5 rounded-full font-semibold transition cursor-pointer text-xs"
            >
              {loading && isDraft ? (
                <span className="w-5 h-5 border-2 border-purple-deep/30 border-t-purple-deep rounded-full animate-spin"></span>
              ) : (
                "Save as Draft 💾"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="border border-brand-border bg-brand-bg hover:bg-brand-border/40 text-brand-muted px-6 py-3.5 rounded-full font-semibold transition text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlog;