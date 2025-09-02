import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Users, MapPin, DollarSign, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingData {
  id: string;
  apartmentTitle: string;
  apartmentCity: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  nights: number;
  basePrice: number;
  guestFee: number;
  totalPrice: number;
  status: string;
  isAuthenticated: boolean;
  guestFeePercentage: number;
  paymentId?: string;
  onlineAmount?: number;
  cashAmount?: number;
}

export const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const latestBooking = localStorage.getItem("latestBooking");
    if (latestBooking) {
      setBookingData(JSON.parse(latestBooking));
    }
  }, []);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find your booking information.
            </p>
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-muted-foreground">
            Your stay at {bookingData.apartmentTitle} has been successfully booked.
          </p>
        </div>

        {/* Authentication Status */}
        <div className="mb-6 text-center">
          {bookingData.isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <UserCheck className="h-4 w-4" />
              <span className="font-medium">Signed in user - No additional fees</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Guest booking - {bookingData.guestFeePercentage}% fee applied</span>
            </div>
          )}
        </div>

        {/* Booking Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking ID */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="font-mono font-semibold text-lg">{bookingData.id}</p>
            </div>

            {/* Property Information */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{bookingData.apartmentTitle}</h3>
                <p className="text-muted-foreground">{bookingData.apartmentCity}</p>
              </div>
            </div>

            {/* Stay Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="font-semibold">{formatDate(bookingData.checkIn)}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="font-semibold">{formatDate(bookingData.checkOut)}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Guests</p>
                <p className="font-semibold">{bookingData.guests} {parseInt(bookingData.guests) === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>

            {/* Guest Information */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Guest Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{bookingData.guestName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{bookingData.guestEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{bookingData.guestPhone}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base price ({bookingData.nights} nights)</span>
                  <span>${bookingData.basePrice}</span>
                </div>
                
                {!bookingData.isAuthenticated && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Guest fee ({bookingData.guestFeePercentage}%)</span>
                    <span>${bookingData.guestFee}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                  <span>Total</span>
                  <span>${bookingData.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {bookingData.paymentId && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                  <DollarSign className="h-5 w-5" />
                  Payment Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Paid Online</span>
                    </div>
                    <span className="font-semibold text-green-600">${bookingData.onlineAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="font-medium">Cash on Arrival</span>
                    </div>
                    <span className="font-semibold text-orange-600">${bookingData.cashAmount}</span>
                  </div>
                  
                  <div className="text-sm text-blue-700 mt-2">
                    <p>✅ Online payment completed successfully</p>
                    <p>💳 Payment ID: {bookingData.paymentId}</p>
                    <p>💰 Please bring ${bookingData.cashAmount} in cash when you arrive</p>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Fee Notice */}
            {!bookingData.isAuthenticated && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-1">Guest Fee Applied</h5>
                    <p className="text-sm text-yellow-700">
                                            A {bookingData.guestFeePercentage}% fee was added to your booking because you're not signed in. 
                      Sign up for an account to avoid this fee on future bookings and get access to exclusive deals!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Return to Home
          </Button>
          
          {!bookingData.isAuthenticated && (
            <Button 
              onClick={() => navigate("/signup")}
              className="flex-1 sm:flex-none"
            >
              Sign Up & Save on Future Bookings
            </Button>
          )}
          
          <Button 
            onClick={() => navigate("/apartments")}
            className="flex-1 sm:flex-none"
          >
            Browse More Properties
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email with all the details shortly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Property Details</p>
                  <p className="text-sm text-muted-foreground">
                    Check your email for check-in instructions and property details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Enjoy Your Stay</p>
                  <p className="text-sm text-muted-foreground">
                    We hope you have a wonderful time at {bookingData.apartmentTitle}!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};