import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApartments } from "@/hooks/useApartments";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, differenceInDays, isSameDay } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAvailability } from "@/hooks/useAvailability";
import StripePayment from "@/components/StripePayment";

const guestFeePercentage = 10; // 10% guest fee for non-authenticated users

export const BookingPage = () => {
  // All hooks must be called in the same order every render
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apartments, loading: apartmentLoading, error: apartmentError } = useApartments();
  const auth = useAuth();
  const { toast } = useToast();
  const { availability, loading: availabilityLoading, fetchAvailability } = useAvailability(id || "");

  // State declarations
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "1",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  // Derived values
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated || false;
  const apartment = apartments.find(apt => apt.id === id);

  // Fetch existing bookings for this property
  useEffect(() => {
    const fetchExistingBookings = async () => {
      if (!id) return;
      
      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('check_in_date, check_out_date, status')
          .eq('property_id', id)
          .eq('status', 'confirmed');

        if (error) {
          console.error('Error fetching existing bookings:', error);
        } else {
          console.log('Fetched existing bookings:', bookings);
          setExistingBookings(bookings || []);
        }
      } catch (error) {
        console.error('Error fetching existing bookings:', error);
      }
    };

    fetchExistingBookings();
  }, [id]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guestName: user.user_metadata?.full_name || user.email || "",
        guestEmail: user.email || "",
      }));
    }
  }, [user]);

  // Fetch availability for current month when component loads
  useEffect(() => {
    if (apartment?.id && !availabilityLoading) {
      const start = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), 1);
      const end = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 0);
      console.log('Fetching availability for month:', { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
      fetchAvailability(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    }
  }, [apartment?.id, fetchAvailability, availabilityLoading, currentCalendarMonth]);

  // Event handlers
  // New handler for calendar date clicks
  const handleCalendarDateClick = useCallback((day: any) => {
    if (!day.date || !day.isAvailable) return;

    const dateStr = format(day.date, "yyyy-MM-dd");
    
    // If no check-in date is selected, set it
    if (!formData.checkIn) {
      setFormData(prev => ({
        ...prev,
        checkIn: dateStr,
        checkOut: ""
      }));
    }
    // If check-in is selected but no check-out, set check-out (must be after check-in)
    else if (!formData.checkOut && dateStr > formData.checkIn) {
      setFormData(prev => ({
        ...prev,
        checkOut: dateStr
      }));
    }
    // If both dates are selected, reset and start over
    else if (formData.checkIn && formData.checkOut) {
      setFormData(prev => ({
        ...prev,
        checkIn: dateStr,
        checkOut: ""
      }));
    }
  }, [formData.checkIn, formData.checkOut]);

  const calculateNights = useCallback(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      return differenceInDays(end, start);
    }
    return 0;
  }, [formData.checkIn, formData.checkOut]);

  const calculateBaseTotal = useCallback(() => {
    const nights = calculateNights();
    return nights * (apartment?.base_price || 0);
  }, [calculateNights, apartment?.base_price]);

  const calculateGuestFee = useCallback(() => {
    if (isAuthenticated) return 0;
    const baseTotal = calculateBaseTotal();
    return (baseTotal * guestFeePercentage) / 100;
  }, [isAuthenticated, calculateBaseTotal]);

  const calculateTotal = useCallback(() => {
    const baseTotal = calculateBaseTotal();
    const guestFee = calculateGuestFee();
    return baseTotal + guestFee;
  }, [calculateBaseTotal, calculateGuestFee]);

  const handlePrevMonth = useCallback(() => {
    setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handlePaymentSuccess = useCallback(async (paymentId: string) => {
    if (!bookingData) return;
    
    try {
      // Extract only the database fields for insertion
      const { _localData, ...dbFields } = bookingData;
      
      // Get payment type from the StripePayment component
      const paymentType = localStorage.getItem('selectedPaymentType') || 'partial';
      const onlineAmount = paymentType === 'partial' ? Math.round(bookingData.total_amount * 0.5) : bookingData.total_amount;
      const cashAmount = paymentType === 'partial' ? bookingData.total_amount - onlineAmount : 0;
      
      // Create the booking data with only valid database fields
      const bookingInsertData = {
        property_id: dbFields.property_id,
        guest_id: dbFields.guest_id,
        host_id: dbFields.host_id,
        check_in_date: dbFields.check_in_date,
        check_out_date: dbFields.check_out_date,
        guests: dbFields.guests,
        adults: dbFields.adults,
        children: dbFields.children,
        infants: dbFields.infants,
        base_amount: dbFields.base_amount,
        cleaning_fee: dbFields.cleaning_fee,
        service_fee: dbFields.service_fee,
        tax_amount: dbFields.tax_amount,
        total_amount: dbFields.total_amount,
        currency: dbFields.currency,
        status: 'confirmed',
        special_requests: dbFields.special_requests,
        payment_type: paymentType,
        online_amount: onlineAmount,
        cash_amount: cashAmount,
        cash_received: false,
        stripe_payment_intent_id: paymentId,
        guest_name: _localData.guestEmail ? formData.guestName : null,
        guest_email: _localData.guestEmail ? formData.guestEmail : null,
        guest_phone: _localData.guestPhone ? formData.guestPhone : null,
      };
      
      console.log('Inserting booking data:', bookingInsertData);
      
      // Create the actual booking in the database
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingInsertData])
        .select()
        .single();

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }

      // Update availability settings
      const datesToClose = [];
      let currentDate = new Date(bookingData.check_in_date);
      const endDate = new Date(bookingData.check_out_date);
      while (currentDate < endDate) {
        datesToClose.push({
          property_id: bookingData.property_id,
          date: currentDate.toISOString().split('T')[0],
          is_available: false,
          price: apartment?.base_price,
          minimum_stay: apartment?.minimum_stay || 1,
          is_instant_book: apartment?.is_instant_book || true,
          notes: 'Booked'
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (datesToClose.length > 0) {
        try {
          const { error: availabilityError } = await supabase
            .from('availability_settings')
            .upsert(datesToClose, { onConflict: 'property_id, date' });
          
          if (availabilityError) {
            console.error('Failed to update availability:', availabilityError);
            // Don't fail the booking for availability errors, just log them
          } else {
            console.log('Availability updated successfully');
          }
        } catch (error) {
          console.warn('Failed to update availability:', error);
        }
      }

      // Store confirmation data using local data
      const confirmationData = {
        id: data.id,
        apartmentTitle: _localData.apartmentTitle,
        apartmentCity: _localData.apartmentCity,
        checkIn: bookingData.check_in_date,
        checkOut: bookingData.check_out_date,
        guests: bookingData.guests.toString(),
        guestName: formData.guestName,
        guestEmail: _localData.guestEmail,
        guestPhone: _localData.guestPhone,
        nights: _localData.nights,
        totalPrice: bookingData.total_amount,
        status: 'confirmed',
        isAuthenticated: _localData.isAuthenticated,
        guestFeePercentage: _localData.guestFeePercentage,
        paymentId: paymentId,
        onlineAmount: onlineAmount,
        cashAmount: cashAmount,
        paymentType: paymentType,
      };

      localStorage.setItem("latestBooking", JSON.stringify(confirmationData));

      if (!_localData.isAuthenticated) {
        const localBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
        localStorage.setItem('localBookings', JSON.stringify([...localBookings, confirmationData]));
      }

      toast({
        title: "Payment Successful!",
        description: "Your booking has been confirmed. You'll receive a confirmation email shortly.",
      });

      navigate("/booking-confirmation");
    } catch (error) {
      console.error('Error creating booking after payment:', error);

      try {
        // Attempt to persist an orphan payment record so admins can reconcile
        const { _localData, ...dbFields } = bookingData || {};
        const paymentType = localStorage.getItem('selectedPaymentType') || 'partial';
        const onlineAmount = paymentType === 'partial' ? Math.round((bookingData?.total_amount || 0) * 0.5) : (bookingData?.total_amount || 0);

        // Best-effort insert into payments table (if present)
        const { error: orphanPaymentError } = await supabase
          .from('payments')
          .insert([
            {
              user_id: auth?.user?.id || null,
              property_id: dbFields?.property_id || id,
              booking_id: null,
              amount: onlineAmount,
              currency: dbFields?.currency || 'USD',
              status: 'orphan',
              method: 'stripe',
              payment_type: paymentType,
              stripe_payment_intent_id: paymentId,
              notes: 'Payment captured, booking creation failed in app',
              metadata: JSON.stringify({ reason: 'booking_insert_failed', dbFields })
            }
          ]);

        if (orphanPaymentError) {
          console.warn('Failed to log orphan payment to payments table:', orphanPaymentError);
        }

        // Best-effort notify host/admin through messages table (if present)
        if (apartment?.host_id) {
          const { error: notifyError } = await supabase
            .from('messages')
            .insert([
              {
                sender_id: auth?.user?.id || null,
                receiver_id: apartment.host_id,
                apartment_id: id,
                booking_id: null,
                message: `Payment succeeded but booking failed. PaymentIntent: ${paymentId}. Please review orphan payments and create booking manually if needed.`,
                is_read: false
              }
            ]);
          if (notifyError) {
            console.warn('Failed to notify admin/host about orphan payment:', notifyError);
          }
        }

        // Persist a local pending notice for the customer
        const pendingNotice = {
          paymentId,
          apartmentTitle: apartment?.title,
          apartmentCity: apartment?.city,
          checkIn: bookingData?.check_in_date,
          checkOut: bookingData?.check_out_date,
          guests: String(bookingData?.guests || ''),
          totalPrice: bookingData?.total_amount,
          paymentType,
          onlineAmount
        };
        try {
          const existing = JSON.parse(localStorage.getItem('pendingOrphanPayments') || '[]');
          localStorage.setItem('pendingOrphanPayments', JSON.stringify([pendingNotice, ...existing]));
        } catch (lsErr) {
          console.warn('Failed to store pending orphan payment locally:', lsErr);
        }
      } catch (fallbackErr) {
        console.warn('Fallback logging failed:', fallbackErr);
      }

      toast({
        title: 'Payment received, booking pending',
        description: 'We received your payment but there was an issue creating the booking. Our team has been notified and will confirm your reservation shortly. You will not be charged again.',
        variant: 'destructive',
      });
    }
  }, [bookingData, apartment, navigate, toast, formData.guestName, formData.guestEmail, formData.guestPhone]);

  const handlePaymentError = useCallback((error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
    setShowPayment(false);
  }, [toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !apartment) return;

    if (!formData.checkIn || !formData.checkOut || calculateNights() <= 0) {
      toast({
        title: "Booking Error",
        description: "Please select valid check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check for booking overlaps before submission
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', id)
        .or(`and(check_in_date.lte.${formData.checkOut},check_out_date.gte.${formData.checkIn})`);

      if (bookingsError) {
        console.error('Error checking existing bookings:', bookingsError);
        toast({
          title: "Booking Error",
          description: "Failed to check for existing bookings. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const hasOverlap = existingBookings.some(existingBooking => {
        const existingCheckIn = new Date(existingBooking.check_in_date);
        const existingCheckOut = new Date(existingBooking.check_out_date);
        const newCheckIn = new Date(formData.checkIn);
        const newCheckOut = new Date(formData.checkOut);

        return (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn);
      });

      if (hasOverlap) {
        toast({
          title: "Dates Unavailable",
          description: "The selected dates overlap with an existing booking. Please choose different dates.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const nights = calculateNights();
      const baseTotal = calculateBaseTotal();
      const guestFee = calculateGuestFee();
      const total = calculateTotal();



      // Store booking data for payment step
      const tempBookingData = {
        property_id: id,
        guest_id: user?.id || null,
        host_id: apartment.host_id || null,
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut,
        guests: parseInt(formData.guests),
        adults: parseInt(formData.guests),
        children: 0,
        infants: 0,
        base_amount: baseTotal,
        cleaning_fee: 0,
        service_fee: guestFee,
        tax_amount: 0,
        total_amount: total,
        currency: "USD",
        status: "pending_payment",
        special_requests: "",
        // Store additional data in localStorage for confirmation page
        _localData: {
          apartmentTitle: apartment.title,
          apartmentCity: apartment.city,
          nights: nights,
          guestFeePercentage: guestFeePercentage,
          isAuthenticated: isAuthenticated,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
        }
      };

      setBookingData(tempBookingData);
      setShowPayment(true);
      setLoading(false);

    } catch (error) {
      console.error("Booking failed:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, apartment, formData, calculateNights, calculateBaseTotal, calculateGuestFee, calculateTotal, user?.id, isAuthenticated, toast, navigate]);

  // Memoized calendar days
  const calendarDays = useMemo(() => {
    const days: { date: Date | null; isCurrentMonth: boolean; isToday: boolean; isAvailable: boolean; price: number | null; isSelected: boolean; }[] = [];
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startingDay = firstDayOfMonth.getDay();

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, isCurrentMonth: false, isToday: false, isAvailable: false, price: null, isSelected: false });
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = format(dateObj, "yyyy-MM-dd");

      const isToday = isSameDay(dateObj, today);
      const isCurrentMonth = true;
      const isPast = dateObj < today; // Check if date is in the past

      // Check availability from database
      const availabilityItem = availability.find(a => a.date === dateStr);
      
      // Check if this date is within any existing booking
      const isBooked = existingBookings.some(booking => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const currentDateObj = new Date(dateStr);
        // A date is booked if it's >= check-in and < check-out
        return currentDateObj >= checkIn && currentDateObj < checkOut;
      });
      
      // A date is available only if:
      // 1. It's not in the past
      // 2. It's not already booked
      // 3. It's marked as available in the database (or no specific setting exists)
      const isAvailable = !isPast && !isBooked && (availabilityItem?.is_available ?? true);
      
      const price = availabilityItem?.price ?? apartment?.base_price ?? null;

      const isSelected = (formData.checkIn && dateStr >= formData.checkIn && dateStr < formData.checkOut) ||
                         (formData.checkOut && dateStr > formData.checkIn && dateStr <= formData.checkOut);

      days.push({
        date: dateObj,
        isCurrentMonth,
        isToday,
        isAvailable,
        price,
        isSelected
      });
    }
    return days;
  }, [currentCalendarMonth, availability, formData.checkIn, formData.checkOut, apartment?.base_price, existingBookings]);

  // Loading state
  if (apartmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (apartmentError || !apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading apartment details.
      </div>
    );
  }

  // Calculate values for display
  const nights = calculateNights();
  const baseTotal = calculateBaseTotal();
  const guestFee = calculateGuestFee();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Book Your Stay</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src={apartment.primary_image || "/placeholder.jpg"} alt={apartment.title} className="w-10 h-10 rounded-md object-cover" />
              {apartment.title}
            </CardTitle>
            <p className="text-muted-foreground">{apartment.city}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Your Booking Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Selected Dates Display */}
                  <div className="space-y-3">
                    <div>
                      <Label>Selected Dates</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 p-3 border rounded-lg bg-muted/50">
                          <div className="text-sm text-muted-foreground">Check-in</div>
                          <div className="font-medium">
                            {formData.checkIn ? format(new Date(formData.checkIn), "PPP") : "Click a date on the calendar"}
                          </div>
                        </div>
                        <div className="flex-1 p-3 border rounded-lg bg-muted/50">
                          <div className="text-sm text-muted-foreground">Check-out</div>
                          <div className="font-medium">
                            {formData.checkOut ? format(new Date(formData.checkOut), "PPP") : "Click a date on the calendar"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        💡 Click on available (green) dates in the calendar below to select your stay
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      required
                    />
                  </div>

                  <h3 className="text-xl font-semibold mt-6 mb-4">Guest Information</h3>
                  <div>
                    <Label htmlFor="guestName">Full Name</Label>
                    <Input
                      id="guestName"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      required
                      disabled={isAuthenticated}
                      className={isAuthenticated ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestEmail">Email</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                      required
                      disabled={isAuthenticated}
                      className={isAuthenticated ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestPhone">Phone Number</Label>
                    <Input
                      id="guestPhone"
                      type="tel"
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                      required={!isAuthenticated}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !formData.checkIn || !formData.checkOut || nights <= 0}>
                    {loading ? "Booking..." : `Book Now for $${total.toFixed(2)}`}
                  </Button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Price Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>${apartment.base_price.toFixed(2)} x {nights} nights</span>
                      <span>${baseTotal.toFixed(2)}</span>
                    </div>
                    {!isAuthenticated && (
                      <div className="flex justify-between text-yellow-600">
                        <span>Guest fee ({guestFeePercentage}%)</span>
                        <span>${guestFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer-facing availability calendar */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-medium">Availability Calendar</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold text-lg">
                      {currentCalendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2">{day}</div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: calendarDays[0]?.date ? new Date(calendarDays[0].date).getDay() : 0 }, (_, i) => (
                      <div key={`empty-${i}`} className="h-24 border border-muted rounded-lg" />
                    ))}
                    
                    {/* Month dates */}
                    {calendarDays.filter(day => day.date).map((day, index) => (
                      <div
                        key={index}
                        className={`h-24 border border-muted rounded-lg p-2 relative transition-all ${
                          day.isAvailable ? 'hover:shadow-md hover:bg-muted/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        } ${
                          day.isToday ? 'ring-2 ring-primary' : ''
                        } ${
                          day.isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleCalendarDateClick(day)}
                      >
                        {/* Date number */}
                        <div className="text-sm font-medium mb-1">
                          {day.date ? day.date.getDate() : ""}
                        </div>
                        
                        {/* Visual availability indicator - just color, no text */}
                        <div className="flex items-center gap-1 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            day.isAvailable ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-xs font-medium text-green-600">
                          ${day.price?.toFixed(0) || apartment?.base_price?.toFixed(0) || "0"}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Available - Click to select</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span>Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span>Selected dates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {showPayment && bookingData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Complete Your Booking</h2>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <StripePayment
                  totalAmount={bookingData.total_amount}
                  currency="USD"
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};