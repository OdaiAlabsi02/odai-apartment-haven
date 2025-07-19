// Helper functions for handling apartment data from multi-step form

export interface ApartmentFormData {
  // Step 1: Basic Information
  name: string;
  max_guests: string;
  bathrooms: string;
  price_per_night: string;
  description: string;
  bedrooms: Array<{
    id: string;
    beds: Array<{ id: string; size: string }>;
  }>;
  
  // Step 2: Location Information
  google_location?: string;
  street_name?: string;
  building_number?: string;
  apartment_number?: string;
  additional_details?: string;
  selectedLocation?: { lat: number; lng: number };
  
  // Step 3: Images
  images?: File[];
  
  // Step 4: Amenities
  selectedAmenities?: string[];
}

export interface ProcessedApartmentData {
  // Main apartment data
  name: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  bathrooms: number;
  description: string;
  featured: boolean;
  
  // Location details (individual fields)
  street_name?: string;
  building_number?: string;
  apartment_number?: string;
  additional_details?: string;
  google_location?: string;
  latitude?: number;
  longitude?: number;
  
  // Images (individual fields)
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
  
  // Draft status
  is_draft?: boolean;
}

export function processApartmentFormData(
  step1Data: any,
  step2Data: any,
  step3Data: any,
  step4Data: any
): ProcessedApartmentData {
  // Calculate total bedrooms and beds
  const totalBedrooms = step1Data.bedrooms?.length || 0;
  let totalBeds = 0;
  
  // Calculate total beds from bedroom details
  if (step1Data.bedrooms) {
    step1Data.bedrooms.forEach((bedroom: any) => {
      if (bedroom.beds) {
        totalBeds += bedroom.beds.length;
      }
    });
  }
  
  // Build location string
  const locationParts = [
    step2Data.street_name,
    step2Data.building_number,
    step2Data.apartment_number ? `Apt ${step2Data.apartment_number}` : null
  ].filter(Boolean);
  
  const location = locationParts.join(', ');
  
  // Process bedroom details for individual columns
  const bedroomDetails = step1Data.bedrooms || [];
  const bedroomFields: any = {};
  
  // Process up to 5 bedrooms
  for (let i = 0; i < 5; i++) {
    const bedroom = bedroomDetails[i];
    if (bedroom) {
      const bedTypes = bedroom.beds?.map((bed: any) => bed.size) || [];
      bedroomFields[`bedroom_${i + 1}_beds`] = bedroom.beds?.length || 0;
      bedroomFields[`bedroom_${i + 1}_bed_types`] = bedTypes;
    } else {
      bedroomFields[`bedroom_${i + 1}_beds`] = 0;
      bedroomFields[`bedroom_${i + 1}_bed_types`] = [];
    }
  }
  
  // Process amenities for individual boolean fields
  const selectedAmenities = step4Data.selectedAmenities || [];
  const amenityFields: any = {};
  
  const allAmenities = [
    'wifi', 'air_conditioning', 'heating', 'kitchen', 'washer', 'dryer', 'parking',
    'elevator', 'gym', 'pool', 'balcony', 'terrace', 'tv', 'netflix', 'workspace',
    'iron', 'hair_dryer', 'shampoo', 'soap', 'towels', 'bed_linen', 'coffee_maker',
    'microwave', 'dishwasher', 'refrigerator', 'oven', 'stove', 'bbq', 'garden',
    'security', 'smoke_detector', 'first_aid', 'fire_extinguisher'
  ];
  
  allAmenities.forEach(amenity => {
    amenityFields[amenity] = selectedAmenities.includes(amenity);
  });
  
  return {
    // Main apartment data
    name: step1Data.name,
    location: location || 'Location not specified',
    price_per_night: parseInt(step1Data.price_per_night),
    max_guests: parseInt(step1Data.max_guests),
    bathrooms: parseInt(step1Data.bathrooms),
    description: step1Data.description || "",
    featured: false,
    
    // Location details
    street_name: step2Data.street_name,
    building_number: step2Data.building_number,
    apartment_number: step2Data.apartment_number,
    additional_details: step2Data.additional_details,
    google_location: step2Data.google_location,
    latitude: step2Data.selectedLocation?.lat,
    longitude: step2Data.selectedLocation?.lng,
    
    // Image details - will be processed during upload
    primary_image: null, // Will be set after upload
    image_urls: [], // Will be set after upload
    image_count: step3Data.images?.length || 0,
    
    // Bedroom details
    bedrooms: totalBedrooms,
    total_beds: totalBeds,
    ...bedroomFields,
    
    // Amenity details
    ...amenityFields,
    
    // Draft status
    is_draft: false
  };
}

export function validateApartmentData(
  step1Data: any,
  step2Data: any,
  step3Data: any,
  step4Data: any
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate Step 1 data
  if (!step1Data?.name) errors.push("Apartment name is required");
  if (!step1Data?.max_guests) errors.push("Maximum guests is required");
  if (!step1Data?.bathrooms) errors.push("Number of bathrooms is required");
  if (!step1Data?.price_per_night) errors.push("Price per night is required");
  if (!step1Data?.bedrooms?.length) errors.push("At least one bedroom is required");
  
  // Validate Step 2 data
  if (!step2Data?.street_name) errors.push("Street name is required");
  if (!step2Data?.building_number) errors.push("Building number is required");
  
  // Validate Step 3 data (images are optional)
  // if (!step3Data?.images?.length) errors.push("At least one image is required");
  
  // Validate Step 4 data (amenities are optional)
  // if (!step4Data?.selectedAmenities?.length) errors.push("At least one amenity is required");
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatAmenitiesForDisplay(amenities: string[]): string[] {
  const amenityLabels: { [key: string]: string } = {
    wifi: "WiFi",
    air_conditioning: "Air Conditioning",
    heating: "Heating",
    kitchen: "Kitchen",
    washer: "Washer",
    dryer: "Dryer",
    parking: "Free Parking",
    elevator: "Elevator",
    gym: "Gym",
    pool: "Swimming Pool",
    balcony: "Balcony",
    terrace: "Terrace",
    tv: "TV",
    netflix: "Netflix",
    workspace: "Workspace",
    iron: "Iron",
    hair_dryer: "Hair Dryer",
    shampoo: "Shampoo",
    soap: "Soap",
    towels: "Towels",
    bed_linen: "Bed Linen",
    coffee_maker: "Coffee Maker",
    microwave: "Microwave",
    dishwasher: "Dishwasher",
    refrigerator: "Refrigerator",
    oven: "Oven",
    stove: "Stove",
    bbq: "BBQ Grill",
    garden: "Garden",
    security: "Security System",
    smoke_detector: "Smoke Detector",
    first_aid: "First Aid Kit",
    fire_extinguisher: "Fire Extinguisher"
  };
  
  return amenities.map(amenity => amenityLabels[amenity] || amenity);
} 