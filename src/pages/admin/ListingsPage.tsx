import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, MapPin, Users, Bed, Bath, DollarSign, Search, Star, Loader2, FileX, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

// New types matching the new schema
type Property = {
  id: string;
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  base_price: number;
  cleaning_fee: number;
  is_active: boolean;
  is_instant_book: boolean;
  featured?: boolean;
  created_at: string;
  updated_at: string;
};

type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Property[]>([]);
  const [images, setImages] = useState<Record<string, PropertyImage | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setListings(data || []);
      setLoading(false);
      // Fetch main images for each property
      if (data && data.length > 0) {
        const ids = data.map((p: Property) => p.id);
        const { data: imgData } = await supabase
          .from("property_images")
          .select("*")
          .in("property_id", ids)
          .order("display_order", { ascending: true });
        const imgMap: Record<string, PropertyImage | undefined> = {};
        if (imgData) {
          for (const img of imgData) {
            if (!imgMap[img.property_id] || img.is_primary) {
              imgMap[img.property_id] = img;
            }
          }
        }
        setImages(imgMap);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.city.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleDeleteListing = async (id: string) => {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      setListings(listings => listings.filter(l => l.id !== id));
      toast({
        title: "Deleted",
        description: "Listing deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing.",
        variant: "destructive"
      });
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      const listing = listings.find(l => l.id === id);
      if (listing) {
        const { error } = await supabase
          .from("properties")
          .update({ featured: !listing.featured })
          .eq("id", id);
        if (error) throw error;
        setListings(listings =>
          listings.map(l =>
            l.id === id ? { ...l, featured: !l.featured } : l
          )
        );
        toast({
          title: "Updated",
          description: "Listing featured status updated."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing.",
        variant: "destructive"
      });
    }
  };

  const clearDrafts = () => {
    // Clear all draft data from sessionStorage
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('listingStep')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    toast({
      title: "Drafts Cleared",
      description: "All saved drafts have been cleared successfully."
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading listings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your listings</h1>
            <p className="text-muted-foreground">Manage all property listings and their details</p>
          </div>
          <Button className="bg-button-gradient hover:opacity-90 transition-opacity" onClick={() => navigate("/admin/add-listing")}> <Plus className="h-4 w-4 mr-2" /> Add New Listing </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <FileX className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your listings</h1>
          <p className="text-muted-foreground">Manage all property listings and their details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={clearDrafts}
            className="text-muted-foreground hover:text-foreground"
          >
            <FileX className="h-4 w-4 mr-2" />
            Clear Drafts
          </Button>
          <Button className="bg-button-gradient hover:opacity-90 transition-opacity" onClick={() => navigate("/admin/add-listing/step1")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Listings ({listings.length})</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {searchTerm ? "No listings found matching your search." : "No listings yet. Click 'Add New Listing' to create your first apartment."}
            </div>
          ) : viewMode === "grid" ? (
            // Grid View - Card Layout
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card 
                  key={listing.id} 
                  className={"group overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer"}
                  onClick={() => navigate(`/admin/listing-editor/${listing.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={images[listing.id]?.image_url || '/placeholder.svg'}
                      alt={listing.title}
                      className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"}
                    />
                    {/* Removed status badges */}
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-sm font-semibold">${listing.base_price}/night</span>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className={`font-semibold text-lg leading-tight`}>
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {(listing.city || '').trim() || 'No location'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{listing.max_guests}</span>
                        </div>
                        <div className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          <span>{listing.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-3 w-3 mr-1" />
                          <span>{listing.bathrooms}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(listing.id)}
                        className={`text-accent hover:text-accent flex-1 ${listing.featured ? 'bg-accent/10' : ''}`}
                        title="Toggle Featured"
                      >
                        <Star className={`h-4 w-4 mr-1 ${listing.featured ? 'fill-current' : ''}`} />
                        {listing.featured ? 'Featured' : 'Feature'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        title="Edit Listing"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteListing(listing.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // List View - Table Layout (existing code)
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Property</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Details</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className={`border-b`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={images[listing.id]?.image_url || '/placeholder.svg'}
                            alt={listing.title}
                            className={`w-16 h-16 rounded-lg object-cover ${listing.is_active ? "" : "grayscale"}`}
                          />
                          <div>
                            <div className={`font-medium ${listing.is_active ? "" : "text-muted-foreground"}`}>
                              {listing.title}
                              {!listing.is_active && " (Inactive)"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(listing).filter(([key, value]) => typeof value === 'boolean' && value).length} amenities
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center text-sm`}>
                          <MapPin className="h-3 w-3 mr-1" />
                          {listing.city}, {listing.state}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center font-medium`}>
                          <DollarSign className="h-4 w-4" />
                          ${listing.base_price}/night
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-4 text-sm`}>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {listing.max_guests} guests
                          </div>
                          <div className="flex items-center">
                            <Bed className="h-3 w-3 mr-1" />
                            {listing.bedrooms}
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-3 w-3 mr-1" />
                            {listing.bathrooms}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {!listing.is_active ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary"
                                title="Activate Listing"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteListing(listing.id)}
                                className="text-destructive hover:text-destructive"
                                title="Delete Listing"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFeatured(listing.id)}
                                className="text-accent hover:text-accent"
                                title="Toggle Featured"
                              >
                                <Star className={`h-4 w-4 ${listing.featured ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary"
                                title="Edit Listing"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteListing(listing.id)}
                                className="text-destructive hover:text-destructive"
                                title="Delete Listing"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}