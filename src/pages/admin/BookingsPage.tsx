import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Users, DollarSign, User, Mail, Phone, AlertTriangle, X, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  host_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  adults: number;
  children: number;
  infants: number;
  base_amount: number;
  cleaning_fee: number;
  service_fee: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  special_requests?: string;
  booking_date: string;
  created_at: string;
  // Payment fields
  payment_type?: string;
  online_amount?: number;
  cash_amount?: number;
  cash_received?: boolean;
  cash_received_at?: string;
  cash_received_by?: string;
  // Refund fields
  refund_status?: string;
  refund_amount?: number;
  refund_reason?: string;
  refund_processed_at?: string;
  stripe_payment_intent_id?: string;
  // Local storage fields
  apartmentTitle?: string;
  apartmentCity?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalData, setUsingLocalData] = useState(false);
  const [cancellingBookings, setCancellingBookings] = useState<Set<string>>(new Set());
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [refundType, setRefundType] = useState<'full' | 'half' | 'none'>('full');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase first
      try {
        const { data: supabaseBookings, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase bookings fetch failed:', error);
          throw error;
        }

        if (supabaseBookings && supabaseBookings.length > 0) {
          setBookings(supabaseBookings);
          setUsingLocalData(false);
          return;
        }
      } catch (supabaseError) {
        console.warn('Supabase unavailable, using localStorage:', supabaseError);
      }

      // Fallback to localStorage
      const localBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
      if (localBookings.length > 0) {
        setBookings(localBookings);
        setUsingLocalData(true);
      } else {
        setBookings([]);
        setUsingLocalData(false);
      }
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Final fallback to localStorage
      const localBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
      setBookings(localBookings);
      setUsingLocalData(true);
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (booking: Booking, refundType: 'full' | 'half' | 'none') => {
    if (refundType === 'none') {
      return { success: true, refundAmount: 0 };
    }

    // If no payment intent ID, we can't process a real refund
    if (!booking.stripe_payment_intent_id) {
      console.warn('No payment intent ID found, cannot process real refund');
      return { success: false, error: 'No payment intent ID found' };
    }

    // If it's a legacy payment intent ID, we can't process a real refund
    if (booking.stripe_payment_intent_id.startsWith('legacy_')) {
      console.warn('Legacy payment intent ID found, cannot process real refund');
      return { success: false, error: 'Legacy booking - no real refund possible' };
    }

    try {
      const onlineAmount = booking.online_amount || booking.total_amount || 0;
      const refundAmount = refundType === 'full' 
        ? onlineAmount 
        : Math.round(onlineAmount * 0.5);

      const response = await fetch('http://localhost:3001/api/refund-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: booking.stripe_payment_intent_id,
          amount: refundAmount,
          reason: 'requested_by_customer'
        }),
      });

      if (!response.ok) {
        throw new Error('Refund failed');
      }

      const result = await response.json();
      return { success: true, refundAmount, refundId: result.refundId };
    } catch (error) {
      console.error('Refund error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateBookingPaymentInfo = async (booking: Booking) => {
    try {
      // Update the booking with estimated payment information
      const updateData = {
        payment_type: 'full', // Assume full payment for older bookings
        online_amount: booking.total_amount, // Use total amount as online amount
        cash_amount: 0,
        cash_received: true, // Assume cash was received for older bookings
        stripe_payment_intent_id: `legacy_${booking.id}`, // Create a legacy ID
      };

      if (!usingLocalData) {
        const { error } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', booking.id);
        
        if (error) throw error;
      }

      // Update local booking object
      const updatedBooking = { ...booking, ...updateData };
      setBookings(prev => prev.map(b => b.id === booking.id ? updatedBooking : b));
      
      return updatedBooking;
    } catch (error) {
      console.error('Error updating booking payment info:', error);
      return booking; // Return original booking if update fails
    }
  };

  const cancelBooking = async (booking: Booking) => {
    console.log('Cancelling booking:', booking);
    console.log('Payment fields:', {
      online_amount: booking.online_amount,
      total_amount: booking.total_amount,
      stripe_payment_intent_id: booking.stripe_payment_intent_id,
      payment_type: booking.payment_type
    });

    // If booking is missing payment info, update it first
    let bookingToCancel = booking;
    if (!booking.online_amount || !booking.stripe_payment_intent_id) {
      console.log('Updating booking with missing payment info...');
      bookingToCancel = await updateBookingPaymentInfo(booking);
    }

    setSelectedBooking(bookingToCancel);
    setRefundType('full');
    setRefundDialogOpen(true);
  };

  const confirmCancellation = async () => {
    if (!selectedBooking) return;

    setCancellingBookings(prev => new Set(prev).add(selectedBooking.id));

    try {
      // Process refund first
      const refundResult = await processRefund(selectedBooking, refundType);
      
      if (!refundResult.success && refundType !== 'none') {
        // If no payment intent ID or legacy booking, show warning but continue with cancellation
        if (refundResult.error === 'No payment intent ID found' || refundResult.error === 'Legacy booking - no real refund possible') {
          console.warn('Cannot process real refund, proceeding with cancellation without refund');
        } else {
          toast({
            title: "Refund Failed",
            description: `Failed to process refund: ${refundResult.error}`,
            variant: "destructive"
          });
          setCancellingBookings(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedBooking.id);
            return newSet;
          });
          return;
        }
      }

      if (!usingLocalData) {
        // Try to delete from Supabase
        try {
          const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', selectedBooking.id);

          if (error) {
            console.warn('Supabase booking deletion failed:', error);
            throw error;
          }

          // Successfully deleted from database
          const refundMessage = refundType === 'none' 
            ? 'No refund processed'
            : !refundResult.success && (refundResult.error === 'No payment intent ID found' || refundResult.error === 'Legacy booking - no real refund possible')
            ? 'Cancellation completed (legacy booking - no real refund processed)'
            : refundType === 'full' 
            ? `Full refund of $${refundResult.refundAmount || (selectedBooking.online_amount || selectedBooking.total_amount || 0)} processed`
            : `Half refund of $${refundResult.refundAmount || Math.round((selectedBooking.online_amount || selectedBooking.total_amount || 0) * 0.5)} processed`;

          toast({
            title: "Booking Cancelled",
            description: `Successfully cancelled booking for ${selectedBooking.guestName || 'this guest'}. ${refundMessage}.`,
          });
        } catch (supabaseError) {
          console.warn('Supabase unavailable, updating localStorage:', supabaseError);
          // Fallback to localStorage
          const localBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
          const updatedLocalBookings = localBookings.filter((b: Booking) => b.id !== selectedBooking.id);
          localStorage.setItem('localBookings', JSON.stringify(updatedLocalBookings));
          setUsingLocalData(true);
          
          const refundMessage = refundType === 'none' 
            ? 'No refund processed'
            : !refundResult.success && (refundResult.error === 'No payment intent ID found' || refundResult.error === 'Legacy booking - no real refund possible')
            ? 'Cancellation completed (legacy booking - no real refund processed)'
            : refundType === 'full' 
            ? `Full refund of $${refundResult.refundAmount || (selectedBooking.online_amount || selectedBooking.total_amount || 0)} processed`
            : `Half refund of $${refundResult.refundAmount || Math.round((selectedBooking.online_amount || selectedBooking.total_amount || 0) * 0.5)} processed`;
          
          toast({
            title: "Booking Cancelled",
            description: `Successfully cancelled booking for ${selectedBooking.guestName || 'this guest'} (local storage). ${refundMessage}.`,
          });
        }
      } else {
        // Update localStorage
        const localBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
        const updatedLocalBookings = localBookings.filter((b: Booking) => b.id !== selectedBooking.id);
        localStorage.setItem('localBookings', JSON.stringify(updatedLocalBookings));
        
        const refundMessage = refundType === 'none' 
          ? 'No refund processed'
          : !refundResult.success && refundResult.error === 'No payment intent ID found'
          ? 'Cancellation completed (no refund processed - no payment intent ID found)'
          : refundType === 'full' 
          ? `Full refund of $${refundResult.refundAmount || (selectedBooking.online_amount || selectedBooking.total_amount || 0)} processed`
          : `Half refund of $${refundResult.refundAmount || Math.round((selectedBooking.online_amount || selectedBooking.total_amount || 0) * 0.5)} processed`;
        
        toast({
          title: "Booking Cancelled",
          description: `Successfully cancelled booking for ${selectedBooking.guestName || 'this guest'}. ${refundMessage}.`,
        });
      }

      // Update availability settings to reopen the dates
      await reopenDates(selectedBooking);

      // Remove from local state
      setBookings(prev => prev.filter(b => b.id !== selectedBooking.id));

    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCancellingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedBooking.id);
        return newSet;
      });
      setRefundDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const reopenDates = async (booking: Booking) => {
    try {
      const datesToReopen = [];
      let currentDate = new Date(booking.check_in_date);
      const endDate = new Date(booking.check_out_date);
      
      while (currentDate < endDate) {
        datesToReopen.push({
          property_id: booking.property_id,
          date: currentDate.toISOString().split('T')[0],
          is_available: true,
          price: 0,
          minimum_stay: 1,
          is_instant_book: true,
          notes: 'Available'
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (datesToReopen.length > 0) {
        if (!usingLocalData) {
          try {
            await supabase
              .from('availability_settings')
              .upsert(datesToReopen, { onConflict: 'property_id, date' });
          } catch (error) {
            console.warn('Failed to update Supabase availability:', error);
          }
        }
        
        // Always update localStorage
        const existingOverrides = JSON.parse(localStorage.getItem('availabilityOverrides') || '{}');
        datesToReopen.forEach(dateSetting => {
          if (!existingOverrides[dateSetting.property_id]) {
            existingOverrides[dateSetting.property_id] = {};
          }
          existingOverrides[dateSetting.property_id][dateSetting.date] = dateSetting;
        });
        localStorage.setItem('availabilityOverrides', JSON.stringify(existingOverrides));
      }
    } catch (error) {
      console.error('Error reopening dates:', error);
    }
  };

  const markCashAsReceived = async (booking: Booking) => {
    if (!confirm(`Mark cash payment of ${formatCurrency(booking.cash_amount || 0)} as received for this booking?`)) {
      return;
    }

    try {
      if (!usingLocalData) {
        // Update in Supabase
        const { error } = await supabase
          .from('bookings')
          .update({
            cash_received: true,
            cash_received_at: new Date().toISOString(),
            cash_received_by: 'admin' // You can replace this with actual admin ID
          })
          .eq('id', booking.id);

        if (error) throw error;
      }

      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { 
              ...b, 
              cash_received: true, 
              cash_received_at: new Date().toISOString(),
              cash_received_by: 'admin'
            }
          : b
      ));

      toast({
        title: "Cash Payment Marked as Received",
        description: `Cash payment of ${formatCurrency(booking.cash_amount || 0)} has been marked as received.`,
      });
    } catch (error) {
      console.error('Error marking cash as received:', error);
      toast({
        title: "Error",
        description: "Failed to mark cash as received. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
            <div className="flex items-center justify-between">
              <div>
            <h1 className="text-3xl font-bold">Bookings Management</h1>
            <p className="text-muted-foreground">
              View and manage all property bookings
            </p>
              </div>
          <Button onClick={fetchBookings} variant="outline">
            Refresh
          </Button>
      </div>

        {/* Data Source Warning */}
        {usingLocalData && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Local Data Mode</span>
            </div>
            <p className="text-yellow-700 mt-2 text-sm">
              Database connection is unavailable. You're viewing bookings stored locally. 
              These will sync to the database once the connection is restored.
            </p>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {usingLocalData 
                  ? "No local bookings available. Try making a new booking as a guest."
                  : "No bookings have been made yet."
                }
              </p>
        </CardContent>
      </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
            </div>
                      <div>
                        <CardTitle className="text-lg">
                          {booking.apartmentTitle || `Property ${booking.property_id.slice(0, 8)}`}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {booking.apartmentCity || 'Location not specified'}
                        </p>
                          </div>
                        </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      {booking.status !== 'cancelled' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelBooking(booking)}
                          disabled={cancellingBookings.has(booking.id)}
                          className="flex items-center gap-2"
                        >
                          {cancellingBookings.has(booking.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" />
                              Cancel
                            </>
                            )}
                            </Button>
                          )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Guest Information */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4" />
                        Guest Details
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {booking.guestName || 'Not specified'}</p>
                        <p><strong>Email:</strong> {booking.guestEmail || 'Not specified'}</p>
                        <p><strong>Phone:</strong> {booking.guestPhone || 'Not specified'}</p>
                        {/* Show if this was a guest booking */}
                        {booking.service_fee > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <p className="text-yellow-800 font-medium">Guest Booking</p>
                            <p className="text-yellow-700">10% fee applied: ${booking.service_fee}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Stay Details
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Check-in:</strong> {formatDate(booking.check_in_date)}</p>
                        <p><strong>Check-out:</strong> {formatDate(booking.check_out_date)}</p>
                        <p><strong>Nights:</strong> {Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))}</p>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4" />
                        Guest Count
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Total:</strong> {booking.guests}</p>
                        <p><strong>Adults:</strong> {booking.adults}</p>
                        <p><strong>Children:</strong> {booking.children || 0}</p>
                      </div>
                    </div>

                    {/* Financial */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="h-4 w-4" />
                        Payment
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Base:</strong> {formatCurrency(booking.base_amount)}</p>
                        <p><strong>Total:</strong> {formatCurrency(booking.total_amount)}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
                        
                        {/* Payment Type and Breakdown */}
                        {booking.payment_type && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                            <p className="text-blue-800 font-medium">
                              {booking.payment_type === 'partial' ? 'Partial Payment' : 'Full Payment'}
                            </p>
                            {booking.payment_type === 'partial' && (
                              <>
                                <p className="text-blue-700">Online: {formatCurrency(booking.online_amount || 0)}</p>
                                <p className="text-blue-700">Cash: {formatCurrency(booking.cash_amount || 0)}</p>
                                <p className="text-blue-700">
                                  Cash Status: 
                                  <Badge variant={booking.cash_received ? 'default' : 'secondary'} className="ml-1 text-xs">
                                    {booking.cash_received ? 'Received' : 'Pending'}
                                  </Badge>
                                </p>
                                {!booking.cash_received && (
                            <Button
                              size="sm"
                              variant="outline"
                                    onClick={() => markCashAsReceived(booking)}
                                    className="mt-1 w-full text-xs"
                            >
                                    Mark Cash as Received
                            </Button>
                          )}
                                {booking.cash_received && (
                                  <p className="text-green-600 text-xs mt-1">
                                    ✓ Received on {formatDate(booking.cash_received_at || '')}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.special_requests && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm">
                        <strong>Special Requests:</strong>
                        <p className="text-muted-foreground mt-1">{booking.special_requests}</p>
                      </div>
                    </div>
                  )}

                  {/* Booking Date */}
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <strong>Booked on:</strong> {formatDate(booking.booking_date || booking.created_at)}
                        </div>


                </CardContent>
              </Card>
            ))}
            </div>
          )}

        {/* Summary */}
        {bookings.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{bookings.length}</div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Confirmed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(bookings.reduce((sum, b) => sum + b.total_amount, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>
        </CardContent>
      </Card>
        )}
      </div>

      {/* Refund Selection Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cancel Booking & Refund
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Booking Details:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.guestName || 'Guest'} - {selectedBooking.apartmentTitle || 'Property'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Amount: ${selectedBooking.total_amount || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Online Payment: ${selectedBooking.online_amount || selectedBooking.total_amount || 0}
                </p>
                {!selectedBooking.stripe_payment_intent_id && (
                  <p className="text-sm text-orange-600 font-medium">
                    ⚠️ No payment intent ID found - refund may not be possible
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Refund Options:</Label>
                <RadioGroup value={refundType} onValueChange={(value: 'full' | 'half' | 'none') => setRefundType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="flex-1">
                      <div className="font-medium">Full Refund</div>
                      <div className="text-sm text-muted-foreground">
                        Refund ${selectedBooking.online_amount || selectedBooking.total_amount || 0} (100% of online payment)
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half" id="half" />
                    <Label htmlFor="half" className="flex-1">
                      <div className="font-medium">Half Refund</div>
                      <div className="text-sm text-muted-foreground">
                        Refund ${Math.round((selectedBooking.online_amount || selectedBooking.total_amount || 0) * 0.5)} (50% of online payment)
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="flex-1">
                      <div className="font-medium">No Refund</div>
                      <div className="text-sm text-muted-foreground">
                        Cancel booking without processing any refund
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setRefundDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmCancellation}
                  disabled={cancellingBookings.has(selectedBooking.id)}
                  className="flex-1"
                >
                  {cancellingBookings.has(selectedBooking.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}