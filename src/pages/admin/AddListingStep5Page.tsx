import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { useApartments } from "@/hooks/useApartments";
import { processApartmentFormData, validateApartmentData, formatAmenitiesForDisplay } from "@/lib/apartment-helpers";
import { uploadMultipleImages } from "@/lib/imageUpload";
import { supabase } from "@/lib/supabaseClient";

const amenities = [
  { id: "wifi", label: "WiFi" },
  { id: "air_conditioning", label: "Air Conditioning" },
  { id: "heating", label: "Heating" },
  { id: "kitchen", label: "Kitchen" },
  { id: "washer", label: "Washer" },
  { id: "dryer", label: "Dryer" },
  { id: "parking", label: "Free Parking" },
  { id: "elevator", label: "Elevator" },
  { id: "gym", label: "Gym" },
  { id: "pool", label: "Swimming Pool" },
  { id: "balcony", label: "Balcony" },
  { id: "terrace", label: "Terrace" },
  { id: "tv", label: "TV" },
  { id: "netflix", label: "Netflix" },
  { id: "workspace", label: "Workspace" },
  { id: "iron", label: "Iron" },
  { id: "hair_dryer", label: "Hair Dryer" },
  { id: "shampoo", label: "Shampoo" },
  { id: "soap", label: "Soap" },
  { id: "towels", label: "Towels" },
  { id: "bed_linen", label: "Bed Linen" },
  { id: "coffee_maker", label: "Coffee Maker" },
  { id: "microwave", label: "Microwave" },
  { id: "dishwasher", label: "Dishwasher" },
  { id: "refrigerator", label: "Refrigerator" },
  { id: "oven", label: "Oven" },
  { id: "stove", label: "Stove" },
  { id: "bbq", label: "BBQ Grill" },
  { id: "garden", label: "Garden" },
  { id: "security", label: "Security System" },
  { id: "smoke_detector", label: "Smoke Detector" },
  { id: "first_aid", label: "First Aid Kit" },
  { id: "fire_extinguisher", label: "Fire Extinguisher" },
];

export default function AddListingStep5Page() {
  const navigate = useNavigate();
  const { addApartment } = useApartments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step1Data, setStep1Data] = useState<any>(null);
  const [step2Data, setStep2Data] = useState<any>(null);
  const [step3Data, setStep3Data] = useState<any>(null);
  const [step4Data, setStep4Data] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Property type form data state
  const [formData, setFormData] = useState({
    property_type: '',
    property_subtype: '',
    listing_type: '',
    building_floors: 1,
    listing_floor: 1,
    building_age: '',
    unit_size: '',
    unit_size_unit: 'sq_meters'
  });

  // Property type options
  const propertyTypes = [
    { value: 'apartment', label: 'Apartment', icon: '🏢' },
    { value: 'house', label: 'House', icon: '🏠' },
    { value: 'secondary_unit', label: 'Secondary Unit', icon: '🏘️' },
    { value: 'unique_space', label: 'Unique Space', icon: '✨' },
    { value: 'boutique_hotel', label: 'Boutique Hotel', icon: '🏨' }
  ];

  const propertySubtypes = {
    apartment: [
      { value: 'rental_unit', label: 'Rental Unit' },
      { value: 'condo', label: 'Condo' },
      { value: 'serviced_apartment', label: 'Serviced Apartment' },
      { value: 'loft', label: 'Loft' }
    ],
    house: [
      { value: 'detached_house', label: 'Detached House' },
      { value: 'townhouse', label: 'Townhouse' },
      { value: 'cottage', label: 'Cottage' },
      { value: 'villa', label: 'Villa' }
    ],
    secondary_unit: [
      { value: 'basement', label: 'Basement' },
      { value: 'garage_apartment', label: 'Garage Apartment' },
      { value: 'in_law_suite', label: 'In-Law Suite' },
      { value: 'guest_house', label: 'Guest House' }
    ],
    unique_space: [
      { value: 'treehouse', label: 'Treehouse' },
      { value: 'yurt', label: 'Yurt' },
      { value: 'cabin', label: 'Cabin' },
      { value: 'boat', label: 'Boat' }
    ],
    boutique_hotel: [
      { value: 'boutique_hotel', label: 'Boutique Hotel' },
      { value: 'inn', label: 'Inn' },
      { value: 'guesthouse', label: 'Guesthouse' }
    ]
  };

  const listingTypes = [
    { value: 'entire_place', label: 'Entire Place', description: 'Guests have the whole place to themselves' },
    { value: 'shared_room', label: 'Shared Room', description: 'Guests share a room with others' },
    { value: 'room', label: 'Room', description: 'Guests have a private room in a shared space' }
  ];

  const sizeUnits = [
    { value: 'sq_meters', label: 'Square Meters' },
    { value: 'sq_feet', label: 'Square Feet' },
    { value: 'acres', label: 'Acres' }
  ];

  useEffect(() => {
    // Load data from all previous steps
    const step1DataStr = sessionStorage.getItem("listingStep1");
    const step2DataStr = sessionStorage.getItem("listingStep2");
    const step3DataStr = sessionStorage.getItem("listingStep3");
    const step4DataStr = sessionStorage.getItem("listingStep4");
    const step5DataStr = sessionStorage.getItem("listingStep5");
    
    if (step1DataStr) {
      setStep1Data(JSON.parse(step1DataStr));
    }
    if (step2DataStr) {
      setStep2Data(JSON.parse(step2DataStr));
    }
    if (step3DataStr) {
      setStep3Data(JSON.parse(step3DataStr));
    }
    if (step4DataStr) {
      setStep4Data(JSON.parse(step4DataStr));
    }
    if (step5DataStr) {
      const step5Data = JSON.parse(step5DataStr);
      if (step5Data.formData) {
        setFormData(step5Data.formData);
      }
    }
    
    if (!step1DataStr || !step2DataStr || !step3DataStr || !step4DataStr) {
      // If no previous step data, redirect back to step 1
      navigate("/admin/add-listing/step1");
    }
  }, [navigate]);

  // Check if user is authenticated as admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Check if admin is authenticated (same as AdminPage)
        const adminAuthStatus = localStorage.getItem("adminAuthenticated");
        if (adminAuthStatus === "true") {
          // Get current Supabase session for user ID
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error || !session) {
            // No Supabase session, but admin is authenticated
            // Create a mock user object for the form
            setUser({ id: 'admin-user', email: 'admin@example.com' });
          } else {
            // Verify user is actually admin by checking users table
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("id, email, role, is_admin")
              .eq("id", session.user.id)
              .single();
            
            if (userError) {
              console.error('Error fetching user data:', userError);
              // If we can't fetch user data, redirect to admin login
              navigate("/admin");
              return;
            }
            
            if (userData && (userData.role === "admin" || userData.is_admin === true)) {
              setUser(userData);
            } else if (userData) {
              // User exists but not admin - try to update them to admin
              console.log('User exists but not admin, attempting to update...');
              const { error: updateError } = await supabase
                .from("users")
                .update({ is_admin: true, role: 'admin' })
                .eq("id", session.user.id);
              
              if (updateError) {
                console.error('Failed to update user to admin:', updateError);
                navigate("/admin");
                return;
              } else {
                // Update successful, set user as admin
                setUser({ ...userData, is_admin: true, role: 'admin' });
              }
            } else {
              // User doesn't exist, redirect to admin login
              navigate("/admin");
              return;
            }
          }
        } else {
          // Not admin authenticated, redirect to admin login
          navigate("/admin");
          return;
        }
      } catch (error) {
        console.error("Admin auth error:", error);
        navigate("/admin");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Auto-save functionality for review data
  const saveDraft = () => {
    // Save any review-specific data if needed
    sessionStorage.setItem("listingStep5", JSON.stringify({ 
      reviewed: true,
      timestamp: new Date().toISOString(),
      formData: formData // Save the property type form data
    }));
  };

  // Auto-save on component mount and when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [step1Data, step2Data, step3Data, step4Data]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step1Data, step2Data, step3Data, step4Data]);

  const handleBack = () => {
    saveDraft();
    navigate("/admin/add-listing/step4");
  };

  const handleSubmit = async () => {
    if (!step1Data || !step2Data || !step3Data || !step4Data) {
      alert("Missing data from previous steps");
      return;
    }

    // Validate all data before submission
    const validation = validateApartmentData(step1Data, step2Data, step3Data, step4Data, formData);
    if (!validation.isValid) {
      alert(`Please fix the following errors:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Use already uploaded images from step 3
      let uploadedImages: { url: string; path: string }[] = [];
      if (step3Data.uploadedImages && Array.isArray(step3Data.uploadedImages) && step3Data.uploadedImages.length > 0) {
        uploadedImages = step3Data.uploadedImages;
        console.log('Using already uploaded images:', uploadedImages);
      } else {
        alert('No images found. Please go back to step 3 and upload images.');
        return;
      }

      // Process all form data using helper function
      const processedData = processApartmentFormData(step1Data, step2Data, step3Data, step4Data, formData);
      
      // Get current user ID for host_id
      if (!user) {
        alert('User not authenticated. Please log in again.');
        return;
      }
      
      // Convert to format expected by properties table
      const propertyData = {
        title: processedData.title,
        description: processedData.description,
        property_type: processedData.property_type,
        room_type: processedData.room_type,
        max_guests: processedData.max_guests,
        bedrooms: processedData.bedrooms,
        bathrooms: processedData.bathrooms,
        beds: processedData.beds,
        base_price: processedData.base_price,
        currency: processedData.currency,
        host_id: user.id,
        // Location details
        address_line1: processedData.address_line1,
        address_line2: processedData.address_line2,
        city: processedData.city,
        state: processedData.state,
        country: processedData.country,
        postal_code: processedData.postal_code,
        latitude: processedData.latitude,
        longitude: processedData.longitude,
        // Additional details
        square_feet: processedData.square_feet,
        minimum_stay: processedData.minimum_stay,
        maximum_stay: processedData.maximum_stay,
        check_in_time: processedData.check_in_time,
        check_out_time: processedData.check_out_time,
        is_instant_book: processedData.is_instant_book,
        is_active: processedData.is_active,
      };

      console.log("Submitting property data:", propertyData);

      // Validate data lengths before submission
      const validationErrors = [];
      
      if (propertyData.title && propertyData.title.length > 1000) {
        validationErrors.push("Property title is too long (max 1000 characters)");
      }
      if (propertyData.description && propertyData.description.length > 10000) {
        validationErrors.push("Description is too long (max 10000 characters)");
      }
      if (propertyData.address_line1 && propertyData.address_line1.length > 1000) {
        validationErrors.push("Address is too long (max 1000 characters)");
      }
      if (propertyData.city && propertyData.city.length > 100) {
        validationErrors.push("City is too long (max 100 characters)");
      }
      if (propertyData.state && propertyData.state.length > 100) {
        validationErrors.push("State is too long (max 100 characters)");
      }
      if (propertyData.country && propertyData.country.length > 100) {
        validationErrors.push("Country is too long (max 100 characters)");
      }
      if (propertyData.postal_code && propertyData.postal_code.length > 20) {
        validationErrors.push("Postal code is too long (max 20 characters)");
      }
      
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        setIsSubmitting(false);
        return;
      }

      // Submit the property data
      const result = await addApartment(propertyData);
      
      if (result) {
        // Handle amenities separately
        if (processedData.selectedAmenities && processedData.selectedAmenities.length > 0) {
          try {
            // Map amenity IDs to database names
            const amenityIdToName: { [key: string]: string } = {
              'wifi': 'Wi-Fi',
              'air_conditioning': 'Air Conditioning',
              'heating': 'Heating',
              'kitchen': 'Kitchen',
              'washer': 'Washer',
              'dryer': 'Dryer',
              'parking': 'Parking',
              'elevator': 'Elevator',
              'gym': 'Gym',
              'pool': 'Pool',
              'balcony': 'Balcony',
              'terrace': 'Terrace',
              'tv': 'TV',
              'netflix': 'Netflix',
              'workspace': 'Workspace',
              'iron': 'Iron',
              'hair_dryer': 'Hair Dryer',
              'shampoo': 'Shampoo',
              'soap': 'Soap',
              'towels': 'Towels',
              'bed_linen': 'Bed Linen',
              'coffee_maker': 'Coffee Maker',
              'microwave': 'Microwave',
              'dishwasher': 'Dishwasher',
              'refrigerator': 'Refrigerator',
              'oven': 'Oven',
              'stove': 'Stove',
              'bbq': 'BBQ',
              'garden': 'Garden',
              'security': 'Security',
              'smoke_detector': 'Smoke Detector',
              'first_aid': 'First Aid',
              'fire_extinguisher': 'Fire Extinguisher'
            };

            // Convert amenity IDs to database names
            const amenityNames = processedData.selectedAmenities.map(id => amenityIdToName[id] || id);
            console.log('Selected amenity IDs:', processedData.selectedAmenities);
            console.log('Mapped amenity names:', amenityNames);

            // Get the amenity IDs from the database
            const { data: amenityData, error: amenityError } = await supabase
              .from('amenities')
              .select('id, name')
              .in('name', amenityNames);

            if (amenityError) {
              console.error('Error fetching amenity IDs:', amenityError);
            } else if (amenityData && amenityData.length > 0) {
              // Insert into property_amenities table
              const propertyAmenityInserts = amenityData.map(amenity => ({
                property_id: result.id,
                amenity_id: amenity.id
              }));

              const { error: propertyAmenityError } = await supabase
                .from('property_amenities')
                .insert(propertyAmenityInserts);

              if (propertyAmenityError) {
                console.error('Error inserting property amenities:', propertyAmenityError);
              } else {
                console.log('Property amenities inserted successfully:', propertyAmenityInserts.length);
              }
            }
          } catch (error) {
            console.error('Error handling amenities:', error);
          }
        }
        
        // Handle images separately - Insert into property_images table
        if (uploadedImages.length > 0) {
          try {
            const imageInserts = uploadedImages.map((image, index) => ({
              property_id: result.id, // Use the newly created property ID
              image_url: image.url,
              display_order: index,
              is_primary: index === 0, // First image is primary
              alt_text: `Property image ${index + 1}`
            }));

            const { error: imageError } = await supabase
              .from('property_images')
              .insert(imageInserts);

            if (imageError) {
              console.error('Error inserting images:', imageError);
              // Don't fail the whole submission, just log the error
            } else {
              console.log('Images inserted successfully:', imageInserts.length);
            }
          } catch (error) {
            console.error('Error handling images:', error);
            // Don't fail the whole submission, just log the error
          }
        }
        
        // Clear session storage
        sessionStorage.removeItem("listingStep1");
        sessionStorage.removeItem("listingStep2");
        sessionStorage.removeItem("listingStep3");
        sessionStorage.removeItem("listingStep4");
        sessionStorage.removeItem("listingStep5");
        
        // Navigate to success page or dashboard
        navigate("/admin/listings");
      }
    } catch (error) {
      console.error("Error submitting property:", error);
      alert("Failed to submit property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!step1Data || !step2Data || !step3Data || !step4Data) {
      alert("Missing data from previous steps");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use already uploaded images from step 3
      let uploadedImages: { url: string; path: string }[] = [];
      if (step3Data.uploadedImages && Array.isArray(step3Data.uploadedImages) && step3Data.uploadedImages.length > 0) {
        uploadedImages = uploadedImages;
        console.log('Using already uploaded images for draft:', uploadedImages);
      }

      // Process all form data using helper function
      const processedData = processApartmentFormData(step1Data, step2Data, step3Data, step4Data, formData);
      
      // Get current user ID for host_id
      if (!user) {
        alert('User not authenticated. Please log in again.');
        return;
      }
      
      // Convert to format expected by properties table with draft flag
      const propertyData = {
        title: processedData.title,
        description: processedData.description,
        property_type: processedData.property_type,
        room_type: processedData.room_type,
        max_guests: processedData.max_guests,
        bedrooms: processedData.bedrooms,
        bathrooms: processedData.bathrooms,
        beds: processedData.beds,
        base_price: processedData.base_price,
        currency: processedData.currency,
        host_id: user.id,
        // Location details
        address_line1: processedData.address_line1,
        address_line2: processedData.address_line2,
        city: processedData.city,
        state: processedData.state,
        country: processedData.country,
        postal_code: processedData.postal_code,
        latitude: processedData.latitude,
        longitude: processedData.longitude,
        // Additional details
        square_feet: processedData.square_feet,
        minimum_stay: processedData.minimum_stay,
        maximum_stay: processedData.maximum_stay,
        check_in_time: processedData.check_in_time,
        check_out_time: processedData.check_out_time,
        is_instant_book: processedData.is_instant_book,
        is_active: false, // Draft properties are not active
      };

      console.log("Saving property as draft:", propertyData);

      // Validate data lengths before submission
      const validationErrors = [];
      
      if (propertyData.title && propertyData.title.length > 1000) {
        validationErrors.push("Property title is too long (max 1000 characters)");
      }
      if (propertyData.description && propertyData.description.length > 10000) {
        validationErrors.push("Description is too long (max 10000 characters)");
      }
      if (propertyData.address_line1 && propertyData.address_line1.length > 1000) {
        validationErrors.push("Address is too long (max 1000 characters)");
      }
      if (propertyData.city && propertyData.city.length > 100) {
        validationErrors.push("City is too long (max 100 characters)");
      }
      if (propertyData.state && propertyData.state.length > 100) {
        validationErrors.push("State is too long (max 100 characters)");
      }
      if (propertyData.country && propertyData.country.length > 100) {
        validationErrors.push("Country is too long (max 100 characters)");
      }
      if (propertyData.postal_code && propertyData.postal_code.length > 20) {
        validationErrors.push("Postal code is too long (max 20 characters)");
      }
      
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        setIsSubmitting(false);
        return;
      }

      // Save the property as draft
      const result = await addApartment(propertyData);
      
      if (result) {
        // Handle amenities separately
        if (processedData.selectedAmenities && processedData.selectedAmenities.length > 0) {
          try {
            // Map amenity IDs to database names
            const amenityIdToName: { [key: string]: string } = {
              'wifi': 'Wi-Fi',
              'air_conditioning': 'Air Conditioning',
              'heating': 'Heating',
              'kitchen': 'Kitchen',
              'washer': 'Washer',
              'dryer': 'Dryer',
              'parking': 'Parking',
              'elevator': 'Elevator',
              'gym': 'Gym',
              'pool': 'Pool',
              'balcony': 'Balcony',
              'terrace': 'Terrace',
              'tv': 'TV',
              'netflix': 'Netflix',
              'workspace': 'Workspace',
              'iron': 'Iron',
              'hair_dryer': 'Hair Dryer',
              'shampoo': 'Shampoo',
              'soap': 'Soap',
              'towels': 'Towels',
              'bed_linen': 'Bed Linen',
              'coffee_maker': 'Coffee Maker',
              'microwave': 'Microwave',
              'dishwasher': 'Dishwasher',
              'refrigerator': 'Refrigerator',
              'oven': 'Oven',
              'stove': 'Stove',
              'bbq': 'BBQ',
              'garden': 'Garden',
              'security': 'Security',
              'smoke_detector': 'Smoke Detector',
              'first_aid': 'First Aid',
              'fire_extinguisher': 'Fire Extinguisher'
            };

            // Convert amenity IDs to database names
            const amenityNames = processedData.selectedAmenities.map(id => amenityIdToName[id] || id);
            console.log('Selected amenity IDs:', processedData.selectedAmenities);
            console.log('Mapped amenity names:', amenityNames);

            // Get the amenity IDs from the database
            const { data: amenityData, error: amenityError } = await supabase
              .from('amenities')
              .select('id, name')
              .in('name', amenityNames);

            if (amenityError) {
              console.error('Error fetching amenity IDs:', amenityError);
            } else if (amenityData && amenityData.length > 0) {
              // Insert into property_amenities table
              const propertyAmenityInserts = amenityData.map(amenity => ({
                property_id: result.id,
                amenity_id: amenity.id
              }));

              const { error: propertyAmenityError } = await supabase
                .from('property_amenities')
                .insert(propertyAmenityInserts);

              if (propertyAmenityError) {
                console.error('Error inserting property amenities:', propertyAmenityError);
              } else {
                console.log('Property amenities inserted successfully:', propertyAmenityInserts.length);
              }
            }
          } catch (error) {
            console.error('Error handling amenities:', error);
          }
        }
        
        // Handle images separately - Insert into property_images table
        if (uploadedImages.length > 0) {
          try {
            const imageInserts = uploadedImages.map((image, index) => ({
              property_id: result.id, // Use the newly created property ID
              image_url: image.url,
              display_order: index,
              is_primary: index === 0, // First image is primary
              alt_text: `Property image ${index + 1}`
            }));

            const { error: imageError } = await supabase
              .from('property_images')
              .insert(imageInserts);

            if (imageError) {
              console.error('Error inserting images for draft:', imageError);
              // Don't fail the whole submission, just log the error
            } else {
              console.log('Draft images inserted successfully:', imageInserts.length);
            }
          } catch (error) {
            console.error('Error handling draft images:', error);
            // Don't fail the whole submission, just log the error
          }
        }
        
        // Clear session storage
        sessionStorage.removeItem("listingStep1");
        sessionStorage.removeItem("listingStep2");
        sessionStorage.removeItem("listingStep3");
        sessionStorage.removeItem("listingStep4");
        sessionStorage.removeItem("listingStep5");
        
        // Navigate to listings page
        navigate("/admin/listings");
      }
    } catch (error) {
      console.error("Error saving property as draft:", error);
      alert("Failed to save property as draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAmenityLabel = (amenityId: string) => {
    const amenity = amenities.find(a => a.id === amenityId);
    return amenity ? amenity.label : amenityId;
  };

  // Format amenities for display
  const displayAmenities = step4Data?.selectedAmenities ? 
    formatAmenitiesForDisplay(step4Data.selectedAmenities) : [];

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading if no step data
  if (!step1Data || !step2Data || !step3Data || !step4Data) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Add New Listing</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              1
            </div>
            <span>Basic Info</span>
          </div>
          <ArrowLeft className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              2
            </div>
            <span>Location</span>
          </div>
          <ArrowLeft className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              3
            </div>
            <span>Images</span>
          </div>
          <ArrowLeft className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              4
            </div>
            <span>Amenities</span>
          </div>
          <ArrowLeft className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              5
            </div>
            <span>Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Section */}
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Review & Submit</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review all the information before submitting your listing.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{step1Data.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Guests:</span>
                    <span className="font-medium">{step1Data.max_guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bedrooms:</span>
                    <span className="font-medium">{step1Data.bedrooms?.length || 0} bedroom{step1Data.bedrooms?.length !== 1 ? 's' : ''}</span>
                  </div>
                  {step1Data.bedrooms && step1Data.bedrooms.length > 0 && (
                    <div className="ml-4 text-xs text-muted-foreground">
                      {step1Data.bedrooms.map((bedroom: any, bedroomIndex: number) => (
                        <div key={bedroom.id}>
                          • Bedroom {bedroomIndex + 1}: {bedroom.beds.length} bed{bedroom.beds.length !== 1 ? 's' : ''}
                          {bedroom.beds.length > 0 && (
                            <div className="ml-4">
                              {bedroom.beds.map((bed: any, bedIndex: number) => (
                                <div key={bed.id}>- Bed {bedIndex + 1}: {bed.size}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bathrooms:</span>
                    <span className="font-medium">{step1Data.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Night:</span>
                    <span className="font-medium">${step1Data.price_per_night}</span>
                  </div>
                  {step1Data.description && (
                    <div className="pt-2">
                      <span className="text-muted-foreground">Description:</span>
                      <p className="text-sm mt-1">{step1Data.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Location
                </h3>
                <div className="space-y-2 text-sm">
                  {step2Data.google_location && (
                    <div>
                      <span className="text-muted-foreground">Google Maps:</span>
                      <p className="text-sm mt-1">{step2Data.google_location}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Street:</span>
                    <span className="font-medium">{step2Data.street_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Building:</span>
                    <span className="font-medium">{step2Data.building_number}</span>
                  </div>
                  {step2Data.apartment_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Apartment:</span>
                      <span className="font-medium">{step2Data.apartment_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Upload className="h-4 w-4 mr-2 text-blue-600" />
                  Images
                </h3>
                <div className="text-sm">
                  {step3Data.uploadedImages && step3Data.uploadedImages.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-green-600 font-medium">
                        {step3Data.uploadedImages.length} image{step3Data.uploadedImages.length !== 1 ? 's' : ''} uploaded
                      </span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {step3Data.uploadedImages.slice(0, 6).map((image: any, index: number) => (
                          <div key={index} className="aspect-square relative overflow-hidden rounded-lg border">
                            <img
                              src={image.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {step3Data.uploadedImages.length > 6 && (
                          <div className="aspect-square flex items-center justify-center bg-muted rounded-lg border text-muted-foreground text-xs">
                            +{step3Data.uploadedImages.length - 6} more
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-destructive">No images uploaded - Please go back to step 3</span>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Amenities
                </h3>
                <div className="text-sm">
                  {displayAmenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {displayAmenities.map((amenity: string) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No amenities selected</span>
                  )}
                </div>
              </div>

              {/* Property Type Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">🏠</span>
                  Property Type Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="font-medium">
                      {formData.property_type ? 
                        propertyTypes.find(t => t.value === formData.property_type)?.label : 
                        'Not selected'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Subtype:</span>
                    <span className="font-medium">
                      {formData.property_subtype ? 
                        propertySubtypes[formData.property_type as keyof typeof propertySubtypes]?.find(s => s.value === formData.property_subtype)?.label : 
                        'Not selected'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listing Type:</span>
                    <span className="font-medium">
                      {formData.listing_type ? 
                        listingTypes.find(t => t.value === formData.listing_type)?.label : 
                        'Not selected'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Building Floors:</span>
                    <span className="font-medium">{formData.building_floors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listing Floor:</span>
                    <span className="font-medium">{formData.listing_floor}</span>
                  </div>
                  {formData.building_age && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built:</span>
                      <span className="font-medium">{formData.building_age}</span>
                    </div>
                  )}
                  {formData.unit_size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Size:</span>
                      <span className="font-medium">
                        {formData.unit_size} {sizeUnits.find(u => u.value === formData.unit_size_unit)?.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Type Selection Section */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-3">🏠</span>
            Property Type Selection
          </h3>
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Progress</span>
              <span className="text-sm text-gray-500">
                {(() => {
                  const totalFields = 7; // property_type, property_subtype, listing_type, building_floors, listing_floor, building_age, unit_size
                  const completedFields = [
                    formData.property_type,
                    formData.property_subtype,
                    formData.listing_type,
                    formData.building_floors,
                    formData.listing_floor,
                    formData.building_age,
                    formData.unit_size
                  ].filter(Boolean).length;
                  return `${completedFields}/${totalFields}`;
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(() => {
                    const totalFields = 7;
                    const completedFields = [
                      formData.property_type,
                      formData.property_subtype,
                      formData.listing_type,
                      formData.building_floors,
                      formData.listing_floor,
                      formData.building_age,
                      formData.unit_size
                    ].filter(Boolean).length;
                    return (completedFields / totalFields) * 100;
                  })()}%`
                }}
              ></div>
            </div>
          </div>
          
          {/* Current Selection Summary */}
          {(formData.property_type || formData.property_subtype || formData.listing_type) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Current Selection:</h4>
              <div className="flex flex-wrap gap-2">
                {formData.property_type && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {propertyTypes.find(t => t.value === formData.property_type)?.label}
                  </Badge>
                )}
                {formData.property_subtype && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {propertySubtypes[formData.property_type as keyof typeof propertySubtypes]?.find(s => s.value === formData.property_subtype)?.label}
                  </Badge>
                )}
                {formData.listing_type && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {listingTypes.find(t => t.value === formData.listing_type)?.label}
                  </Badge>
                )}
              </div>
              {(formData.building_floors > 1 || formData.listing_floor > 1 || formData.building_age || formData.unit_size) && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-sm text-blue-700">
                    {formData.building_floors > 1 && `Building: ${formData.building_floors} floors`}
                    {formData.listing_floor > 1 && ` • Floor: ${formData.listing_floor}`}
                    {formData.building_age && ` • Built: ${formData.building_age}`}
                    {formData.unit_size && ` • Size: ${formData.unit_size} ${sizeUnits.find(u => u.value === formData.unit_size_unit)?.label}`}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Property Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Which is most like your place?
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Choose the category that best describes your property type. This helps guests understand what to expect.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      property_type: type.value,
                      property_subtype: '' // Reset subtype when main type changes
                    }));
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    formData.property_type === type.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-medium text-gray-900">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Property Subtype Selection */}
          {formData.property_type && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Type
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Select the specific type within your chosen category. This provides more detailed information for guests.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {propertySubtypes[formData.property_type as keyof typeof propertySubtypes]?.map((subtype) => (
                  <button
                    key={subtype.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, property_subtype: subtype.value }))}
                    className={`p-3 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                      formData.property_subtype === subtype.value
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{subtype.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Listing Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Listing Type
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Choose how guests will access your space. This affects pricing and guest expectations.
            </p>
            <div className="space-y-3">
              {listingTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, listing_type: type.value }))}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    formData.listing_type === type.value
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Building Details */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Building Details</h4>
            <p className="text-sm text-gray-600 mb-4">
              Provide information about the building structure and location of your listing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Building Floors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many floors in the building?
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      building_floors: Math.max(1, prev.building_floors - 1) 
                    }))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <span className="text-lg">−</span>
                  </button>
                  <span className="text-2xl font-semibold min-w-[3rem] text-center">
                    {formData.building_floors}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      building_floors: prev.building_floors + 1 
                    }))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>

              {/* Listing Floor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which floor is the listing on?
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      listing_floor: Math.max(1, prev.listing_floor - 1) 
                    }))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <span className="text-lg">−</span>
                  </button>
                  <span className="text-2xl font-semibold min-w-[3rem] text-center">
                    {formData.listing_floor}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      listing_floor: Math.min(formData.building_floors, prev.listing_floor + 1) 
                    }))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be between 1 and {formData.building_floors}
                </p>
              </div>
            </div>
          </div>

          {/* Building Age and Unit Size */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Property Specifications</h4>
            <p className="text-sm text-gray-600 mb-4">
              Additional details that help guests understand the property better.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Building Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.building_age}
                  onChange={(e) => setFormData(prev => ({ ...prev, building_age: e.target.value }))}
                  placeholder="e.g., 2020"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if unknown
                </p>
              </div>

              {/* Unit Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Size
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.unit_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_size: e.target.value }))}
                    placeholder="e.g., 140"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={formData.unit_size_unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_size_unit: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sizeUnits.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  The amount of indoor space that's available to guests.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button for Property Type Section */}
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={() => {
                saveDraft();
                // Show success message
                alert('Property type details saved!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Save Property Details
            </Button>
          </div>
        </div>

        {/* Submit Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Submit</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your listing is ready to be published. Click submit to create your apartment listing.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-green-800">All Information Complete</h4>
                    <p className="text-sm text-green-700">
                      Your listing has all the required information and is ready to be published.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your listing will be saved to the database</li>
                  <li>• Images will be uploaded to storage</li>
                  <li>• Your apartment will appear in the listings</li>
                  <li>• Guests can start booking your apartment</li>
                </ul>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? "Creating Listing..." : "Submit Listing"}
                </Button>
                
                <Button 
                  onClick={handleSaveAsDraft} 
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? "Saving Draft..." : "Save as Draft"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Step 4
        </Button>
      </div>
    </div>
  );
} 