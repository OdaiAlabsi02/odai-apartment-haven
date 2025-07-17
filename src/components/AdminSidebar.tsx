import { Link, useLocation } from "react-router-dom";
import { Home, List, Calendar, Mail, Users, Settings, Star } from "lucide-react";

const menu = [
  { label: "Dashboard", icon: Home, to: "/admin/dashboard" },
  { label: "Listings", icon: List, to: "/admin/listings" },
  { label: "Amenities", icon: Star, to: "/admin/amenities" },
  { label: "Bookings", icon: Calendar, to: "/admin/bookings" },
  { label: "Messages", icon: Mail, to: "/admin/messages" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col py-6 px-4">
      <div className="mb-8">
        <Link to="/admin/dashboard" className="text-2xl font-bold text-primary">
          Admin Panel
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {menu.map(({ label, icon: Icon, to }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
              location.pathname === to
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground hover:bg-muted hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}