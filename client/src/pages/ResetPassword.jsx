import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset successfully! Log in with your new password.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-brand-bg">
      <div className="glass-card max-w-md w-full rounded-3xl p-8 md:p-10 border border-brand-border shadow-md">
        <div className="text-center mb-8">
          <span className="text-3xl">🛡️</span>
          <h1 className="text-2xl font-poppins font-bold text-brand-text mt-4">
            Reset Password
          </h1>
          <p className="text-brand-muted text-sm mt-2">
            Please enter and confirm your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              "Save New Password"
            )}
          </button>
        </form>

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

export default ResetPassword;
