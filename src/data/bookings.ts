export interface Booking {
  id: string;
  apartmentId: string;
  apartmentName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export const mockBookings: Booking[] = [
  {
    id: "booking-1",
    apartmentId: "1",
    apartmentName: "Modern Downtown Loft",
    guestName: "Sarah Johnson",
    guestEmail: "sarah.johnson@email.com",
    guestPhone: "+1 (555) 123-4567",
    checkIn: "2024-12-20",
    checkOut: "2024-12-23",
    guests: 2,
    totalPrice: 360,
    status: 'confirmed',
    createdAt: "2024-12-15T10:30:00Z"
  },
  {
    id: "booking-2",
    apartmentId: "2",
    apartmentName: "Cozy Garden Apartment",
    guestName: "Michael Brown",
    guestEmail: "m.brown@email.com",
    guestPhone: "+1 (555) 987-6543",
    checkIn: "2024-12-25",
    checkOut: "2024-12-28",
    guests: 4,
    totalPrice: 255,
    status: 'pending',
    createdAt: "2024-12-16T14:22:00Z"
  },
  {
    id: "booking-3",
    apartmentId: "3",
    apartmentName: "Luxury Penthouse Suite",
    guestName: "Emily Davis",
    guestEmail: "emily.davis@email.com",
    guestPhone: "+1 (555) 456-7890",
    checkIn: "2024-12-30",
    checkOut: "2025-01-02",
    guests: 2,
    totalPrice: 750,
    status: 'confirmed',
    createdAt: "2024-12-17T09:15:00Z"
  }
];