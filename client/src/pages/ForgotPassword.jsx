import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Password reset link sent! Check your inbox.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-brand-bg">
      <div className="glass-card max-w-md w-full rounded-3xl p-8 md:p-10 border border-brand-border shadow-md">
        <div className="text-center mb-8">
          <span className="text-3xl">🔑</span>
          <h1 className="text-2xl font-poppins font-bold text-brand-text mt-4">
            Forgot Password
          </h1>
          <p className="text-brand-muted text-sm mt-2">
            No worries! Enter your email and we'll send you a password reset link.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-primary hover:bg-purple-primary/95 text-white font-semibold py-3.5 rounded-full transition shadow-md shadow-purple-primary/20 flex items-center justify-center cursor-pointer text-xs"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-purple-lilac/30 border border-purple-lilac/60 p-4 rounded-xl text-purple-deep text-sm">
              📬 If an account exists for <strong>{email}</strong>, a password reset link has been dispatched. Please check your spam folder if you do not receive it in a few minutes.
            </div>
            <button
              onClick={() => setSent(false)}
              className="text-xs text-purple-primary font-semibold hover:underline"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="text-center mt-8 pt-6 border-t border-brand-border">
          <Link
            to="/login"
            className="text-xs text-purple-primary font-semibold hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
