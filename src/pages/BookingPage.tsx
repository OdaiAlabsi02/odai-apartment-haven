import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, Mail, Phone, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apartments } from "@/data/apartments";

export const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const apartment = apartments.find(apt => apt.id === id);

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "1",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
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

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * apartment.pricePerNight;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.checkIn) newErrors.checkIn = "Check-in date is required";
    if (!formData.checkOut) newErrors.checkOut = "Check-out date is required";
    if (!formData.guestName.trim()) newErrors.guestName = "Guest name is required";
    if (!formData.guestEmail.trim()) newErrors.guestEmail = "Email is required";
    if (!formData.guestPhone.trim()) newErrors.guestPhone = "Phone number is required";

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

    if (formData.guestEmail && !/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email address";
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
      totalPrice: calculateTotal(),
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
                          {Array.from({ length: apartment.maxGuests }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Guest{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Guest Information</h3>
                      
                      <div>
                        <Label htmlFor="guestName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="guestName"
                            value={formData.guestName}
                            onChange={(e) => handleChange("guestName", e.target.value)}
                            placeholder="Enter your full name"
                            className="pl-10"
                          />
                        </div>
                        {errors.guestName && <p className="text-destructive text-sm mt-1">{errors.guestName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="guestEmail">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="guestEmail"
                            type="email"
                            value={formData.guestEmail}
                            onChange={(e) => handleChange("guestEmail", e.target.value)}
                            placeholder="Enter your email"
                            className="pl-10"
                          />
                        </div>
                        {errors.guestEmail && <p className="text-destructive text-sm mt-1">{errors.guestEmail}</p>}
                      </div>

                      <div>
                        <Label htmlFor="guestPhone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="guestPhone"
                            type="tel"
                            value={formData.guestPhone}
                            onChange={(e) => handleChange("guestPhone", e.target.value)}
                            placeholder="Enter your phone number"
                            className="pl-10"
                          />
                        </div>
                        {errors.guestPhone && <p className="text-destructive text-sm mt-1">{errors.guestPhone}</p>}
                      </div>
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
                      src={apartment.images[0]}
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

                  {calculateTotal() > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span>${apartment.pricePerNight} × {calculateNights()} nights</span>
                        <span>${calculateTotal()}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${calculateTotal()}</span>
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