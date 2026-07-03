import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Discover, Read & Share
          <br />
          Amazing Tech Blogs
        </h1>

        <p className="text-xl max-w-2xl mx-auto text-blue-100 mb-10">
          Learn React, MERN Stack, AI, Cybersecurity and Web Development
          from developers around the world.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/blogs"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Reading
          </Link>

          <Link
            to="/register"
            className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Write a Blog
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Hero;