function About() {
  return (
    <div className="bg-brand-bg min-h-screen py-16 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-pastel-rose rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pastel-sage rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto font-sans">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5D588E] bg-pastel-lavender px-3.5 py-1.5 rounded-full border border-[#DCDAF3]">
            About the Project
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-brand-text mt-4">
            Welcome to BlogSphere
          </h1>
          <p className="text-brand-muted mt-3 text-lg">
            A premium publishing environment for tech writers and readers.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 space-y-6 shadow-sm">
          <p className="text-brand-text leading-relaxed font-serif text-lg">
            BlogSphere is a modern blogging platform built with the MERN Stack (MongoDB, Express, React, Node.js).
            It allows developers and tech enthusiasts to discover, read, publish, and interact with article content in real-time.
          </p>

          <h2 className="text-2xl font-serif font-bold text-brand-text pt-4 border-t border-brand-border">
            Key Features
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FDFBF7] rounded-xl border border-brand-border">
              <h3 className="font-semibold text-brand-accent">📝 Publishing Suite</h3>
              <p className="text-xs text-brand-muted mt-1">Create, edit, and organize articles with custom categories and cover images.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-xl border border-brand-border">
              <h3 className="font-semibold text-brand-accent">💬 Real-time Comments</h3>
              <p className="text-xs text-brand-muted mt-1">Join the conversation on any blog. Ask questions, provide feedback, and share ideas.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-xl border border-brand-border">
              <h3 className="font-semibold text-brand-accent">❤️ Interactive Likes</h3>
              <p className="text-xs text-brand-muted mt-1">Support your favorite writers by liking articles. Watch totals update instantly.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-xl border border-brand-border">
              <h3 className="font-semibold text-brand-accent">🔒 Secure Auth</h3>
              <p className="text-xs text-brand-muted mt-1">JWT authentication with protected route verification keeps your account secure.</p>
            </div>
          </div>

          <h2 className="text-2xl font-serif font-bold text-brand-text pt-4 border-t border-brand-border">
            Tech Stack Used
          </h2>

          <div className="flex flex-wrap gap-2 pt-2">
            {["React 19", "Vite", "Tailwind CSS 4", "Express.js", "MongoDB Mongoose", "JSON Web Tokens", "Axios", "React Toastify"].map((tech) => (
              <span key={tech} className="px-3 py-1 bg-[#F6F1E9] text-brand-text text-xs rounded-lg font-medium border border-brand-border">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;