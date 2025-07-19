import { useState, useEffect } from "react";
import { Shield, Calendar, User, Mail, Phone, ToggleLeft, ToggleRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { mockBookings, Booking } from "@/data/bookings";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

export const AdminPage = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/admin",
      },
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  // Check for Supabase session and admin role after OAuth
  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role === "admin") {
          setIsAuthenticated(true);
          localStorage.setItem("adminAuthenticated", "true");
          toast({
            title: "Access Granted",
            description: "Welcome to the admin dashboard!",
          });
        } else if (profile) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You are not an admin.",
          });
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    };
    checkAdmin();
    // Only run on mount or after OAuth redirect
    // eslint-disable-next-line
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      toast({
        title: "Access Granted",
        description: "Welcome to the admin dashboard!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid password. Please try again.",
      });
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    setPassword("");
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const toggleBookingStatus = (bookingId: string) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        const newStatus = booking.status === 'pending' ? 'confirmed' : 'pending';
        toast({
          title: `Booking ${newStatus}`,
          description: `Booking ${bookingId} status updated to ${newStatus}.`,
        });
        return { ...booking, status: newStatus };
      }
      return booking;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <p className="text-muted-foreground">
              Enter your password or use Google to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Demo password: admin123
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-button-gradient hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Access Dashboard
              </Button>
            </form>
            <div className="my-4 flex items-center justify-center">
              <span className="text-muted-foreground text-xs">or</span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle className="h-5 w-5" />
              Sign in with Google
            </Button>
            {loading && (
              <div className="text-center text-xs text-muted-foreground mt-2">Checking admin access...</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Administrator Dashboard</h2>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};