import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Calendar, Users, MapPin, Mail, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingData {
  apartment: any;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  nights: number;
  totalPrice: number;
  bookingId: string;
}

export const BookingConfirmationPage = () => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const pendingBooking = localStorage.getItem("pendingBooking");
    if (pendingBooking) {
      setBookingData(JSON.parse(pendingBooking));
      localStorage.removeItem("pendingBooking");
    }
  }, []);

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Booking Found</h1>
          <Link to="/">
            <Button variant="outline">Return Home</Button>
          </Link>
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
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for choosing Odai's Apartments. Your booking has been submitted successfully.
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Booking ID: {bookingData.bookingId}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Apartment Info */}
              <div className="flex space-x-4">
                <img
                  src={bookingData.apartment.primary_image || bookingData.apartment.image_urls?.[0] || '/placeholder.svg'}
                  alt={bookingData.apartment.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{bookingData.apartment.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {bookingData.apartment.location}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${bookingData.apartment.price_per_night} per night
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm font-medium">Check-in</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(bookingData.checkIn)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm font-medium">Check-out</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(bookingData.checkOut)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm font-medium">Guests</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.guests} guest{bookingData.guests !== "1" ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm font-medium">Total Nights</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.nights} night{bookingData.nights !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="py-4 border-t">
                <h4 className="font-medium mb-3">Guest Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{bookingData.guestName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{bookingData.guestEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{bookingData.guestPhone}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-4 border-t">
                <h4 className="font-medium mb-3">Price Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${bookingData.apartment.price_per_night} × {bookingData.nights} nights</span>
                    <span>${bookingData.totalPrice}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>${bookingData.totalPrice}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a confirmation email with all the details shortly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Direct Contact</p>
                    <p className="text-sm text-muted-foreground">
                      Odai will contact you directly to finalize arrangements and provide check-in instructions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Enjoy Your Stay</p>
                    <p className="text-sm text-muted-foreground">
                      Arrive on your check-in date and enjoy your stay!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
            <Link to="/apartments" className="flex-1">
              <Button className="w-full bg-button-gradient hover:opacity-90 transition-opacity">
                Browse More Apartments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};