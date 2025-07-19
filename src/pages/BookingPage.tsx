import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, Mail, Phone, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apartments } from "@/data/apartments";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

export const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const apartment = apartments.find(apt => apt.id === id);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  useEffect(() => {
    async function checkProfile() {
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
        if (!data?.first_name || !data?.last_name || !data?.phone) {
          toast({
            variant: "destructive",
            title: "Complete Your Profile",
            description: "Please add your first name, last name, and phone number before booking.",
          });
          navigate("/profile");
        }
      }
    }
    checkProfile();
  }, [user, navigate, toast]);

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "1",
    paymentMethod: "cash",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Apartment Not Found</h1>
          <Button onClick={() => navigate("/apartments")} variant="outline">
            Back to Apartments
          </Button>
        </div>
      </div>
    );
  }

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const calculateTotal = (nights: number) => {
    return nights * apartment.price_per_night;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.checkIn) newErrors.checkIn = "Check-in date is required";
    if (!formData.checkOut) newErrors.checkOut = "Check-out date is required";
    // No guestName, guestEmail, guestPhone validation

    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        newErrors.checkIn = "Check-in date cannot be in the past";
      }
      if (checkOut <= checkIn) {
        newErrors.checkOut = "Check-out date must be after check-in date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors and try again.",
      });
      return;
    }

    // Store booking data for confirmation page
    const bookingData = {
      apartment,
      ...formData,
      nights: calculateNights(),
      totalPrice: calculateTotal(calculateNights()),
      bookingId: `booking-${Date.now()}`,
    };

    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    
    toast({
      title: "Booking Submitted!",
      description: "Redirecting to confirmation page...",
    });

    setTimeout(() => {
      navigate("/booking-confirmation");
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="checkIn">Check-in Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="checkIn"
                            type="date"
                            value={formData.checkIn}
                            onChange={(e) => handleChange("checkIn", e.target.value)}
                            className="pl-10"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        {errors.checkIn && <p className="text-destructive text-sm mt-1">{errors.checkIn}</p>}
                      </div>

                      <div>
                        <Label htmlFor="checkOut">Check-out Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="checkOut"
                            type="date"
                            value={formData.checkOut}
                            onChange={(e) => handleChange("checkOut", e.target.value)}
                            className="pl-10"
                            min={formData.checkIn || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        {errors.checkOut && <p className="text-destructive text-sm mt-1">{errors.checkOut}</p>}
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Select value={formData.guests} onValueChange={(value) => handleChange("guests", value)}>
                        <SelectTrigger>
                          <Users className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Select guests" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: apartment.max_guests }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Guest{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Method */}
                      <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={formData.paymentMethod} onValueChange={(value) => handleChange("paymentMethod", value)}>
                        <SelectTrigger>
                          <CreditCard className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full bg-button-gradient hover:opacity-90 transition-opacity">
                      Complete Booking
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-3">
                    <img
                      src={apartment.primary_image || apartment.image_urls?.[0] || '/placeholder.svg'}
                      alt={apartment.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-sm">{apartment.name}</h3>
                      <p className="text-muted-foreground text-xs">{apartment.location}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Check-in:</span>
                      <span>{formData.checkIn || "Select date"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Check-out:</span>
                      <span>{formData.checkOut || "Select date"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Guests:</span>
                      <span>{formData.guests}</span>
                    </div>
                    {calculateNights() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Nights:</span>
                        <span>{calculateNights()}</span>
                      </div>
                    )}
                  </div>

                  {calculateTotal(calculateNights()) > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span>${apartment.price_per_night} × {calculateNights()} nights</span>
                        <span>${calculateTotal(calculateNights())}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${calculateTotal(calculateNights())}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};