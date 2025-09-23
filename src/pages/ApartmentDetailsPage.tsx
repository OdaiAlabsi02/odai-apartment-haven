import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Users, Bed, Bath, Calendar, ChevronLeft, ChevronRight, Check, Loader2, Star, Wifi, Car, Waves, ChefHat, Shield, Heart, Wind, Coffee, Flame, Home, Dumbbell, Trees, Tv, Laptop, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";

export const ApartmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string>("saved");
  const [selectedSavedPmId, setSelectedSavedPmId] = useState<string>("");

  useEffect(() => {
    const fetchOne = async () => {
      if (!id) return;
      // fetch property
      const { data: prop, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !prop) {
        navigate('/');
        return;
      }
      // fetch images
      const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id)
        .order('display_order', { ascending: true });
      const primary = images?.find(i => i.is_primary)?.image_url || images?.[0]?.image_url || null;
      const rest = (images || []).filter(i => !i.is_primary).map(i => i.image_url);
      // fetch location
      const { data: location } = await supabase
        .from('property_locations')
        .select('*')
        .eq('property_id', id)
        .single();

      setProperty({
        ...prop,
        title: prop.title || prop.name,
        city: prop.city || prop.location,
        base_price: prop.base_price || prop.price_per_night,
        primary_image: primary,
        image_urls: rest,
        image_count: images?.length || 0,
        location
      });
    };
    fetchOne();
  }, [id, navigate]);

  const images = property ? [property.primary_image, ...(property.image_urls || [])].filter(Boolean) as string[] : [];

  const amenityIcons: { [key: string]: any } = {
    "Wi-Fi": Wifi,
    "Parking": Car,
    "Pool": Waves,
    "Kitchen": ChefHat,
    "Security": Shield,
    "Air Conditioning": Wind,
    "Coffee Maker": Coffee,
    "BBQ": Flame,
    "Garden": Trees,
    "Gym": Dumbbell,
    "TV": Tv,
    "Workspace": Laptop,
    "Balcony": Home
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchPms = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (!error) {
        setPaymentMethods(data || []);
        setHasPaymentMethod(!!(data && data.length));
        const defaultPm = (data || []).find((d:any) => d.is_default) || (data || [])[0];
        setSelectedSavedPmId(defaultPm?.id || "");
      }
    };
    fetchPms();
  }, [user?.id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Redirect to login page
      navigate('/login');
      return;
    }

    if (!hasPaymentMethod && selectedPaymentOption === 'saved') {
      // Redirect to profile to add payment method
      navigate('/profile?tab=payment');
      return;
    }

    // Show booking confirmation panel
    setShowBookingPanel(true);
  };

  const handleConfirmBooking = () => {
    // If using Stripe Checkout (Apple/Google Pay or generic card checkout)
    createCheckoutSession();
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return (property?.base_price || 0) * nights + 40; // 40 JOD for fees
  };

  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const n = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, n);
  };

  const API_BASE = '/api';

  const createCheckoutSession = async () => {
    try {
      const nights = getNights();
      const res = await fetch(`${API_BASE}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitAmountJod: property?.base_price,
          nights,
          propertyId: property?.id,
          propertyTitle: property?.title,
          customerId: (user as any)?.stripe_customer_id || undefined,
          successUrl: `${window.location.origin}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/apartment/${property?.id}`,
          metadata: {
            selectedPaymentOption,
            selectedSavedPmId,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error', err);
      alert('Could not start payment. Please try again.');
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  
                  {/* Navigation Arrows */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image Indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location?.formatted_address || property.city || 'Location not available'}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      {renderStars(property.rating)}
                      <span className="ml-2 text-sm text-gray-600">({property.review_count} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{property.base_price} JOD</div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-sm">{property.max_guests || property.guests || 1} guests</span>
                  </div>
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-sm">{property.bedrooms || 1} bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-sm">{property.bathrooms || 1} bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-sm">{property.unit_size} {property.unit_size_unit}</span>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(property?.amenities ?? []).map((amenity: string) => {
                    const IconComponent = amenityIcons[amenity] || Home;
                    return (
                      <div key={amenity} className="flex items-center">
                        <IconComponent className="h-5 w-5 mr-3 text-gray-600" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* House Rules */}
            <Card>
              <CardHeader>
                <CardTitle>House Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-sm">Check-in: 3:00 PM - 10:00 PM</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-sm">Check-out: 11:00 AM</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-sm">No smoking inside</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-sm">No pets allowed</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-sm">No parties or events</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-sm">Quiet hours: 10:00 PM - 7:00 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    {property.location?.map_url ? (
                      <a href={property.location.map_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open in Google Maps</a>
                    ) : (
                      <p className="text-gray-600">Google Maps integration would go here</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{property.location?.formatted_address || property.city || property.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin">Check-in</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">Check-out</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={property.max_guests || property.guests || 1}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{property.base_price} JOD × 3 nights</span>
                    <span>{property.base_price * 3} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>25 JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>15 JOD</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{property.base_price * 3 + 40} JOD</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBookNow}
                  disabled={!checkIn || !checkOut}
                >
                  {!isAuthenticated ? 'Login to Book' : !hasPaymentMethod ? 'Add Payment Method' : 'Book Now'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  You won't be charged yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Panel */}
      {showBookingPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Your Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-sm text-gray-600">{property.location?.formatted_address || property.city || 'Location not available'}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{guests}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                {/* Payment selection */}
                <div className="space-y-2">
                  <Label>Payment method</Label>
                  <Select value={selectedPaymentOption} onValueChange={setSelectedPaymentOption}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saved">Saved card</SelectItem>
                      <SelectItem value="googlepay">Google Pay</SelectItem>
                      <SelectItem value="applepay">Apple Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPaymentOption === 'saved' && (
                  <div className="space-y-2">
                    <Label>Choose saved card</Label>
                    {paymentMethods.length ? (
                      <Select value={selectedSavedPmId} onValueChange={setSelectedSavedPmId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((pm:any) => (
                            <SelectItem key={pm.id} value={pm.id}>
                              {pm.brand?.toUpperCase?.() || 'CARD'} **** {pm.last4} {pm.is_default ? '(Default)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button variant="outline" onClick={() => navigate('/profile?tab=payment')}>Add Payment Method</Button>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{property.base_price} JOD × {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                  <span>{property.base_price * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} JOD</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>25 JOD</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>15 JOD</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{calculateTotal()} JOD</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowBookingPanel(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleConfirmBooking}
                >
                  Confirm Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};