import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function AddListingStep1Page() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    max_guests: "",
    bathrooms: "",
    price_per_night: "",
    description: "",
  });
  const [bedrooms, setBedrooms] = useState<Array<{ 
    id: string; 
    beds: Array<{ id: string; size: string }> 
  }>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addBedroom = () => {
    const newBedroom = {
      id: `bedroom-${Date.now()}`,
      beds: []
    };
    setBedrooms([...bedrooms, newBedroom]);
  };

  const removeBedroom = (bedroomId: string) => {
    setBedrooms(bedrooms.filter(bedroom => bedroom.id !== bedroomId));
  };

  const addBedToBedroom = (bedroomId: string) => {
    const newBed = {
      id: `bed-${Date.now()}`,
      size: ""
    };
    setBedrooms(bedrooms.map(bedroom => 
      bedroom.id === bedroomId 
        ? { ...bedroom, beds: [...bedroom.beds, newBed] }
        : bedroom
    ));
  };

  const removeBedFromBedroom = (bedroomId: string, bedId: string) => {
    setBedrooms(bedrooms.map(bedroom => 
      bedroom.id === bedroomId 
        ? { ...bedroom, beds: bedroom.beds.filter(bed => bed.id !== bedId) }
        : bedroom
    ));
  };

  const updateBedSize = (bedroomId: string, bedId: string, size: string) => {
    setBedrooms(bedrooms.map(bedroom => 
      bedroom.id === bedroomId 
        ? { 
            ...bedroom, 
            beds: bedroom.beds.map(bed => 
              bed.id === bedId ? { ...bed, size } : bed
            )
          }
        : bedroom
    ));
  };

  // Auto-save functionality
  const saveDraft = () => {
    sessionStorage.setItem("listingStep1", JSON.stringify({ ...form, bedrooms }));
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("listingStep1");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setForm({
          name: parsedData.name || "",
          max_guests: parsedData.max_guests || "",
          bathrooms: parsedData.bathrooms || "",
          price_per_night: parsedData.price_per_night || "",
          description: parsedData.description || "",
        });
        setBedrooms(parsedData.bedrooms || []);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Auto-save on form changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [form, bedrooms]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, bedrooms]);

  const handleNext = () => {
    // Validate required fields
    if (!form.name || !form.max_guests || !form.bathrooms || !form.price_per_night) {
      alert("Please fill in all required fields");
      return;
    }

    if (bedrooms.length === 0) {
      alert("Please add at least one bedroom");
      return;
    }

    // Check if each bedroom has at least one bed
    const totalBeds = bedrooms.reduce((total, bedroom) => total + bedroom.beds.length, 0);
    if (totalBeds === 0) {
      alert("Please add at least one bed across all bedrooms");
      return;
    }

    // Store form data in sessionStorage for multi-step flow
    sessionStorage.setItem("listingStep1", JSON.stringify({ ...form, bedrooms }));
    navigate("/admin/add-listing/step2");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Add New Listing</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
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
          <CardTitle>Step 1: Basic Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start by providing the basic details about your apartment.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Apartment Name *</Label>
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
              <Label htmlFor="max_guests">Max Guests *</Label>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Bedrooms & Beds *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBedroom}
                >
                  Add Bedroom
                </Button>
              </div>
              
              {bedrooms.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No bedrooms added yet. Click "Add Bedroom" to add bedrooms.
                </div>
              ) : (
                <div className="space-y-4">
                  {bedrooms.map((bedroom, bedroomIndex) => (
                    <div key={bedroom.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Bedroom {bedroomIndex + 1}</h4>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addBedToBedroom(bedroom.id)}
                          >
                            Add Bed
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeBedroom(bedroom.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove Bedroom
                          </Button>
                        </div>
                      </div>
                      
                      {bedroom.beds.length === 0 ? (
                        <div className="text-center py-2 text-muted-foreground text-sm">
                          No beds in this bedroom. Click "Add Bed" to add beds.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {bedroom.beds.map((bed, bedIndex) => (
                            <div key={bed.id} className="flex items-center space-x-3 p-2 border rounded">
                              <div className="flex-1">
                                <Label htmlFor={`bed-${bed.id}`} className="text-sm">
                                  Bed {bedIndex + 1} Size *
                                </Label>
                                <Input
                                  id={`bed-${bed.id}`}
                                  placeholder="e.g., Queen, King, Twin, Single"
                                  value={bed.size}
                                  onChange={(e) => updateBedSize(bedroom.id, bed.id, e.target.value)}
                                  required
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeBedFromBedroom(bedroom.id, bed.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Number of Bathrooms *</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  placeholder="Enter number of bathrooms"
                  type="number"
                  min={1}
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_per_night">Price per Night *</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Property Details</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the apartment, amenities, and what makes it special..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/listings")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Button>
              <Button type="button" onClick={handleNext}>
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 