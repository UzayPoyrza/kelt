import { Outlet, Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function Root() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </motion.div>
            <span className="text-xl tracking-tight">MindFlow</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm transition-colors ${
                isHome ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/generate" 
              className={`text-sm transition-colors ${
                !isHome ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Generator
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
