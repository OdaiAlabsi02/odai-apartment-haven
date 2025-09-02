import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Mail, Phone, User, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface BookingRow {
  id: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  apartmentTitle?: string;
  apartmentCity?: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_amount: number;
  status: string;
  service_fee?: number;
  created_at?: string;
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalData, setUsingLocalData] = useState(false);

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      setLoading(true);

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          setBookings(data as unknown as BookingRow[]);
          setUsingLocalData(false);
          return;
        }
      } catch (e) {
        // fall through to local
        setUsingLocalData(true);
      }

      // Fallback to localStorage (bookings saved from BookingPage fallback)
      const localBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
      // Map local booking shape to dashboard row
      const mapped: BookingRow[] = (localBookings as any[])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(b => ({
          id: b.id,
          guestName: b.guestName,
          guestEmail: b.guestEmail,
          guestPhone: b.guestPhone,
          apartmentTitle: b.apartmentTitle,
          apartmentCity: b.apartmentCity,
          check_in_date: b.checkIn,
          check_out_date: b.checkOut,
          guests: parseInt(b.guests || '1'),
          total_amount: b.totalPrice,
          status: b.status || 'confirmed',
          service_fee: b.guestFee || 0,
          created_at: b.createdAt
        }));
      setBookings(mapped);
      setUsingLocalData(true);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const revenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    return { total, confirmed, pending, revenue };
  }, [bookings]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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
        <Button variant="outline" onClick={fetchRecentBookings}>Refresh</Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold text-green-600">
                  {stats.confirmed}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                {stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%
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
                  ${stats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-green-600">
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
            {usingLocalData ? 'Showing local bookings (offline mode)' : 'Manage and track all apartment reservations'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Property</TableHead>
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
                        <div className="font-medium">{booking.guestName || '—'}</div>
                        {booking.guestEmail && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {booking.guestEmail}
                          </div>
                        )}
                        {booking.guestPhone && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {booking.guestPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.apartmentTitle || `Property`}</div>
                      <div className="text-xs text-muted-foreground">{booking.apartmentCity || ''}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(booking.check_in_date)}</div>
                        <div className="text-muted-foreground">to {formatDate(booking.check_out_date)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {booking.guests}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${booking.total_amount?.toLocaleString()}
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
                          <ToggleRight className="h-4 w-4 text-green-600" />
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