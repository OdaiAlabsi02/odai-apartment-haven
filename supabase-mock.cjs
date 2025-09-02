const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Real data from Supabase database
const properties = [
  {
    "id": "b7a51469-211e-45c3-adf4-e997c8177f81",
    "host_id": "3335a676-09ba-482d-a6f4-421f4e06b327",
    "title": "Apartment in Amman 3Bedroom with Terrace",
    "description": "Located in the heart of the city, our apartment offers unmatched convenience—steps away from Jordan's top-rated restaurants, malls, boutiques, museums, parks, and entertainment spots.\nThe apartment combines modern style with simplicity, fully equipped for comfort and ideal for gatherings.\nHosting up to 7 guests, it's the perfect place for a memorable stay.",
    "property_type": "apartment",
    "room_type": "entire_place",
    "max_guests": 7,
    "bedrooms": 3,
    "bathrooms": "2.0",
    "beds": 5,
    "square_feet": null,
    "address_line1": "WW87+6J3, 44, Apt 1",
    "address_line2": "",
    "city": "Amman",
    "state": "Amman Governorate",
    "country": "Jordan",
    "postal_code": "11623",
    "latitude": "31.91550260",
    "longitude": "35.91403290",
    "base_price": "60.00",
    "cleaning_fee": "0.00",
    "security_deposit": "0.00",
    "currency": "USD",
    "minimum_stay": 1,
    "maximum_stay": 365,
    "check_in_time": "15:00:00",
    "check_out_time": "11:00:00",
    "is_instant_book": false,
    "is_active": true,
    "created_at": "2025-09-02 09:15:26.195494",
    "updated_at": "2025-09-02 09:15:26.195494",
    "property_subtype": null,
    "listing_type": null,
    "building_floors": 1,
    "listing_floor": 1,
    "building_age": null,
    "unit_size": null,
    "unit_size_unit": "sq_meters",
    "featured": true,
    "images": [
      {
        "id": "8dea0db5-a31e-4b6a-bf94-083b68933612",
        "image_url": "https://zwgnhwnrlekinkvpchhs.supabase.co/storage/v1/object/public/apartment-images/apartments/1756804354180-dwdo60jsuon.jpeg",
        "alt_text": "living_room",
        "is_primary": true,
        "display_order": 8
      },
      {
        "id": "98ffdb1c-4dc2-4f7e-9123-f90f390f8aa2",
        "image_url": "https://zwgnhwnrlekinkvpchhs.supabase.co/storage/v1/object/public/apartment-images/apartments/1756804354178-4u7orqwe7js.jpeg",
        "alt_text": "bedroom",
        "is_primary": false,
        "display_order": 0
      }
    ],
    "amenities": []
  },
  {
    "id": "72cb63c5-90af-4d22-a2ca-d9b7e928d3ab",
    "host_id": "3335a676-09ba-482d-a6f4-421f4e06b327",
    "title": "Gather 'n' Gab Gateway",
    "description": "nice and comfy",
    "property_type": "apartment",
    "room_type": "entire_place",
    "max_guests": 3,
    "bedrooms": 1,
    "bathrooms": "1.0",
    "beds": 1,
    "square_feet": null,
    "address_line1": "WW87+6J3, 44, Apt 1",
    "address_line2": "",
    "city": "Amman",
    "state": "amman",
    "country": "Jordan",
    "postal_code": "11623",
    "latitude": "31.91550260",
    "longitude": "35.91403290",
    "base_price": "50.00",
    "cleaning_fee": "0.00",
    "security_deposit": "0.00",
    "currency": "USD",
    "minimum_stay": 1,
    "maximum_stay": 365,
    "check_in_time": "15:00:00",
    "check_out_time": "11:00:00",
    "is_instant_book": false,
    "is_active": true,
    "created_at": "2025-08-27 09:01:51.551678",
    "updated_at": "2025-08-27 09:01:51.551678",
    "property_subtype": null,
    "listing_type": null,
    "building_floors": 1,
    "listing_floor": 1,
    "building_age": null,
    "unit_size": null,
    "unit_size_unit": "sq_meters",
    "featured": true,
    "images": [
      {
        "id": "2083cd8b-bec7-4000-8be6-60292c6b3290",
        "image_url": "https://zwgnhwnrlekinkvpchhs.supabase.co/storage/v1/object/public/apartment-images/apartments/1756281876928-j7jv7lo6q1b.jpeg",
        "alt_text": "Property main image",
        "is_primary": true,
        "display_order": 0
      }
    ],
    "amenities": []
  }
];

// Supabase-compatible REST API endpoints
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Supabase-compatible mock API running' });
});

// Supabase REST API structure: /rest/v1/properties
app.get('/rest/v1/properties', (req, res) => {
  console.log('Serving properties via Supabase REST API structure');
  
  // Add Supabase-style headers
  res.set({
    'Content-Type': 'application/json',
    'Content-Range': `0-${properties.length - 1}/${properties.length}`,
    'X-Total-Count': properties.length.toString()
  });
  
  res.json(properties);
});

// Supabase REST API structure: /rest/v1/property_images
app.get('/rest/v1/property_images', (req, res) => {
  console.log('Serving property images via Supabase REST API structure');
  
  // Flatten all images from all properties
  const allImages = properties.flatMap(property => 
    property.images.map(img => ({
      ...img,
      property_id: property.id
    }))
  );
  
  res.set({
    'Content-Type': 'application/json',
    'Content-Range': `0-${allImages.length - 1}/${allImages.length}`,
    'X-Total-Count': allImages.length.toString()
  });
  
  res.json(allImages);
});

// Supabase REST API structure: /rest/v1/property_amenities
app.get('/rest/v1/property_amenities', (req, res) => {
  console.log('Serving property amenities via Supabase REST API structure');
  
  // Flatten all amenities from all properties
  const allAmenities = properties.flatMap(property => 
    property.amenities.map(amenity => ({
      ...amenity,
      property_id: property.id
    }))
  );
  
  res.set({
    'Content-Type': 'application/json',
    'Content-Range': `0-${allAmenities.length - 1}/${allAmenities.length}`,
    'X-Total-Count': allAmenities.length.toString()
  });
  
  res.json(allAmenities);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Supabase-compatible mock API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 Properties: http://localhost:${PORT}/rest/v1/properties`);
  console.log(`📸 Images: http://localhost:${PORT}/rest/v1/property_images`);
  console.log(`🔧 Amenities: http://localhost:${PORT}/rest/v1/property_amenities`);
  console.log(`📸 Serving ${properties.length} real properties with images`);
});

