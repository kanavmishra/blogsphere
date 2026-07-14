import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text selection:bg-purple-primary selection:text-white transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;