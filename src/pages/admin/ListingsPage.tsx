import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, MapPin, Users, Bed, Bath, DollarSign, Search, Star } from "lucide-react";
import { apartments, Apartment } from "@/data/apartments";
import { useToast } from "@/hooks/use-toast";

export default function ListingsPage() {
  const [listings, setListings] = useState<Apartment[]>(apartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Apartment | null>(null);
  const { toast } = useToast();

  const [newListing, setNewListing] = useState({
    name: "",
    location: "",
    pricePerNight: 0,
    description: "",
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    images: [""],
    amenities: [] as string[],
    featured: false
  });

  const filteredListings = listings.filter(listing =>
    listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddListing = () => {
    if (!newListing.name || !newListing.location || newListing.pricePerNight <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    const listing: Apartment = {
      id: Date.now().toString(),
      ...newListing,
      images: newListing.images.filter(img => img.trim() !== "")
    };

    setListings([...listings, listing]);
    setNewListing({
      name: "",
      location: "",
      pricePerNight: 0,
      description: "",
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      images: [""],
      amenities: [],
      featured: false
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Listing added successfully!"
    });
  };

  const handleDeleteListing = (id: string) => {
    setListings(listings.filter(listing => listing.id !== id));
    toast({
      title: "Deleted",
      description: "Listing deleted successfully."
    });
  };

  const toggleFeatured = (id: string) => {
    setListings(listings.map(listing =>
      listing.id === id ? { ...listing, featured: !listing.featured } : listing
    ));
    toast({
      title: "Updated",
      description: "Listing featured status updated."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listings Management</h1>
          <p className="text-muted-foreground">Manage all apartment listings and their details</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-button-gradient hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Listing</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  value={newListing.name}
                  onChange={(e) => setNewListing({...newListing, name: e.target.value})}
                  placeholder="Modern Downtown Loft"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newListing.location}
                  onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                  placeholder="City Center, Downtown"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Night *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newListing.pricePerNight}
                  onChange={(e) => setNewListing({...newListing, pricePerNight: Number(e.target.value)})}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  value={newListing.maxGuests}
                  onChange={(e) => setNewListing({...newListing, maxGuests: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={newListing.bedrooms}
                  onChange={(e) => setNewListing({...newListing, bedrooms: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={newListing.bathrooms}
                  onChange={(e) => setNewListing({...newListing, bathrooms: Number(e.target.value)})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  placeholder="Describe your property..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={newListing.images[0]}
                  onChange={(e) => setNewListing({...newListing, images: [e.target.value]})}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddListing} className="bg-button-gradient hover:opacity-90">
                Add Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.images[0]}
                            alt={listing.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{listing.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {listing.amenities.length} amenities
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {listing.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center font-medium">
                          <DollarSign className="h-4 w-4" />
                          {listing.pricePerNight}/night
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {listing.maxGuests}
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
                          {listing.featured && (
                            <Badge variant="secondary" className="bg-accent text-accent-foreground">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-success border-success">
                            Active
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(listing.id)}
                            className="text-accent hover:text-accent"
                          >
                            <Star className={`h-4 w-4 ${listing.featured ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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