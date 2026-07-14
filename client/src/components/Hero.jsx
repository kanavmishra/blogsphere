import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Hero() {
  const { token } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-card to-brand-bg py-24 md:py-32 border-b border-brand-border">
      {/* Decorative background grids/glowing blobs */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-primary rounded-full blur-3xl opacity-60 animate-float-1"></div>
        <div className="absolute -bottom-40 right-20 w-96 h-96 bg-rose-gold rounded-full blur-3xl opacity-50 animate-float-2"></div>
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-lilac rounded-full blur-3xl opacity-40 animate-float-1"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--brand-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--brand-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center animate-reveal">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-lilac/30 text-purple-deep border border-brand-border mb-6">
          ✨ The Developer Knowledge Hub
        </span>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-black tracking-tight mb-8 text-brand-text">
          Explore Ideas in
          <br />
          <span className="bg-gradient-to-r from-purple-primary via-rose-gold to-purple-primary bg-clip-text text-transparent text-glow">
            Tech & Development
          </span>
        </h1>

        <p className="text-base md:text-xl max-w-2xl mx-auto text-brand-muted mb-10 leading-relaxed font-sans font-normal">
          Discover insights on React, Artificial Intelligence, Web3, and futuristic UI design.
          Written by creators, read by innovators.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/blogs"
            className="w-full sm:w-auto bg-purple-primary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-purple-primary/90 transition duration-300 shadow-lg shadow-purple-primary/20 hover:shadow-purple-primary/35 text-center glow-button-purple"
          >
            Start Reading 📚
          </Link>

          {!token ? (
            <Link
              to="/register"
              className="w-full sm:w-auto border border-brand-border bg-brand-card hover:bg-brand-bg text-brand-text px-8 py-3.5 rounded-full font-semibold transition duration-300 text-center"
            >
              Write a Blog ✍️
            </Link>
          ) : (
            <Link
              to="/create-blog"
              className="w-full sm:w-auto border border-brand-border bg-brand-card hover:bg-brand-bg text-brand-text px-8 py-3.5 rounded-full font-semibold transition duration-300 text-center"
            >
              Publish Article 🚀
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;