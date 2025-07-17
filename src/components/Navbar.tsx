import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export const Navbar = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/apartments", label: "Apartments", icon: Building2 },
    { path: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-xl flex items-center gap-2">
            <span className="inline-block bg-green-700 text-white rounded-full w-8 h-8 flex items-center justify-center">{/* Logo placeholder */} <span className="font-bold">O</span></span>
            Odai's Apartments
          </Link>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-2 rounded transition font-medium ${location.pathname === path ? "bg-green-100 text-green-800" : "hover:bg-gray-100"}`}
            >
              {label}
            </Link>
          ))}
          {loading ? null : user ? (
            <Link to="/profile" className={`px-3 py-2 rounded transition font-medium ${location.pathname.startsWith("/profile") ? "bg-green-100 text-green-800" : "hover:bg-gray-100"}`}>
              Profile
            </Link>
          ) : (
            <Link to="/login" className={`px-3 py-2 rounded transition font-medium ${location.pathname === "/login" ? "bg-green-100 text-green-800" : "hover:bg-gray-100"}`}>
              Login
            </Link>
          )}
        </div>
        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t shadow-sm px-4 pb-4">
          <div className="flex flex-col gap-2 mt-2">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded transition font-medium ${location.pathname === path ? "bg-green-100 text-green-800" : "hover:bg-gray-100"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {loading ? null : user ? (
              <Link to="/profile" className={`px-3 py-2 rounded transition font-medium ${location.pathname.startsWith("/profile") ? "bg-green-100 text-green-800" : "hover:bg-gray-100"}`} onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
            ) : (
              <Link to="/login" className={`px-3 py-2 rounded transition font-medium ${location.pathname === "/login" ? "bg-green-100 text-green-800" : "hover:bg-gray-100"}`} onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};