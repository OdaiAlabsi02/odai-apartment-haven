import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { useApartments } from "@/hooks/useApartments";
import { processApartmentFormData, validateApartmentData, formatAmenitiesForDisplay } from "@/lib/apartment-helpers";
import { uploadMultipleImages } from "@/lib/imageUpload";

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

  useEffect(() => {
    // Load data from all previous steps
    const step1DataStr = sessionStorage.getItem("listingStep1");
    const step2DataStr = sessionStorage.getItem("listingStep2");
    const step3DataStr = sessionStorage.getItem("listingStep3");
    const step4DataStr = sessionStorage.getItem("listingStep4");
    
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
    
    if (!step1DataStr || !step2DataStr || !step3DataStr || !step4DataStr) {
      // If no previous step data, redirect back to step 1
      navigate("/admin/add-listing/step1");
    }
  }, [navigate]);

  // Auto-save functionality for review data
  const saveDraft = () => {
    // Save any review-specific data if needed
    sessionStorage.setItem("listingStep5", JSON.stringify({ 
      reviewed: true,
      timestamp: new Date().toISOString()
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
    const validation = validateApartmentData(step1Data, step2Data, step3Data, step4Data);
    if (!validation.isValid) {
      alert(`Please fix the following errors:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Supabase Storage first
      let uploadedImages: { url: string; path: string }[] = [];
      if (step3Data.images && Array.isArray(step3Data.images) && step3Data.images.length > 0) {
        // Filter out any non-File objects
        const validFiles = step3Data.images.filter(img => img instanceof File);
        if (validFiles.length > 0) {
          try {
            uploadedImages = await uploadMultipleImages(validFiles);
            console.log('Images uploaded successfully:', uploadedImages);
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError);
            alert('Failed to upload images. Please try again.');
            return;
          }
        }
      }

      // Process all form data using helper function
      const processedData = processApartmentFormData(step1Data, step2Data, step3Data, step4Data);
      
      // Convert to format expected by addApartment with individual columns
      const apartmentData = {
        name: processedData.name,
        location: processedData.location,
        price_per_night: processedData.price_per_night,
        max_guests: processedData.max_guests,
        bedrooms: processedData.bedrooms,
        bathrooms: processedData.bathrooms,
        description: processedData.description,
        featured: processedData.featured,
        is_draft: false,
        // Location details
        street_name: processedData.street_name,
        building_number: processedData.building_number,
        apartment_number: processedData.apartment_number,
        additional_details: processedData.additional_details,
        google_location: processedData.google_location,
        latitude: processedData.latitude,
        longitude: processedData.longitude,
        // Image details - use uploaded URLs
        primary_image: uploadedImages.length > 0 ? uploadedImages[0].url : null,
        image_urls: uploadedImages.map(img => img.url),
        image_count: uploadedImages.length,
        // Bedroom details
        total_beds: processedData.total_beds,
        bedroom_1_beds: processedData.bedroom_1_beds,
        bedroom_1_bed_types: processedData.bedroom_1_bed_types,
        bedroom_2_beds: processedData.bedroom_2_beds,
        bedroom_2_bed_types: processedData.bedroom_2_bed_types,
        bedroom_3_beds: processedData.bedroom_3_beds,
        bedroom_3_bed_types: processedData.bedroom_3_bed_types,
        bedroom_4_beds: processedData.bedroom_4_beds,
        bedroom_4_bed_types: processedData.bedroom_4_bed_types,
        bedroom_5_beds: processedData.bedroom_5_beds,
        bedroom_5_bed_types: processedData.bedroom_5_bed_types,
        // Amenities (individual boolean fields)
        wifi: processedData.wifi,
        air_conditioning: processedData.air_conditioning,
        heating: processedData.heating,
        kitchen: processedData.kitchen,
        washer: processedData.washer,
        dryer: processedData.dryer,
        parking: processedData.parking,
        elevator: processedData.elevator,
        gym: processedData.gym,
        pool: processedData.pool,
        balcony: processedData.balcony,
        terrace: processedData.terrace,
        tv: processedData.tv,
        netflix: processedData.netflix,
        workspace: processedData.workspace,
        iron: processedData.iron,
        hair_dryer: processedData.hair_dryer,
        shampoo: processedData.shampoo,
        soap: processedData.soap,
        towels: processedData.towels,
        bed_linen: processedData.bed_linen,
        coffee_maker: processedData.coffee_maker,
        microwave: processedData.microwave,
        dishwasher: processedData.dishwasher,
        refrigerator: processedData.refrigerator,
        oven: processedData.oven,
        stove: processedData.stove,
        bbq: processedData.bbq,
        garden: processedData.garden,
        security: processedData.security,
        smoke_detector: processedData.smoke_detector,
        first_aid: processedData.first_aid,
        fire_extinguisher: processedData.fire_extinguisher,
      };

      console.log("Submitting apartment data:", apartmentData);

      // Validate data lengths before submission
      const validationErrors = [];
      
      if (apartmentData.name && apartmentData.name.length > 1000) {
        validationErrors.push("Apartment name is too long (max 1000 characters)");
      }
      if (apartmentData.location && apartmentData.location.length > 1000) {
        validationErrors.push("Location is too long (max 1000 characters)");
      }
      if (apartmentData.street_name && apartmentData.street_name.length > 1000) {
        validationErrors.push("Street name is too long (max 1000 characters)");
      }
      if (apartmentData.building_number && apartmentData.building_number.length > 100) {
        validationErrors.push("Building number is too long (max 100 characters)");
      }
      if (apartmentData.apartment_number && apartmentData.apartment_number.length > 100) {
        validationErrors.push("Apartment number is too long (max 100 characters)");
      }
      if (apartmentData.primary_image && apartmentData.primary_image.length > 5000) {
        validationErrors.push("Primary image URL is too long (max 5000 characters)");
      }
      
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        return;
      }

      // Add the apartment
      await addApartment(apartmentData);

      // Clear all session storage - all drafts are cleared when listing is successfully uploaded
      sessionStorage.removeItem("listingStep1");
      sessionStorage.removeItem("listingStep2");
      sessionStorage.removeItem("listingStep3");
      sessionStorage.removeItem("listingStep4");
      sessionStorage.removeItem("listingStep5");
      
      // Also clear any other potential draft data
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('listingStep')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));

      // Redirect to listings page
      navigate("/admin/listings");
    } catch (error) {
      console.error("Error submitting apartment:", error);
      alert("Error creating apartment listing. Please try again.");
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
      // Upload images to Supabase Storage first
      let uploadedImages: { url: string; path: string }[] = [];
      if (step3Data.images && Array.isArray(step3Data.images) && step3Data.images.length > 0) {
        // Filter out any non-File objects
        const validFiles = step3Data.images.filter(img => img instanceof File);
        if (validFiles.length > 0) {
          try {
            uploadedImages = await uploadMultipleImages(validFiles);
            console.log('Images uploaded successfully for draft:', uploadedImages);
          } catch (uploadError) {
            console.error('Error uploading images for draft:', uploadError);
            alert('Failed to upload images. Please try again.');
            return;
          }
        }
      }

      // Process all form data using helper function
      const processedData = processApartmentFormData(step1Data, step2Data, step3Data, step4Data);
      
      // Convert to format expected by addApartment with draft flag and individual columns
      const apartmentData = {
        name: processedData.name,
        location: processedData.location,
        price_per_night: processedData.price_per_night,
        max_guests: processedData.max_guests,
        bedrooms: processedData.bedrooms,
        bathrooms: processedData.bathrooms,
        description: processedData.description,
        featured: false,
        is_draft: true,
        // Location details
        street_name: processedData.street_name,
        building_number: processedData.building_number,
        apartment_number: processedData.apartment_number,
        additional_details: processedData.additional_details,
        google_location: processedData.google_location,
        latitude: processedData.latitude,
        longitude: processedData.longitude,
        // Image details - use uploaded URLs
        primary_image: uploadedImages.length > 0 ? uploadedImages[0].url : null,
        image_urls: uploadedImages.map(img => img.url),
        image_count: uploadedImages.length,
        // Bedroom details
        total_beds: processedData.total_beds,
        bedroom_1_beds: processedData.bedroom_1_beds,
        bedroom_1_bed_types: processedData.bedroom_1_bed_types,
        bedroom_2_beds: processedData.bedroom_2_beds,
        bedroom_2_bed_types: processedData.bedroom_2_bed_types,
        bedroom_3_beds: processedData.bedroom_3_beds,
        bedroom_3_bed_types: processedData.bedroom_3_bed_types,
        bedroom_4_beds: processedData.bedroom_4_beds,
        bedroom_4_bed_types: processedData.bedroom_4_bed_types,
        bedroom_5_beds: processedData.bedroom_5_beds,
        bedroom_5_bed_types: processedData.bedroom_5_bed_types,
        // Amenities (individual boolean fields)
        wifi: processedData.wifi,
        air_conditioning: processedData.air_conditioning,
        heating: processedData.heating,
        kitchen: processedData.kitchen,
        washer: processedData.washer,
        dryer: processedData.dryer,
        parking: processedData.parking,
        elevator: processedData.elevator,
        gym: processedData.gym,
        pool: processedData.pool,
        balcony: processedData.balcony,
        terrace: processedData.terrace,
        tv: processedData.tv,
        netflix: processedData.netflix,
        workspace: processedData.workspace,
        iron: processedData.iron,
        hair_dryer: processedData.hair_dryer,
        shampoo: processedData.shampoo,
        soap: processedData.soap,
        towels: processedData.towels,
        bed_linen: processedData.bed_linen,
        coffee_maker: processedData.coffee_maker,
        microwave: processedData.microwave,
        dishwasher: processedData.dishwasher,
        refrigerator: processedData.refrigerator,
        oven: processedData.oven,
        stove: processedData.stove,
        bbq: processedData.bbq,
        garden: processedData.garden,
        security: processedData.security,
        smoke_detector: processedData.smoke_detector,
        first_aid: processedData.first_aid,
        fire_extinguisher: processedData.fire_extinguisher,
      };

      console.log("Saving apartment as draft:", apartmentData);

      // Validate data lengths before submission
      const validationErrors = [];
      
      if (apartmentData.name && apartmentData.name.length > 1000) {
        validationErrors.push("Apartment name is too long (max 1000 characters)");
      }
      if (apartmentData.location && apartmentData.location.length > 1000) {
        validationErrors.push("Location is too long (max 1000 characters)");
      }
      if (apartmentData.street_name && apartmentData.street_name.length > 1000) {
        validationErrors.push("Street name is too long (max 1000 characters)");
      }
      if (apartmentData.building_number && apartmentData.building_number.length > 100) {
        validationErrors.push("Building number is too long (max 100 characters)");
      }
      if (apartmentData.apartment_number && apartmentData.apartment_number.length > 100) {
        validationErrors.push("Apartment number is too long (max 100 characters)");
      }
      // No need to validate image URLs since we're now using proper Supabase Storage URLs
      
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        return;
      }

      // Add the apartment as draft
      await addApartment(apartmentData);

      // Clear all session storage
      sessionStorage.removeItem("listingStep1");
      sessionStorage.removeItem("listingStep2");
      sessionStorage.removeItem("listingStep3");
      sessionStorage.removeItem("listingStep4");
      sessionStorage.removeItem("listingStep5");
      
      // Also clear any other potential draft data
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('listingStep')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));

      // Redirect to listings page
      navigate("/admin/listings");
    } catch (error) {
      console.error("Error saving apartment as draft:", error);
      alert("Error saving apartment as draft. Please try again.");
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
                  {step3Data.images && step3Data.images.length > 0 ? (
                    <span className="text-green-600 font-medium">
                      {step3Data.images.length} image{step3Data.images.length !== 1 ? 's' : ''} uploaded
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No images uploaded</span>
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
            </div>
          </CardContent>
        </Card>

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