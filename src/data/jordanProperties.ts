export interface JordanProperty {
  id: string;
  title: string;
  description: string;
  city: string;
  base_price: number;
  property_type: string;
  property_subtype: string;
  unit_size: number;
  unit_size_unit: string;
  building_floors?: number;
  listing_floor?: number;
  building_age?: number;
  featured: boolean;
  image_url: string;
  amenities: string[];
  rating: number;
  review_count: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
}

export const jordanProperties: JordanProperty[] = [
  // Amman Properties
  {
    id: "1",
    title: "Modern Apartment in Rainbow Street",
    description: "Stylish apartment in the heart of Amman's cultural district, walking distance to cafes and galleries.",
    city: "Amman",
    base_price: 85,
    property_type: "Apartment",
    property_subtype: "Modern",
    unit_size: 120,
    unit_size_unit: "sqm",
    building_floors: 8,
    listing_floor: 5,
    building_age: 5,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Balcony", "TV"],
    rating: 4.8,
    review_count: 24,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    location: "Rainbow Street, Amman"
  },
  {
    id: "2",
    title: "Luxury Villa in Abdoun",
    description: "Spacious villa with private garden and pool in Amman's most prestigious neighborhood.",
    city: "Amman",
    base_price: 200,
    property_type: "Villa",
    property_subtype: "Luxury",
    unit_size: 300,
    unit_size_unit: "sqm",
    building_floors: 2,
    listing_floor: 1,
    building_age: 3,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Garden", "BBQ", "TV"],
    rating: 4.9,
    review_count: 18,
    guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    location: "Abdoun, Amman"
  },
  {
    id: "3",
    title: "Cozy Studio in Downtown",
    description: "Perfect for solo travelers, this studio offers comfort and convenience in downtown Amman.",
    city: "Amman",
    base_price: 45,
    property_type: "Apartment",
    property_subtype: "Studio",
    unit_size: 35,
    unit_size_unit: "sqm",
    building_floors: 6,
    listing_floor: 3,
    building_age: 10,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "TV", "Workspace"],
    rating: 4.5,
    review_count: 12,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    location: "Downtown Amman"
  },

  // Petra Properties
  {
    id: "4",
    title: "Historic Apartment Near Petra",
    description: "Traditional stone apartment with modern amenities, just 5 minutes from Petra's entrance.",
    city: "Petra",
    base_price: 75,
    property_type: "Apartment",
    property_subtype: "Traditional",
    unit_size: 90,
    unit_size_unit: "sqm",
    building_floors: 3,
    listing_floor: 2,
    building_age: 15,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Balcony", "TV"],
    rating: 4.7,
    review_count: 31,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    location: "Wadi Musa, Petra"
  },
  {
    id: "5",
    title: "Desert Camp Under the Stars",
    description: "Authentic Bedouin camp experience with luxury tents and traditional Jordanian hospitality.",
    city: "Petra",
    base_price: 120,
    property_type: "Desert Camp",
    property_subtype: "Luxury Tent",
    unit_size: 25,
    unit_size_unit: "sqm",
    featured: true,
    image_url: "https://images.unsplash.com/photo-1506905925346-14b1e0d0b0b0?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Heating", "Bed Linen", "Towels", "BBQ", "Garden"],
    rating: 4.9,
    review_count: 45,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    location: "Wadi Rum Desert"
  },

  // Wadi Rum Properties
  {
    id: "6",
    title: "Luxury Desert Villa",
    description: "Modern villa with panoramic desert views and private pool in the heart of Wadi Rum.",
    city: "Wadi Rum",
    base_price: 180,
    property_type: "Villa",
    property_subtype: "Desert",
    unit_size: 250,
    unit_size_unit: "sqm",
    building_floors: 2,
    listing_floor: 1,
    building_age: 2,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Garden", "BBQ", "TV"],
    rating: 4.8,
    review_count: 22,
    guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    location: "Wadi Rum Village"
  },
  {
    id: "7",
    title: "Traditional Bedouin Tent",
    description: "Authentic Bedouin experience with traditional tent accommodation and desert activities.",
    city: "Wadi Rum",
    base_price: 65,
    property_type: "Desert Camp",
    property_subtype: "Traditional Tent",
    unit_size: 20,
    unit_size_unit: "sqm",
    featured: false,
    image_url: "https://images.unsplash.com/photo-1506905925346-14b1e0d0b0b0?w=800&h=600&fit=crop",
    amenities: ["Heating", "Bed Linen", "Towels", "BBQ"],
    rating: 4.6,
    review_count: 38,
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    location: "Wadi Rum Protected Area"
  },

  // Aqaba Properties
  {
    id: "8",
    title: "Seaside Villa in Aqaba",
    description: "Stunning villa with direct beach access and Red Sea views, perfect for diving enthusiasts.",
    city: "Aqaba",
    base_price: 150,
    property_type: "Villa",
    property_subtype: "Seaside",
    unit_size: 200,
    unit_size_unit: "sqm",
    building_floors: 2,
    listing_floor: 1,
    building_age: 4,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Garden", "BBQ", "TV"],
    rating: 4.9,
    review_count: 28,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    location: "Aqaba Beach"
  },
  {
    id: "9",
    title: "Modern Apartment with Sea View",
    description: "Contemporary apartment with panoramic Red Sea views and modern amenities.",
    city: "Aqaba",
    base_price: 95,
    property_type: "Apartment",
    property_subtype: "Modern",
    unit_size: 110,
    unit_size_unit: "sqm",
    building_floors: 12,
    listing_floor: 8,
    building_age: 3,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Balcony", "TV"],
    rating: 4.7,
    review_count: 19,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    location: "Aqaba Marina"
  },

  // Dead Sea Properties
  {
    id: "10",
    title: "Luxury Resort Villa",
    description: "Exclusive villa with private beach access to the healing waters of the Dead Sea.",
    city: "Dead Sea",
    base_price: 300,
    property_type: "Villa",
    property_subtype: "Resort",
    unit_size: 400,
    unit_size_unit: "sqm",
    building_floors: 2,
    listing_floor: 1,
    building_age: 1,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Garden", "BBQ", "TV", "Spa"],
    rating: 5.0,
    review_count: 15,
    guests: 10,
    bedrooms: 5,
    bathrooms: 5,
    location: "Dead Sea Resort Area"
  },
  {
    id: "11",
    title: "Spa Hotel Suite",
    description: "Luxurious suite with Dead Sea views and access to world-class spa facilities.",
    city: "Dead Sea",
    base_price: 180,
    property_type: "Boutique Hotel",
    property_subtype: "Suite",
    unit_size: 80,
    unit_size_unit: "sqm",
    building_floors: 8,
    listing_floor: 6,
    building_age: 2,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "TV", "Spa", "Pool", "Gym"],
    rating: 4.8,
    review_count: 42,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    location: "Dead Sea Spa Hotel"
  },

  // Jerash Properties
  {
    id: "12",
    title: "Historic Guesthouse in Jerash",
    description: "Traditional guesthouse near the ancient Roman ruins, offering authentic Jordanian hospitality.",
    city: "Jerash",
    base_price: 60,
    property_type: "Guesthouse",
    property_subtype: "Traditional",
    unit_size: 70,
    unit_size_unit: "sqm",
    building_floors: 2,
    listing_floor: 1,
    building_age: 20,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Garden", "TV"],
    rating: 4.5,
    review_count: 16,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    location: "Jerash Old Town"
  },

];

export const popularDestinations = [
  { name: "Amman", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop" },
  { name: "Petra", image: "https://images.unsplash.com/photo-1506905925346-14b1e0d0b0b0?w=400&h=300&fit=crop" },
  { name: "Wadi Rum", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop" },
  { name: "Aqaba", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop" },
  { name: "Dead Sea", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop" },
  { name: "Jerash", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop" }
];

export const propertyTypes = [
  "Apartment", "Villa", "Desert Camp", "Boutique Hotel", "Guesthouse"
];

export const amenitiesList = [
  "Wi-Fi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Garden", 
  "BBQ", "TV", "Balcony", "Spa", "Gym", "Workspace"
];
