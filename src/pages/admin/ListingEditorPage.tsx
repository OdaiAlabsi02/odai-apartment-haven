import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, EyeOff, Clock, Settings, Home, Camera, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApartments } from "@/hooks/useApartments";
import { Apartment } from "@/data/apartments";

// Import the section components
import YourSpaceSection from "./editor-sections/YourSpaceSection";
import PhotoTourSection from "./editor-sections/PhotoTourSection";
import CheckInOutSection from "./editor-sections/CheckInOutSection";
import ListingStatusSection from "./editor-sections/ListingStatusSection";

export default function ListingEditorPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { apartments, updateApartment } = useApartments();
  
  const [listing, setListing] = useState<Apartment | null>(null);
  const [activeTab, setActiveTab] = useState("your-space");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (listingId && apartments.length > 0) {
      const foundListing = apartments.find(apt => apt.id === listingId);
      if (foundListing) {
        setListing(foundListing);
      } else {
        toast({
          title: "Listing not found",
          description: "The requested listing could not be found.",
          variant: "destructive"
        });
        navigate("/admin/listings");
      }
    }
  }, [listingId, apartments, navigate, toast]);

  const handleSave = async () => {
    if (!listing) return;
    
    setIsSaving(true);
    try {
      await updateApartment(listing.id, listing);
      setHasUnsavedChanges(false);
      toast({
        title: "Saved successfully",
        description: "Your listing changes have been saved."
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your changes.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleListingUpdate = (updatedData: Partial<Apartment>) => {
    if (!listing) return;
    
    setListing({ ...listing, ...updatedData });
    setHasUnsavedChanges(true);
  };

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/listings")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h1 className="text-lg font-semibold">{listing.name}</h1>
              <p className="text-sm text-muted-foreground">{listing.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Unsaved changes
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-button-gradient hover:opacity-90 transition-opacity"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="your-space" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Your Space</span>
            </TabsTrigger>
            <TabsTrigger value="photo-tour" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Photo Tour</span>
            </TabsTrigger>
            <TabsTrigger value="check-in-out" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Check-in & Out</span>
            </TabsTrigger>
            <TabsTrigger value="listing-status" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Status & Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="your-space" className="space-y-6">
            <YourSpaceSection 
              listing={listing} 
              onUpdate={handleListingUpdate}
            />
          </TabsContent>

          <TabsContent value="photo-tour" className="space-y-6">
            <PhotoTourSection 
              listing={listing} 
              onUpdate={handleListingUpdate}
            />
          </TabsContent>

          <TabsContent value="check-in-out" className="space-y-6">
            <CheckInOutSection 
              listing={listing} 
              onUpdate={handleListingUpdate}
            />
          </TabsContent>

          <TabsContent value="listing-status" className="space-y-6">
            <ListingStatusSection 
              listing={listing} 
              onUpdate={handleListingUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 