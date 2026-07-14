import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../services/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("Please wait while we verify your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token was found in the URL.");
      return;
    }

    const verify = async () => {
      try {
        const res = await API.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully! You now have full access.");
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. The link may have expired.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-brand-bg">
      <div className="glass-card max-w-md w-full rounded-3xl p-8 md:p-10 border border-brand-border shadow-md text-center">
        <div className="mb-6">
          {status === "verifying" && (
            <div className="w-12 h-12 border-4 border-purple-primary/30 border-t-purple-primary rounded-full animate-spin mx-auto"></div>
          )}
          {status === "success" && <span className="text-5xl">✅</span>}
          {status === "error" && <span className="text-5xl">❌</span>}
        </div>

        <h1 className="text-2xl font-poppins font-bold text-brand-text mb-4">
          {status === "verifying" && "Verifying Email"}
          {status === "success" && "Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p className="text-brand-muted text-sm leading-relaxed mb-8">
          {message}
        </p>

        <div className="pt-6 border-t border-brand-border">
          <Link
            to="/login"
            className="inline-block bg-purple-primary hover:bg-purple-primary/95 text-white font-semibold px-6 py-3 rounded-full transition shadow-md shadow-purple-primary/20 text-xs glow-button-purple"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
