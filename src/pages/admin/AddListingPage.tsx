import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { useApartments } from "@/hooks/useApartments";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AddListingPage() {
  const { user } = useAuth();
  const { addApartment } = useApartments();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    location: "",
    price_per_night: "",
    max_guests: "",
    description: "",
    bedrooms: "1",
    bathrooms: "1"
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in as admin.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      await addApartment({
        name: form.name,
        location: form.location,
        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
        primary_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        image_urls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        description: form.description || 'Beautiful apartment with modern amenities.',
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        featured: false,
        wifi: true,
        air_conditioning: true,
      });

      toast({
        title: "Success",
        description: "Listing added successfully!"
      });
      
      setForm({ name: "", location: "", price_per_night: "", max_guests: "", description: "", bedrooms: "1", bathrooms: "1" });
      setImages([]);
      navigate("/admin/listings");
    } catch (error) {
      console.error("Error adding listing:", error);
      toast({
        title: "Error",
        description: "Failed to add listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Listing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Apartment Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter apartment name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price_per_night">Price per Night</Label>
                <Input
                  id="price_per_night"
                  name="price_per_night"
                  placeholder="Enter price"
                  type="number"
                  min={10}
                  value={form.price_per_night}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_guests">Max Guests</Label>
                <Input
                  id="max_guests"
                  name="max_guests"
                  placeholder="Enter max guests"
                  type="number"
                  min={1}
                  value={form.max_guests}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  placeholder="Number of bedrooms"
                  type="number"
                  min={1}
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  placeholder="Number of bathrooms"
                  type="number"
                  min={1}
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the apartment, amenities, and what makes it special..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            {/* Image Upload */}
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 