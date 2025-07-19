import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, MapPin, Users, Bed, Bath, DollarSign, Search, Star, Loader2, FileX } from "lucide-react";
import { Apartment } from "@/data/apartments";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useApartments } from "@/hooks/useApartments";

export default function ListingsPage() {
  const { apartments: listings, loading, error, deleteApartment, updateApartment } = useApartments();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingListing, setEditingListing] = useState<Apartment | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredListings = listings.filter(listing =>
    listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteApartment(id);
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
        await updateApartment(id, { featured: !listing.featured });
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
            <h1 className="text-3xl font-bold">Listings Management</h1>
            <p className="text-muted-foreground">Manage all apartment listings and their details</p>
          </div>
          <Button className="bg-button-gradient hover:opacity-90 transition-opacity" onClick={() => navigate("/admin/add-listing")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Error Loading Listings</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">Using demo data as fallback</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listings Management</h1>
          <p className="text-muted-foreground">Manage all apartment listings and their details</p>
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
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {searchTerm ? "No listings found matching your search." : "No listings yet. Click 'Add New Listing' to create your first apartment."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => (
                    <TableRow key={listing.id} className={listing.is_draft ? "opacity-60 bg-muted/30" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.primary_image || listing.image_urls?.[0] || '/placeholder.svg'}
                            alt={listing.name}
                            className={`w-16 h-16 rounded-lg object-cover ${listing.is_draft ? "grayscale" : ""}`}
                          />
                          <div>
                            <div className={`font-medium ${listing.is_draft ? "text-muted-foreground" : ""}`}>
                              {listing.name}
                              {listing.is_draft && " (Draft)"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(listing).filter(([key, value]) => typeof value === 'boolean' && value).length} amenities
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center text-sm ${listing.is_draft ? "text-muted-foreground" : ""}`}>
                          <MapPin className="h-3 w-3 mr-1" />
                          {listing.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center font-medium ${listing.is_draft ? "text-muted-foreground" : ""}`}>
                          <DollarSign className="h-4 w-4" />
                          ${listing.price_per_night}/night
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-4 text-sm ${listing.is_draft ? "text-muted-foreground" : "text-muted-foreground"}`}>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {listing.is_draft ? (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              Draft
                            </Badge>
                          ) : (
                            <>
                              {listing.featured && (
                                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-success border-success">
                                Active
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {listing.is_draft ? (
                            // Draft actions: Complete (edit) and Delete only
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary"
                                title="Complete Draft"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteListing(listing.id)}
                                className="text-destructive hover:text-destructive"
                                title="Delete Draft"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            // Published listing actions: Featured toggle, Edit, Delete
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}