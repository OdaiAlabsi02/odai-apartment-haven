import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MapPin, DollarSign, User, Mail, Phone, Edit, Save, X, AlertCircle, Eye, CreditCard, Plus, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../lib/supabaseClient";
import { DetailedBookingModal } from "@/components/DetailedBookingModal";
import { useApartments } from "@/hooks/useApartments";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth?: string;
  bio?: string;
  is_admin: boolean;
  role: string;
  created_at: string;
}

interface GuestBooking {
  id: string;
  apartmentTitle: string;
  apartmentCity: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  nights: number;
  basePrice: number;
  guestFee: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  isAuthenticated: boolean;
  paymentType?: string;
  onlineAmount?: number;
  cashAmount?: number;
}

interface UserBooking {
  id: string;
  apartmentTitle?: string;
  apartmentCity?: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_amount: number;
  status: string;
  created_at?: string;
  payment_type?: string;
  online_amount?: number;
  cash_amount?: number;
}

export const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guestBookings, setGuestBookings] = useState<GuestBooking[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: ""
  });
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });
  const { getApartmentById } = useApartments();
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get('tab') === 'payment' ? 'payment' : 'profile'
  );

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchPaymentMethods();
      fetchUserBookingsFromDb();
    } else {
      // For guests, load their local bookings
      loadGuestBookings();
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
        return;
      }

      setProfile(data);
      setEditForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        bio: data.bio || ""
      });

      // After profile is loaded, fetch user bookings
      await fetchUserBookings(data.id, data.email);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (userId: string, email: string) => {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        setUserBookings(data as unknown as UserBooking[]);
        return;
      }
    } catch (e) {
      console.warn('Supabase user bookings unavailable, using local:', e);
    }

    // Fallback: localStorage bookings made while offline
    const locals: any[] = JSON.parse(localStorage.getItem('localBookings') || '[]');
    const filtered = locals
      .filter(b => b.isAuthenticated && (!email || b.guestEmail === email))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(b => ({
        id: b.id,
        apartmentTitle: b.apartmentTitle,
        apartmentCity: b.apartmentCity,
        check_in_date: b.checkIn,
        check_out_date: b.checkOut,
        guests: parseInt(b.guests || '1'),
        total_amount: b.totalPrice,
        status: b.status || 'confirmed',
        created_at: b.createdAt,
        payment_type: b.paymentType,
        online_amount: b.onlineAmount,
        cash_amount: b.cashAmount
      } as UserBooking));
    setUserBookings(filtered);
  };

  const loadGuestBookings = () => {
    const localBookings = localStorage.getItem('localBookings');
    if (localBookings) {
      setGuestBookings(JSON.parse(localBookings));
    }
  };

  const handleViewBookingDetails = async (booking: any) => {
    try {
      // Fetch property details if we have a property_id
      let propertyDetails = null;
      if (booking.property_id) {
        propertyDetails = await getApartmentById(booking.property_id);
      }
      
      setSelectedBooking({ ...booking, property: propertyDetails });
      setIsBookingModalOpen(true);
    } catch (error) {
      console.error('Error fetching property details:', error);
      // Still show the modal with just booking info
      setSelectedBooking(booking);
      setIsBookingModalOpen(true);
    }
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
          bio: editForm.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
      bio: profile?.bio || ""
    });
    setIsEditing(false);
  };

  const handleAddPaymentMethod = () => {
    // Persist to Supabase payment_methods
    if (!user) return;
    const digits = newPaymentMethod.cardNumber.replace(/\D/g, '');
    const last4 = digits.slice(-4);
    const brand = digits.startsWith('4') ? 'visa' : digits.startsWith('5') ? 'mastercard' : 'card';
    const [mm, yy] = newPaymentMethod.expiryDate.split('/');
    supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        brand,
        last4,
        exp_month: Number(mm) || 1,
        exp_year: Number(yy?.length === 2 ? `20${yy}` : yy) || new Date().getFullYear(),
        is_default: newPaymentMethod.isDefault,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Add payment error', error);
          toast({ title: 'Error', description: 'Failed to add payment method', variant: 'destructive' });
          return;
        }
        fetchPaymentMethods();
        setNewPaymentMethod({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '', isDefault: false });
        setIsAddingPayment(false);
        toast({ title: 'Success', description: 'Payment method added successfully' });
      });
  };

  const handleRemovePaymentMethod = (id: string) => {
    supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Remove payment error', error);
          toast({ title: 'Error', description: 'Failed to remove payment method', variant: 'destructive' });
          return;
        }
        fetchPaymentMethods();
        toast({ title: 'Success', description: 'Payment method removed' });
      });
  };

  const handleSetDefaultPayment = (id: string) => {
    if (!user) return;
    // The trigger will unset previous defaults
    supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Set default error', error);
          toast({ title: 'Error', description: 'Failed to set default method', variant: 'destructive' });
          return;
        }
        fetchPaymentMethods();
        toast({ title: 'Success', description: 'Default payment method updated' });
      });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchPaymentMethods = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Fetch payments error', error);
      return;
    }
    setPaymentMethods(
      (data || []).map(pm => ({
        id: pm.id,
        last4: pm.last4,
        type: pm.brand,
        isDefault: pm.is_default,
        expMonth: pm.exp_month,
        expYear: pm.exp_year,
      }))
    );
  };

  const fetchUserBookingsFromDb = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: true });
    if (error) {
      console.error('Fetch bookings error', error);
      return;
    }
    setUserBookings((data as any) || []);
  };

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const upcomingBookings = useMemo(() =>
    userBookings.filter((b: any) => (b.check_out_date || b.check_in_date) >= todayIso),
  [userBookings, todayIso]);
  const pastBookings = useMemo(() =>
    userBookings.filter((b: any) => (b.check_out_date || b.check_in_date) < todayIso),
  [userBookings, todayIso]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            {user ? "Manage your account and preferences" : "View your guest bookings and information"}
          </p>
        </div>

        {/* Guest Notice */}
        {!user && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">Guest User</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    You're currently browsing as a guest. Sign up for an account to save your preferences, 
                    avoid guest fees on future bookings, and access exclusive deals!
                  </p>
                  <Button onClick={() => window.location.href = '/signup'}>
                    Sign Up Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile Section */}
        {user && profile && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              {/* Payment tab intentionally removed since Stripe Checkout will handle payment */}
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">First Name</Label>
                    <p className="font-medium">{profile.first_name || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Name</Label>
                    <p className="font-medium">{profile.last_name || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{profile.phone || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="font-medium">{profile.bio || "No bio provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={profile.is_admin ? "default" : "secondary"}>
                        {profile.is_admin ? "Admin" : "User"}
                      </Badge>
                      {profile.role && (
                        <Badge variant="outline">{profile.role}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Member Since</Label>
                    <p className="font-medium">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking: any) => (
                        <div 
                          key={booking.id} 
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleViewBookingDetails(booking)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{booking.apartmentTitle || 'Property'}</h4>
                              {booking.apartmentCity && (
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {booking.apartmentCity}
                                </p>
                              )}
                            </div>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Check-in</p>
                                <p>{formatDate(booking.check_in_date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Check-out</p>
                                <p>{formatDate(booking.check_out_date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Guests</p>
                                <p>{booking.guests}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Total</p>
                                <p className="font-semibold">{booking.total_amount} JOD</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No upcoming bookings</h3>
                      <p className="text-muted-foreground mb-4">
                        Start exploring our properties and make your first booking!
                      </p>
                      <Button onClick={() => window.location.href = '/'}>
                        Browse Properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past bookings */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Past Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pastBookings.length > 0 ? (
                    <div className="space-y-4">
                      {pastBookings.map((booking: any) => (
                        <div key={booking.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{booking.apartmentTitle || 'Property'}</h4>
                              {booking.apartmentCity && (
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {booking.apartmentCity}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary">Completed</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Check-in</p>
                                <p>{formatDate(booking.check_in_date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Check-out</p>
                                <p>{formatDate(booking.check_out_date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Guests</p>
                                <p>{booking.guests}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Total</p>
                                <p className="font-semibold">{booking.total_amount} JOD</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No past bookings yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Payment tab removed */}
          </Tabs>
        )}

        {/* Guest Bookings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {user ? "Your Bookings" : "Guest Bookings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewBookingDetails(booking)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{booking.apartmentTitle || 'Property'}</h4>
                          {booking.apartmentCity && (
                            <p className="text-muted-foreground">{booking.apartmentCity}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewBookingDetails(booking);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.guests} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Booked on {formatDate(booking.created_at || booking.check_in_date)}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(booking.total_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your booking history will appear here once you make bookings.</p>
                </div>
              )
            ) : guestBookings.length > 0 ? (
              <div className="space-y-4">
                {guestBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewBookingDetails(booking)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{booking.apartmentTitle}</h4>
                        <p className="text-muted-foreground">{booking.apartmentCity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBookingDetails(booking);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.guests} guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.nights} nights</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Base: </span>
                          <span className="font-medium">{formatCurrency(booking.basePrice)}</span>
                          {!booking.isAuthenticated && (
                            <>
                              <span className="text-muted-foreground ml-2">+ Guest Fee: </span>
                              <span className="font-medium text-yellow-600">{formatCurrency(booking.guestFee)}</span>
                            </>
                          )}
                        </div>
                        <div className="text-lg font-semibold">
                          Total: {formatCurrency(booking.totalPrice)}
                        </div>
                      </div>
                      
                      {/* Payment Information */}
                      {booking.paymentType && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <p className="text-blue-800 font-medium">
                            {booking.paymentType === 'partial' ? 'Partial Payment (50% Online)' : 'Full Payment (100% Online)'}
                          </p>
                          {booking.paymentType === 'partial' && (
                            <>
                              <p className="text-blue-700">Online Paid: {formatCurrency(booking.onlineAmount || 0)}</p>
                              <p className="text-blue-700">Cash on Arrival: {formatCurrency(booking.cashAmount || 0)}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bookings found.</p>
                {!user && (
                  <p className="text-sm mt-2">Make your first booking to see it here!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign Out Button for Authenticated Users */}
        {user && (
          <div className="mt-8 text-center">
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        )}

        {/* Detailed Booking Modal */}
        <DetailedBookingModal
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
          booking={selectedBooking}
          property={null} // We'll fetch this when needed
        />
      </div>
    </div>
  );
}; 