import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-brand-card border-t border-brand-border text-brand-muted py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            to="/"
            className="text-xl font-poppins font-bold tracking-tight bg-gradient-to-r from-purple-primary via-rose-gold to-[#B89CFF] bg-clip-text text-transparent hover:opacity-90"
          >
            ✨ BlogSphere
          </Link>
          <p className="text-xs text-brand-muted/70 font-sans">
            Publish your stories. Share your skills. Built with ❤️ on React & MERN.
          </p>
        </div>

        <div className="flex gap-6 text-sm">
          <Link to="/" className="hover:text-purple-primary transition">Home</Link>
          <Link to="/blogs" className="hover:text-purple-primary transition">Blogs</Link>
          <Link to="/about" className="hover:text-purple-primary transition">About</Link>
        </div>

        <p className="text-xs text-brand-muted/70">
          © {new Date().getFullYear()} BlogSphere. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;