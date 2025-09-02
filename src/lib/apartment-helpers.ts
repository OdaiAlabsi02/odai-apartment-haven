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
  // Main property data - matches properties table
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  base_price: number;
  currency: string;
  
  // Property type details
  property_subtype: string;
  listing_type: string;
  building_floors: number;
  listing_floor: number;
  building_age: string;
  unit_size: string;
  unit_size_unit: string;
  
  // Location details
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  
  // Additional details
  square_feet?: number;
  minimum_stay: number;
  maximum_stay: number;
  check_in_time: string;
  check_out_time: string;
  is_instant_book: boolean;
  is_active: boolean;
  
  // Host ID (will be set from current user)
  host_id?: string;
  
  // Amenities will be handled separately in property_amenities table
  selectedAmenities?: string[];
}

export function processApartmentFormData(
  step1Data: any,
  step2Data: any,
  step3Data: any,
  step4Data: any,
  step5Data?: any
): ProcessedApartmentData {
  
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
  
  // Build address line 1 from location parts
  const addressParts = [
    step2Data.street_name,
    step2Data.building_number,
    step2Data.apartment_number ? `Apt ${step2Data.apartment_number}` : null
  ].filter(Boolean);
  
  const addressLine1 = addressParts.join(', ');
  
  return {
    // Main property data
    title: step1Data.name,
    description: step1Data.description || "",
    property_type: step5Data?.property_type || "apartment", // Use step 5 data or default
    room_type: "entire_place", // Default to entire place
    max_guests: parseInt(step1Data.max_guests),
    bedrooms: totalBedrooms,
    bathrooms: parseInt(step1Data.bathrooms),
    beds: totalBeds,
    base_price: parseInt(step1Data.price_per_night),
    currency: "USD", // Default to USD
    
    // Property type details
    property_subtype: step5Data?.property_subtype || "apartment", // Use step 5 data or default
    listing_type: step5Data?.listing_type || "entire_place", // Use step 5 data or default
    building_floors: step5Data?.building_floors || 1, // Use step 5 data or default
    listing_floor: step5Data?.listing_floor || 1, // Use step 5 data or default
    building_age: step5Data?.building_age || "New", // Use step 5 data or default
    unit_size: step5Data?.unit_size || "0", // Use step 5 data or default
    unit_size_unit: step5Data?.unit_size_unit || "sq_meters", // Use step 5 data or default
    
    // Location details
    address_line1: addressLine1 || 'Address not specified',
    address_line2: step2Data.additional_details,
    city: step2Data.city || 'City not specified',
    state: step2Data.state || 'State not specified',
    country: step2Data.country || 'Country not specified',
    postal_code: step2Data.postal_code || 'Postal code not specified',
    latitude: step2Data.selectedLocation?.lat,
    longitude: step2Data.selectedLocation?.lng,
    
    // Additional details
    square_feet: undefined, // Will be set if available
    minimum_stay: 1, // Default to 1 night
    maximum_stay: 365, // Default to 365 nights
    check_in_time: "15:00:00", // Default to 3 PM
    check_out_time: "11:00:00", // Default to 11 AM
    is_instant_book: false, // Default to false
    is_active: true, // Default to active
    
    // Amenities for later processing
    selectedAmenities: step4Data.selectedAmenities || []
  };
}

export function validateApartmentData(
  step1Data: any,
  step2Data: any,
  step3Data: any,
  step4Data: any,
  step5Data?: any
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
  if (!step2Data?.city) errors.push("City is required");
  if (!step2Data?.state) errors.push("State is required");
  if (!step2Data?.country) errors.push("Country is required");
  
  // Validate Step 5 data (property type details)
  if (step5Data) {
    if (!step5Data.property_type) errors.push("Property type is required");
    if (!step5Data.property_subtype) errors.push("Property subtype is required");
    if (!step5Data.listing_type) errors.push("Listing type is required");
    if (step5Data.building_floors < 1) errors.push("Building floors must be at least 1");
    if (step5Data.listing_floor < 1 || step5Data.listing_floor > step5Data.building_floors) {
      errors.push("Listing floor must be between 1 and building floors");
    }
  }
  
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
    parking: "Parking",
    elevator: "Elevator",
    gym: "Gym",
    pool: "Pool",
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
    bbq: "BBQ",
    garden: "Garden",
    security: "Security",
    smoke_detector: "Smoke Detector",
    first_aid: "First Aid",
    fire_extinguisher: "Fire Extinguisher"
  };
  
  return amenities.map(amenity => amenityLabels[amenity] || amenity);
} 