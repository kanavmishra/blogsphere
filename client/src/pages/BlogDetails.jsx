import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { toast } from "react-toastify";
import SEO from "../components/SEO";

function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [blog, setBlog] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchBlog = async () => {
    try {
      // Fetch Blog
      const blogRes = await API.get(`/blogs/${id}`);
      setBlog(blogRes.data);
      setLikesCount(blogRes.data.likes?.length || 0);
      setBookmarkCount(blogRes.data.bookmarks?.length || 0);

      // Check if current user has liked
      if (user && blogRes.data.likes) {
        const hasBookmarked = blogRes.data.bookmarks.some(
    (bookmarkId) => bookmarkId.toString() === user._id
  );
        const hasLiked = blogRes.data.likes.some(
          (likeId) => likeId.toString() === user._id
        );
        setLiked(hasLiked);
      }

      // Fetch Comments
      const commentRes = await API.get(`/comments/${id}`);
      setComments(commentRes.data.comments || []);
    } catch (error) {
      console.error("Error loading blog details:", error);
    } finally {
      setLoading(false);
    }
  };
  const getReadingTime = (text) => {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const extractHeaders = (text) => {
    if (!text) return [];
    const lines = text.split("\n");
    const headers = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{2,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const title = match[2].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        headers.push({ level, title, id });
      }
    });
    return headers;
  };

  const renderFormattedContent = (content) => {
    if (!content) return "";
    const lines = content.split("\n");
    return lines.map((line, index) => {
      const headerMatch = line.match(/^(#{2,4})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (level === 2) {
          return <h2 key={index} id={id} className="text-2xl font-poppins font-bold text-brand-text mt-8 mb-4 pt-4">{title}</h2>;
        } else if (level === 3) {
          return <h3 key={index} id={id} className="text-xl font-poppins font-bold text-brand-text mt-6 mb-3 pt-3">{title}</h3>;
        } else {
          return <h4 key={index} id={id} className="text-lg font-poppins font-bold text-brand-text mt-4 mb-2 pt-2">{title}</h4>;
        }
      }
      if (line.startsWith("- ")) {
        return <li key={index} className="ml-6 list-disc text-brand-text mt-1">{line.substring(2)}</li>;
      }
      if (line.trim() === "") {
        return <div key={index} className="h-4"></div>;
      }
      return <p key={index} className="text-brand-text mb-2 leading-relaxed text-sm md:text-base">{line}</p>;
    });
  };

  const headers = blog ? extractHeaders(blog.content) : [];
  const readingTime = blog ? getReadingTime(blog.content) : 0;
  const handleLike = async () => {
    if (!token) {
      toast.warning("Please sign in to like this article!");
      navigate("/login");
      return;
    }

    try {
      const res = await API.put(`/blogs/${id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Like action failed");
    }
  };

  const handleBookmark = async () => {
  if (!token) {
    toast.warning("Please sign in to bookmark blogs!");
    navigate("/login");
    return;
  }

  try {
    const res = await API.put(`/blogs/${id}/bookmark`);

    setBookmarked(res.data.bookmarked);
    setBookmarkCount(res.data.bookmarks);

    toast.success(res.data.message);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Bookmark failed"
    );
  }
};

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!token) {
      toast.warning("Please sign in to join the conversation!");
      navigate("/login");
      return;
    }

    try {
      await API.post(`/comments/${id}`, { text: commentText });
      setCommentText("");
      toast.success("Comment posted!");
      
      // Reload comments
      const commentRes = await API.get(`/comments/${id}`);
      setComments(commentRes.data.comments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post comment");
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await API.put(`/comments/${commentId}`, {
        text: editText,
      });

      toast.success("Comment updated!");

      setEditingComment(null);
      setEditText("");

      const commentRes = await API.get(`/comments/${id}`);
      setComments(commentRes.data.comments);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update comment"
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await API.delete(`/comments/${commentId}`);
      toast.success("Comment deleted successfully!");
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleReply = async (parentCommentId) => {
  if (!replyText.trim()) return;

  try {
    await API.post(`/comments/${id}`, {
      text: replyText,
      parentComment: parentCommentId,
    });

    toast.success("Reply posted!");

    setReplyText("");
    setReplyingTo(null);

    const commentRes = await API.get(`/comments/${id}`);
    setComments(commentRes.data.comments);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to post reply"
    );
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-bg text-center px-6">
        <span className="text-6xl mb-6">🔍</span>
        <h1 className="text-4xl font-poppins font-bold text-brand-text">Article Not Found</h1>
        <p className="text-brand-muted mt-2 max-w-sm">The article you are looking for does not exist or has been removed.</p>
        <Link to="/" className="mt-8 bg-purple-primary hover:bg-purple-primary/90 text-white px-6 py-3 rounded-full font-semibold transition glow-button-purple">
          Back to Home
        </Link>
      </div>
    );
  }

  const fallbackImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&auto=format&fit=crop&q=80";
  const coverImage = blog.image && blog.image.startsWith("http") ? blog.image : fallbackImage;

  return (
    <div className="bg-brand-bg min-h-screen pb-24">
      <SEO
        title={blog.title}
        description={blog.content?.substring(0, 150) + "..."}
        keywords={`${blog.category}, tech, article, tutorials, developers`}
      />
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-purple-primary via-rose-gold to-purple-lilac z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Cover Banner */}
      <div className="relative h-[420px] w-full overflow-hidden bg-purple-deep/10 border-b border-brand-border">
        <img
          src={coverImage}
          alt={blog.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent"></div>
      </div>

      {/* Article Container */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 animate-reveal grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sticky Table of Contents on Desktop */}
        {headers.length > 0 && (
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 glass-card p-6 rounded-2xl border border-brand-border bg-brand-card/75 backdrop-blur-sm max-h-[85vh] overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-deep mb-4 border-b border-brand-border pb-2">
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {headers.map((header) => (
                  <a
                    key={header.id}
                    href={`#${header.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(header.id);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`block text-[11px] text-brand-muted hover:text-purple-primary transition-colors leading-relaxed ${
                      header.level === 3 ? "pl-3 border-l border-brand-border/40" : "font-semibold"
                    }`}
                  >
                    {header.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <article className={`lg:col-span-${headers.length > 0 ? "9" : "12"} max-w-4xl w-full mx-auto`}>
          <div className="glass-card rounded-3xl p-6 md:p-10 md:px-16 shadow-lg shadow-purple-primary/5">
            {/* Tag / Reading Time */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3.5 py-1.5 bg-purple-lilac/30 text-purple-deep border border-purple-lilac/60 text-xs font-semibold rounded-full uppercase tracking-wider">
                {blog.category}
              </span>
              <span className="inline-block px-3 py-1.5 bg-brand-bg text-brand-muted border border-brand-border text-xs rounded-full">
                ⏱️ {readingTime} min read
              </span>
            </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-poppins font-black tracking-tight text-brand-text mt-6 leading-tight">
            {blog.title}
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pb-8 border-b border-brand-border">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-primary to-rose-gold flex items-center justify-center font-bold text-white">
                {blog.author?.name ? blog.author.name[0].toUpperCase() : "U"}
              </div>

              <div>
                <Link
                  to={`/profile/${blog.author?._id}`}
                  className="text-xs font-semibold text-brand-text hover:text-purple-primary transition"
                >
                  {blog.author?.name || "Unknown Author"}
                </Link>

                <p className="text-xs text-brand-muted mt-1">
                  Published on{" "}
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Right */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border transition duration-300 ${
                liked
                  ? "bg-[#FCEBEA] border-[#E9C7C5] text-[#7A3633]"
                  : "bg-brand-bg border-brand-border text-brand-muted hover:text-purple-primary hover:border-purple-primary/30"
              }`}
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span>{likesCount} Likes</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {/* Views */}
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-lilac/25 border border-purple-lilac/55 text-purple-deep text-sm">
              👁️ {blog.views || 0} Views
            </div>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition ${
                bookmarked
                  ? "bg-purple-primary/10 border-purple-primary/30 text-purple-primary"
                  : "bg-brand-bg border-brand-border text-brand-muted hover:text-purple-primary hover:border-purple-primary/30"
              }`}
            >
              {bookmarked ? "🔖" : "📑"}
              {bookmarkCount} Saved
            </button>

            {/* Comments */}
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-gold/15 border border-rose-gold/45 text-[#8A5A4D] text-sm">
              💬 {comments.length} Comments
            </div>
          </div>

          {/* Article Text Content */}
          <div className="mt-10 text-brand-text font-serif text-base md:text-lg leading-relaxed space-y-4">
            {renderFormattedContent(blog.content)}
          </div>
        </div>

        </article>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Navigation Return Button */}
        <div className="mt-8">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-purple-primary transition">
            <span>←</span> Back to blogs feed
          </Link>
        </div>
      </div>

        {/* Comments Section */}
        <section className="mt-16 glass-card rounded-3xl p-6 md:p-10">
          <h2 className="text-2xl font-poppins font-bold text-brand-text flex items-center gap-2 mb-8">
            <span>💬</span> Comments ({comments.length})
          </h2>

          <form onSubmit={handleComment} className="space-y-4 mb-10">
            <textarea
              rows="4"
              placeholder="What are your thoughts on this? Join the conversation..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-purple-primary hover:bg-purple-primary/90 text-white text-xs font-semibold px-6 py-3 rounded-full transition shadow-md hover:shadow-lg glow-button-purple cursor-pointer"
            >
              Post Comment
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-brand-muted text-sm text-center py-6">
                No comments posted yet. Be the first to share!
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c._id}
                  className="bg-brand-card/50 border border-brand-border rounded-2xl p-5 flex gap-4 items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-lilac/35 flex items-center justify-center font-bold text-purple-deep text-xs flex-shrink-0">
                    {c.author?.name ? c.author.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-brand-text">{c.author?.name || "Anonymous"}</h4>
                        <span className="text-[10px] text-brand-muted/70">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Delete comment action */}
                      {user && c.author?._id === user._id && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-[10px] text-brand-muted hover:text-rose-650 font-semibold transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {editingComment === c._id ? (
  <>
    <textarea
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      className="w-full mt-2 p-2 rounded-lg border bg-brand-bg"
    />

    <div className="flex gap-2 mt-2">
      <button
        onClick={() => handleEditComment(c._id)}
        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
      >
        Save
      </button>

      <button
        onClick={() => {
          setEditingComment(null);
          setEditText("");
        }}
        className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
      >
        Cancel
      </button>
    </div>
  </>
) : (
  <p className="mt-2 text-xs md:text-sm text-brand-muted leading-relaxed font-sans">
    {c.text}
  </p>
)}

<div className="mt-3">
  <button
    onClick={() =>
      setReplyingTo(replyingTo === c._id ? null : c._id)
    }
    className="text-xs font-semibold text-purple-primary hover:underline"
  >
    Reply
  </button>
</div>

{replyingTo === c._id && (
  <div className="mt-3">
    <textarea
      rows="2"
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      placeholder="Write a reply..."
      className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-sm"
    />

    <button
      onClick={() => handleReply(c._id)}
      className="mt-2 bg-purple-primary text-white px-4 py-2 rounded-lg text-xs"
    >
      Post Reply
    </button>
  </div>
)}
{c.replies?.length > 0 && (
  <div className="ml-10 mt-4 space-y-3 border-l-2 border-brand-border pl-4">
    {c.replies.map((reply) => (
      <div
        key={reply._id}
        className="bg-brand-bg rounded-xl p-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-lilac/35 flex items-center justify-center text-xs font-bold">
            {reply.author?.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <p className="text-xs font-bold">
              {reply.author?.name}
            </p>

            <p className="text-[10px] text-brand-muted">
              {new Date(reply.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p className="mt-2 text-sm">
          {reply.text}
        </p>
      </div>
    ))}
  </div>
)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    );
  }

  export default BlogDetails;