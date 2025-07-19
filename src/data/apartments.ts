export interface Apartment {
  id: string;
  name: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  bathrooms: number;
  description: string;
  featured: boolean;
  is_draft?: boolean;
  updated_at?: string;
  
  // Location details (individual fields)
  street_name?: string;
  building_number?: string;
  apartment_number?: string;
  additional_details?: string;
  google_location?: string;
  latitude?: number;
  longitude?: number;
  
  // Image details (individual fields)
  primary_image?: string;
  image_urls?: string[];
  image_count?: number;
  
  // Bedroom details (individual fields)
  bedrooms: number;
  total_beds: number;
  bedroom_1_beds?: number;
  bedroom_1_bed_types?: string[];
  bedroom_2_beds?: number;
  bedroom_2_bed_types?: string[];
  bedroom_3_beds?: number;
  bedroom_3_bed_types?: string[];
  bedroom_4_beds?: number;
  bedroom_4_bed_types?: string[];
  bedroom_5_beds?: number;
  bedroom_5_bed_types?: string[];
  
  // Amenities (individual boolean fields)
  wifi?: boolean;
  air_conditioning?: boolean;
  heating?: boolean;
  kitchen?: boolean;
  washer?: boolean;
  dryer?: boolean;
  parking?: boolean;
  elevator?: boolean;
  gym?: boolean;
  pool?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  tv?: boolean;
  netflix?: boolean;
  workspace?: boolean;
  iron?: boolean;
  hair_dryer?: boolean;
  shampoo?: boolean;
  soap?: boolean;
  towels?: boolean;
  bed_linen?: boolean;
  coffee_maker?: boolean;
  microwave?: boolean;
  dishwasher?: boolean;
  refrigerator?: boolean;
  oven?: boolean;
  stove?: boolean;
  bbq?: boolean;
  garden?: boolean;
  security?: boolean;
  smoke_detector?: boolean;
  first_aid?: boolean;
  fire_extinguisher?: boolean;
}

export const apartments: Apartment[] = [
  {
    id: "1",
    name: "Modern Downtown Loft",
    location: "City Center, Downtown",
    price_per_night: 120,
    max_guests: 4,
    bathrooms: 2,
    description: "A stunning modern loft in the heart of downtown. Features floor-to-ceiling windows, exposed brick walls, and contemporary furnishings. Perfect for business travelers or couples looking for a luxurious stay.",
    featured: true,
    bedrooms: 2,
    total_beds: 2,
    wifi: true,
    air_conditioning: true,
    kitchen: true,
    parking: true,
    tv: true,
    iron: true,
    hair_dryer: true,
    shampoo: true,
    soap: true,
    towels: true,
    bed_linen: true,
    coffee_maker: true,
    microwave: true,
    refrigerator: true,
    oven: true,
    stove: true,
    bbq: true,
    garden: true,
    security: true,
    smoke_detector: true,
    first_aid: true,
    fire_extinguisher: true,
    primary_image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    image_urls: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
    ],
    image_count: 3,
    street_name: "Main St",
    building_number: "100",
    apartment_number: "A1",
    additional_details: "Close to public transport",
    google_location: "https://www.google.com/maps/place/Main+St+100+A1",
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: "2",
    name: "Cozy Garden Apartment",
    location: "Green District, Suburbs",
    price_per_night: 85,
    max_guests: 6,
    bathrooms: 2,
    description: "Charming apartment with a beautiful garden view. Peaceful neighborhood perfect for families or those seeking tranquility while staying close to the city.",
    featured: true,
    bedrooms: 3,
    total_beds: 3,
    wifi: true,
    kitchen: true,
    parking: true,
    bbq: true,
    garden: true,
    primary_image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    image_urls: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"
    ],
    image_count: 2,
    street_name: "Oak Ave",
    building_number: "200",
    apartment_number: "B2",
    additional_details: "Near a park",
    google_location: "https://www.google.com/maps/place/Oak+Ave+200+B2",
    latitude: 40.7500,
    longitude: -73.9800
  },
  {
    id: "3",
    name: "Luxury Penthouse Suite",
    location: "Uptown, Financial District",
    price_per_night: 250,
    max_guests: 2,
    bathrooms: 2,
    description: "Exclusive penthouse with panoramic city views. Premium amenities and sophisticated design make this the perfect choice for luxury travelers.",
    featured: false,
    bedrooms: 1,
    total_beds: 1,
    wifi: true,
    parking: true,
    tv: true,
    primary_image: "https://images.unsplash.com/photo-1515263487990-61b07816b500?w=800",
    image_urls: [
      "https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800"
    ],
    image_count: 2,
    street_name: "Pine Ln",
    building_number: "300",
    apartment_number: "C3",
    additional_details: "Near a gym",
    google_location: "https://www.google.com/maps/place/Pine+Ln+300+C3",
    latitude: 40.7000,
    longitude: -74.0100
  },
  {
    id: "4",
    name: "Artist's Studio",
    location: "Arts Quarter, Midtown",
    price_per_night: 95,
    max_guests: 2,
    bathrooms: 1,
    description: "Creative space in the vibrant Arts Quarter. High ceilings, natural light, and artistic atmosphere perfect for creative professionals.",
    featured: false,
    bedrooms: 1,
    total_beds: 1,
    wifi: true,
    workspace: true,
    primary_image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    image_urls: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800",
      "https://images.unsplash.com/photo-1571088724734-2a8e3b8174fb?w=800"
    ],
    image_count: 2,
    street_name: "Maple St",
    building_number: "400",
    apartment_number: "D4",
    additional_details: "Near a gallery",
    google_location: "https://www.google.com/maps/place/Maple+St+400+D4",
    latitude: 40.7200,
    longitude: -74.0050
  }
];