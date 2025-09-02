import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, X, Move, Star, Image as ImageIcon, Trash2, Info } from "lucide-react";
import { Apartment } from "@/data/apartments";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface PhotoTourSectionProps {
  listing: Apartment;
  onUpdate: (data: Partial<Apartment>) => void;
}

interface Photo {
  id: string;
  url: string;
  category: string;
  isPrimary: boolean;
  order: number;
}

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  alt_text: string | null;
}

const photoCategories = [
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "living_room", label: "Living Room" },
  { value: "dining_room", label: "Dining Room" },
  { value: "balcony", label: "Balcony" },
  { value: "exterior", label: "Exterior" },
  { value: "amenities", label: "Amenities" },
  { value: "other", label: "Other" }
];

export default function PhotoTourSection({ listing, onUpdate }: PhotoTourSectionProps) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch images from property_images table
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const { data: propertyImages, error } = await supabase
          .from('property_images')
          .select('*')
          .eq('property_id', listing.id)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching images:', error);
          toast({
            title: "Error",
            description: "Failed to load images",
            variant: "destructive"
          });
          return;
        }

        if (propertyImages && propertyImages.length > 0) {
          const fetchedPhotos: Photo[] = propertyImages.map((img: PropertyImage) => ({
            id: img.id,
            url: img.image_url,
            category: (img as any).alt_text || "other",
            isPrimary: img.is_primary,
            order: img.display_order
          }));
          setPhotos(fetchedPhotos);
        } else {
          setPhotos([]);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (listing.id) {
      fetchImages();
    }
  }, [listing.id, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: Photo = {
            id: `photo-${Date.now()}`,
            url: e.target?.result as string,
            category: "other",
            isPrimary: photos.length === 0,
            order: photos.length
          };
          
          setPhotos(prev => [...prev, newPhoto]);
          updateListingPhotos([...photos, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [photos]);

  const updateListingPhotos = (updatedPhotos: Photo[]) => {
    const primaryPhoto = updatedPhotos.find(p => p.isPrimary);
    const otherPhotos = updatedPhotos.filter(p => !p.isPrimary).map(p => p.url);
    
    onUpdate({
      primary_image: primaryPhoto?.url || "",
      image_urls: otherPhotos,
      image_count: updatedPhotos.length
    });
  };

  const persistPrimaryPhoto = async (photoId: string) => {
    try {
      // Clear existing primary
      const { error: clearErr } = await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', listing.id);
      if (clearErr) throw clearErr;

      // Set new primary
      const { error: setErr } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', photoId);
      if (setErr) throw setErr;
    } catch (error) {
      console.error('Error persisting primary photo:', error);
      toast({ title: 'Error', description: 'Failed to set primary photo.', variant: 'destructive' });
    }
  };

  const handleSetPrimary = (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    }));
    
    setPhotos(updatedPhotos);
    updateListingPhotos(updatedPhotos);
    // Persist to database
    void persistPrimaryPhoto(photoId);
    
    toast({
      title: "Primary photo updated",
      description: "The primary photo has been changed."
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);

    // Persist deletion
    (async () => {
      try {
        const { error } = await supabase
          .from('property_images')
          .delete()
          .eq('id', photoId);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting photo:', error);
        toast({ title: 'Error', description: 'Failed to delete photo.', variant: 'destructive' });
      }
    })();

    // If deleting primary, promote first remaining as primary and persist
    const deletedPhoto = photos.find(p => p.id === photoId);
    if (deletedPhoto?.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
      void persistPrimaryPhoto(updatedPhotos[0].id);
    }

    setPhotos(updatedPhotos);
    updateListingPhotos(updatedPhotos);

    toast({
      title: 'Photo deleted',
      description: 'The photo has been removed from your listing.'
    });
  };

  const handleCategoryChange = (photoId: string, category: string) => {
    const updatedPhotos = photos.map(photo => photo.id === photoId ? { ...photo, category } : photo);

    // Persist category in alt_text for the image row
    (async () => {
      try {
        const { error } = await supabase
          .from('property_images')
          .update({ alt_text: category })
          .eq('id', photoId);
        if (error) throw error;
      } catch (error) {
        console.error('Error saving photo category:', error);
        toast({ title: 'Error', description: 'Failed to save photo category.', variant: 'destructive' });
      }
    })();

    setPhotos(updatedPhotos);
    // Trigger parent editor to consider there are changes so the save button becomes clickable
    onUpdate({ image_count: updatedPhotos.length });
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!loading && photos.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Add photos of your space</h3>
              <p className="text-muted-foreground mb-4">
                Upload high-quality photos to help guests visualize your property.
              </p>
              <Button onClick={() => document.getElementById('photo-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose Photos
              </Button>
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Gallery */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading photos...</p>
          </CardContent>
        </Card>
      ) : photos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Photo Gallery ({photos.length} photos)</span>
              <Badge variant="secondary">
                {photos.filter(p => p.isPrimary).length > 0 ? "Primary photo set" : "No primary photo"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative border rounded-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={photo.url}
                      alt={`Photo ${photo.order + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                      <div className="absolute top-2 left-2 flex gap-1">
                        {photo.isPrimary && (
                          <Badge variant="secondary" className="bg-yellow-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleSetPrimary(photo.id)}
                          disabled={photo.isPrimary}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="absolute bottom-2 left-2 right-2">
                        <Select
                          value={photo.category}
                          onValueChange={(value) => handleCategoryChange(photo.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {photoCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add More Photos Button */}
            <div className="mt-6 text-center">
              <Button onClick={() => document.getElementById('photo-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Add More Photos
              </Button>
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No photos found for this listing. Upload some to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Photo Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>Use high-quality, well-lit photos that showcase your space clearly</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>Your primary photo should be the most attractive and representative of your space</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>Include photos of all major areas: bedrooms, bathrooms, kitchen, living room</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>Show amenities and unique features that make your property special</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 