import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Outlet } from "react-router-dom";

const SECTIONS = [
  { key: "account", label: "Account Information" },
  { key: "bookings", label: "Booking History" },
  { key: "wishlist", label: "Wishlist" },
  { key: "referrals", label: "Referrals" },
  { key: "reviews", label: "Reviews" },
  { key: "notifications", label: "Notifications" },
  { key: "account_management", label: "Account Management" },
];

export function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState("account");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookings();
      fetchWishlist();
      fetchReferrals();
      fetchReviews();
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [user]);

  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
    setForm({
      first_name: data?.first_name || "",
      last_name: data?.last_name || "",
      phone: data?.phone || ""
    });
  }
  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*, apartment:apartment_id(name, location, images)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookings(data || []);
  }
  async function fetchWishlist() {
    setWishlist([]);
  }
  async function fetchReferrals() {
    setReferrals([]);
  }
  async function fetchReviews() {
    setReviews([]);
  }
  async function fetchNotifications() {
    setNotifications([]);
  }

  async function handleSave() {
    setSaving(true);
    await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    setEditMode(false);
    fetchProfile();
  }

  if (loading || !user || !profile) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
} 