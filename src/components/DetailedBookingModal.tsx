import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, MapPin, DollarSign, Building, Bed, Bath, Car, Star, Clock, CreditCard, Receipt } from 'lucide-react';

interface DetailedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  property?: any;
}

export const DetailedBookingModal: React.FC<DetailedBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  property
}) => {
  if (!booking) return null;

  // Extract property from booking if it's nested there
  const propertyData = property || booking.property;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.check_in_date || booking.checkIn);
    const checkOut = new Date(booking.check_out_date || booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {propertyData?.title || booking.apartmentTitle || 'Property'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {propertyData?.city || booking.apartmentCity}, {propertyData?.state}, {propertyData?.country}
                    </span>
                  </div>
                </div>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-sm">
                  {booking.status.toUpperCase()}
                </Badge>
              </div>

              {/* Property Details Grid */}
              {propertyData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{propertyData.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{propertyData.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Max {propertyData.max_guests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{propertyData.property_type || 'Apartment'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stay Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Check-in Date</span>
                    <span className="font-medium">
                      {formatDate(booking.check_in_date || booking.checkIn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Check-out Date</span>
                    <span className="font-medium">
                      {formatDate(booking.check_out_date || booking.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{nights} nights</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Number of Guests</span>
                    <span className="font-medium">{booking.guests} guests</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Booking Date</span>
                    <span className="font-medium">
                      {formatDate(booking.created_at || booking.createdAt || new Date())}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {booking.id}
                    </span>
                  </div>
                  {booking.paymentId && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment ID</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {booking.paymentId}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Breakdown
              </h4>

              <div className="space-y-3">
                {/* Base Price */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Base Price ({nights} nights × {formatCurrency(propertyData?.base_price || (booking.total_amount / nights))})
                  </span>
                  <span className="font-medium">
                    {formatCurrency(propertyData?.base_price ? propertyData.base_price * nights : booking.total_amount)}
                  </span>
                </div>

                {/* Cleaning Fee */}
                {propertyData?.cleaning_fee && propertyData.cleaning_fee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cleaning Fee</span>
                    <span className="font-medium">{formatCurrency(propertyData.cleaning_fee)}</span>
                  </div>
                )}

                {/* Service Fee */}
                {booking.service_fee && booking.service_fee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">{formatCurrency(booking.service_fee)}</span>
                  </div>
                )}

                {/* Guest Fee for non-authenticated users */}
                {!booking.isAuthenticated && booking.guestFeePercentage && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Guest Fee ({booking.guestFeePercentage}%)
                    </span>
                    <span className="font-medium text-yellow-600">
                      {formatCurrency(booking.guestFee || 0)}
                    </span>
                  </div>
                )}

                {/* Tax */}
                {booking.tax_amount && booking.tax_amount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(booking.tax_amount)}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(booking.total_amount || booking.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Payment Information */}
                {booking.paymentId && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Payment Type:</span>
                        <Badge variant={booking.payment_type === 'partial' ? 'secondary' : 'default'}>
                          {booking.payment_type === 'partial' ? 'Partial Payment (50% Online)' : 'Full Payment (100% Online)'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Online Payment:</span>
                        <span className="font-medium">{formatCurrency(booking.onlineAmount || booking.online_amount || 0)}</span>
                      </div>
                      {booking.payment_type === 'partial' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Cash on Arrival:</span>
                            <span className="font-medium">{formatCurrency(booking.cashAmount || booking.cash_amount || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Cash Status:</span>
                            <Badge variant={booking.cash_received ? 'default' : 'secondary'}>
                              {booking.cash_received ? 'Received' : 'Pending'}
                            </Badge>
                          </div>
                          {booking.cash_received && (
                            <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-100 rounded">
                              Cash received on {formatDate(booking.cash_received_at || new Date())}
                              {booking.cash_received_by && ` by Admin`}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {propertyData?.description && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-4">Property Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {propertyData.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Special Requests */}
          {booking.special_requests && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-4">Special Requests</h4>
                <p className="text-muted-foreground">
                  {booking.special_requests}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
