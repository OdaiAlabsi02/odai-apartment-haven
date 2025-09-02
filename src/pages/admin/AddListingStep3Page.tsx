import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { UploadedImage } from "@/lib/imageUpload";

export default function AddListingStep3Page() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [step1Data, setStep1Data] = useState<any>(null);
  const [step2Data, setStep2Data] = useState<any>(null);

  useEffect(() => {
    // Load data from previous steps
    const step1DataStr = sessionStorage.getItem("listingStep1");
    const step2DataStr = sessionStorage.getItem("listingStep2");
    const step3DataStr = sessionStorage.getItem("listingStep3");
    
    if (step1DataStr) {
      setStep1Data(JSON.parse(step1DataStr));
    }
    if (step2DataStr) {
      setStep2Data(JSON.parse(step2DataStr));
    }
    if (step3DataStr) {
      const step3Data = JSON.parse(step3DataStr);
      // Restore uploaded images URLs
      if (step3Data.uploadedImages) {
        setUploadedImages(step3Data.uploadedImages);
      }
    }
    
    if (!step1DataStr || !step2DataStr) {
      // If no previous step data, redirect back to step 1
      navigate("/admin/add-listing/step1");
    }
  }, [navigate]);

  // Auto-save functionality
  const saveDraft = () => {
    // Save uploaded images URLs (File objects can't be serialized)
    sessionStorage.setItem("listingStep3", JSON.stringify({ 
      uploadedImages: uploadedImages,
      imageCount: uploadedImages.length
    }));
  };

  // Auto-save on images changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [uploadedImages]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploadedImages]);

  const handleBack = () => {
    // Save current step data
    saveDraft();
    navigate("/admin/add-listing/step2");
  };

  const handleNext = () => {
    if (uploadedImages.length === 0) {
      alert("Please upload at least one image before proceeding.");
      return;
    }
    // Store form data in sessionStorage for multi-step flow
    saveDraft();
    navigate("/admin/add-listing/step4");
  };

  if (!step1Data || !step2Data) {
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
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              3
            </div>
            <span>Images</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
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
          <CardTitle>Step 3: Upload Images</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload high-quality photos of your apartment. You can upload multiple images.
          </p>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            uploadedImages={uploadedImages}
            onUploadedImagesChange={setUploadedImages}
            maxImages={30}
            autoUpload={true}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Step 2
        </Button>
        <Button 
          type="button" 
          onClick={handleNext}
          disabled={uploadedImages.length === 0}
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 