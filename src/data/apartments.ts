export interface Apartment {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  images: string[];
  description: string;
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  featured: boolean;
}

export const apartments: Apartment[] = [
  {
    id: "1",
    name: "Modern Downtown Loft",
    location: "City Center, Downtown",
    pricePerNight: 120,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
    ],
    description: "A stunning modern loft in the heart of downtown. Features floor-to-ceiling windows, exposed brick walls, and contemporary furnishings. Perfect for business travelers or couples looking for a luxurious stay.",
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Full Kitchen",
      "Washer & Dryer",
      "Parking",
      "Smart TV",
      "Coffee Machine"
    ],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    featured: true
  },
  {
    id: "2",
    name: "Cozy Garden Apartment",
    location: "Green District, Suburbs",
    pricePerNight: 85,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"
    ],
    description: "Charming apartment with a beautiful garden view. Peaceful neighborhood perfect for families or those seeking tranquility while staying close to the city.",
    amenities: [
      "Free WiFi",
      "Garden Access",
      "Kitchen",
      "Pet Friendly",
      "Bicycle Rental",
      "BBQ Area"
    ],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    featured: true
  },
  {
    id: "3",
    name: "Luxury Penthouse Suite",
    location: "Uptown, Financial District",
    pricePerNight: 250,
    images: [
      "https://images.unsplash.com/photo-1515263487990-61b07816b500?w=800",
      "https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800"
    ],
    description: "Exclusive penthouse with panoramic city views. Premium amenities and sophisticated design make this the perfect choice for luxury travelers.",
    amenities: [
      "Free WiFi",
      "City View",
      "Concierge Service",
      "Gym Access",
      "Pool",
      "Valet Parking",
      "Smart Home System"
    ],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 2,
    featured: false
  },
  {
    id: "4",
    name: "Artist's Studio",
    location: "Arts Quarter, Midtown",
    pricePerNight: 95,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800",
      "https://images.unsplash.com/photo-1571088724734-2a8e3b8174fb?w=800"
    ],
    description: "Creative space in the vibrant Arts Quarter. High ceilings, natural light, and artistic atmosphere perfect for creative professionals.",
    amenities: [
      "Free WiFi",
      "Natural Light",
      "Art Supplies",
      "Coffee Machine",
      "Workspace",
      "Gallery Nearby"
    ],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    featured: false
  }
];