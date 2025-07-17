import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Mail, Phone, User, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { mockBookings, Booking } from "@/data/bookings";

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const toggleBookingStatus = (bookingId: string) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        const newStatus = booking.status === 'pending' ? 'confirmed' : 'pending';
        return { ...booking, status: newStatus };
      }
      return booking;
    }));
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage bookings and monitor apartment reservations
          </p>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-success">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <Badge className="bg-success text-success-foreground">
                {Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <Badge className="bg-warning text-warning-foreground">
                {Math.round((bookings.filter(b => b.status === 'pending').length / bookings.length) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${bookings.reduce((sum, booking) => sum + booking.totalPrice, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-success">
                +12% this month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <p className="text-muted-foreground">
            Manage and track all apartment reservations
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Apartment</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-sm">
                      {booking.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.guestName}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {booking.guestEmail}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.guestPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.apartmentName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(booking.checkIn)}</div>
                        <div className="text-muted-foreground">to {formatDate(booking.checkOut)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {booking.guests}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${booking.totalPrice}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookingStatus(booking.id)}
                        className="p-1"
                      >
                        {booking.status === 'pending' ? (
                          <ToggleLeft className="h-4 w-4" />
                        ) : (
                          <ToggleRight className="h-4 w-4 text-success" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 