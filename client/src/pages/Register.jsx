import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success(res.data.message || "Registration successful! Please login.");
      
      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-brand-bg px-6 relative py-12 font-sans overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-purple-primary/20 rounded-full blur-3xl z-0 pointer-events-none animate-float-1"></div>
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-rose-gold/15 rounded-full blur-3xl z-0 pointer-events-none animate-float-2"></div>

      <div className="glass-card shadow-lg shadow-purple-primary/5 rounded-3xl p-8 w-full max-w-md relative z-10 animate-reveal">
        <h1 className="text-3xl font-poppins font-black text-center mb-2 bg-gradient-to-r from-purple-primary to-rose-gold bg-clip-text text-transparent">
          Create Account 🚀
        </h1>

        <p className="text-brand-muted text-sm text-center mb-8">
          Join BlogSphere and share your insights.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@domain.com"
              className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-primary hover:bg-purple-primary/95 text-white font-semibold py-3.5 rounded-xl transition duration-300 shadow-md shadow-purple-primary/20 focus:outline-none focus:ring-2 focus:ring-purple-primary flex items-center justify-center gap-2 cursor-pointer glow-button-purple"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Get Started"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-brand-muted mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;