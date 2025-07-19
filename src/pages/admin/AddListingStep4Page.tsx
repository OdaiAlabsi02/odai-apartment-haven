import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";

const amenities = [
  { id: "wifi", label: "WiFi", category: "Essential" },
  { id: "air_conditioning", label: "Air Conditioning", category: "Essential" },
  { id: "heating", label: "Heating", category: "Essential" },
  { id: "kitchen", label: "Kitchen", category: "Essential" },
  { id: "washer", label: "Washer", category: "Essential" },
  { id: "dryer", label: "Dryer", category: "Essential" },
  { id: "parking", label: "Free Parking", category: "Transportation" },
  { id: "elevator", label: "Elevator", category: "Building" },
  { id: "gym", label: "Gym", category: "Building" },
  { id: "pool", label: "Swimming Pool", category: "Building" },
  { id: "balcony", label: "Balcony", category: "Outdoor" },
  { id: "terrace", label: "Terrace", category: "Outdoor" },
  { id: "tv", label: "TV", category: "Entertainment" },
  { id: "netflix", label: "Netflix", category: "Entertainment" },
  { id: "workspace", label: "Workspace", category: "Work" },
  { id: "iron", label: "Iron", category: "Convenience" },
  { id: "hair_dryer", label: "Hair Dryer", category: "Convenience" },
  { id: "shampoo", label: "Shampoo", category: "Convenience" },
  { id: "soap", label: "Soap", category: "Convenience" },
  { id: "towels", label: "Towels", category: "Convenience" },
  { id: "bed_linen", label: "Bed Linen", category: "Convenience" },
  { id: "coffee_maker", label: "Coffee Maker", category: "Kitchen" },
  { id: "microwave", label: "Microwave", category: "Kitchen" },
  { id: "dishwasher", label: "Dishwasher", category: "Kitchen" },
  { id: "refrigerator", label: "Refrigerator", category: "Kitchen" },
  { id: "oven", label: "Oven", category: "Kitchen" },
  { id: "stove", label: "Stove", category: "Kitchen" },
  { id: "bbq", label: "BBQ Grill", category: "Outdoor" },
  { id: "garden", label: "Garden", category: "Outdoor" },
  { id: "security", label: "Security System", category: "Safety" },
  { id: "smoke_detector", label: "Smoke Detector", category: "Safety" },
  { id: "first_aid", label: "First Aid Kit", category: "Safety" },
  { id: "fire_extinguisher", label: "Fire Extinguisher", category: "Safety" },
];

const categories = ["Essential", "Transportation", "Building", "Outdoor", "Entertainment", "Work", "Convenience", "Kitchen", "Safety"];

export default function AddListingStep4Page() {
  const navigate = useNavigate();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [step1Data, setStep1Data] = useState<any>(null);
  const [step2Data, setStep2Data] = useState<any>(null);
  const [step3Data, setStep3Data] = useState<any>(null);

  useEffect(() => {
    // Load data from previous steps
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
      const step4Data = JSON.parse(step4DataStr);
      setSelectedAmenities(step4Data.selectedAmenities || []);
    }
    
    if (!step1DataStr || !step2DataStr || !step3DataStr) {
      // If no previous step data, redirect back to step 1
      navigate("/admin/add-listing/step1");
    }
  }, [navigate]);

  // Auto-save functionality
  const saveDraft = () => {
    sessionStorage.setItem("listingStep4", JSON.stringify({ selectedAmenities }));
  };

  // Auto-save on amenities changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [selectedAmenities]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedAmenities]);

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(id => id !== amenityId));
    }
  };

  const handleBack = () => {
    // Save current step data
    saveDraft();
    navigate("/admin/add-listing/step3");
  };

  const handleNext = () => {
    // Store form data in sessionStorage for multi-step flow
    saveDraft();
    navigate("/admin/add-listing/step5");
  };

  if (!step1Data || !step2Data || !step3Data) {
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
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              2
            </div>
            <span>Location</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              3
            </div>
            <span>Images</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              4
            </div>
            <span>Amenities</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              5
            </div>
            <span>Review</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 4: Choose Amenities</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the amenities available in your apartment. This helps guests know what to expect.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {amenities
                    .filter(amenity => amenity.category === category)
                    .map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={(checked) => 
                            handleAmenityChange(amenity.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={amenity.id} className="text-sm font-normal">
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Step 3
        </Button>
        <Button type="button" onClick={handleNext}>
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 