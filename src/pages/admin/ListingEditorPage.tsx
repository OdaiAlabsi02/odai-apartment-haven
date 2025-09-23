import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, EyeOff, Clock, Settings, Home, Camera, Calendar, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Apartment } from "@/data/apartments";

// Import the section components
import YourSpaceSection from "./editor-sections/YourSpaceSection";
import PhotoTourSection from "./editor-sections/PhotoTourSection";
import CheckInOutSection from "./editor-sections/CheckInOutSection";
import ListingStatusSection from "./editor-sections/ListingStatusSection";
import LocationSection from "./editor-sections/LocationSection";
import CalendarSection from "./editor-sections/CalendarSection";

export default function ListingEditorPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Apartment | null>(null);
  const [activeTab, setActiveTab] = useState("your-space");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOne = async () => {
      if (!listingId) return;
      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', listingId)
        .single();
      if (error || !property) {
        toast({ title: 'Listing not found', description: 'The requested listing could not be found.', variant: 'destructive' });
        navigate('/admin/listings');
        return;
      }
      // fetch images
      const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', listingId)
        .order('display_order', { ascending: true });
      const primary = images?.find(i => i.is_primary)?.image_url || images?.[0]?.image_url || null;
      const rest = (images || []).filter(i => !i.is_primary).map(i => i.image_url);
      setListing({
        ...property,
        title: property.title || property.name,
        city: property.city || property.location,
        base_price: property.base_price || property.price_per_night,
        primary_image: primary,
        image_urls: rest,
        image_count: images?.length || 0
      } as any);
    };
    fetchOne();
  }, [listingId, navigate, toast]);

  const handleSave = async () => {
    if (!listing) return;
    
    setIsSaving(true);
    try {
      const { image_urls, image_count, primary_image, latitude, longitude, street_name, building_number, floor_number, flat_number, neighborhood, country, ...sanitized } = listing as any;
      await supabase.from('properties').update(sanitized).eq('id', listing.id);

      // Upsert manual address fields into property_locations
      if (latitude || longitude || street_name || building_number || floor_number || flat_number || neighborhood || country) {
        await supabase.from('property_locations').upsert({
          property_id: listing.id,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          street_name: street_name || null,
          building_number: building_number || null,
          floor_number: floor_number || null,
          flat_number: flat_number || null,
          neighborhood: neighborhood || null,
          country: country || null
        });
      }

      // Sync images to property_images table
      try {
        // Remove existing
        await supabase.from('property_images').delete().eq('property_id', listing.id);
        const rows = [
          ...(primary_image ? [{ property_id: listing.id, image_url: String(primary_image), is_primary: true, display_order: 0 }] : []),
          ...((image_urls || []) as string[]).map((url, idx) => ({ property_id: listing.id, image_url: String(url), is_primary: false, display_order: idx + 1 }))
        ];
        if (rows.length > 0) {
          await supabase.from('property_images').insert(rows as any);
        }
      } catch {
        // Ignore image sync errors for now but still show success for property update
      }
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
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="your-space" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Your Space</span>
            </TabsTrigger>
            <TabsTrigger value="photo-tour" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Photo Tour</span>
            </TabsTrigger>
            <TabsTrigger value="check-in-out" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Check-in & Out</span>
            </TabsTrigger>
            <TabsTrigger value="listing-status" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Status & Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Location (optional)</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
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

          <TabsContent value="location" className="space-y-6">
            <LocationSection listing={listing} onUpdate={handleListingUpdate} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarSection listing={listing} onUpdate={handleListingUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 