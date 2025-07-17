import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Wifi, Car, Utensils, Coffee, Shield, Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Amenity {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
}

const iconMap: Record<string, any> = {
  Wifi,
  Car,
  Utensils,
  Coffee,
  Shield,
  Waves
};

const categories = [
  "Essential",
  "Comfort",
  "Entertainment",
  "Safety",
  "Kitchen",
  "Outdoor",
  "Other"
];

const defaultAmenities: Amenity[] = [
  { id: "1", name: "Free WiFi", category: "Essential", icon: "Wifi", description: "High-speed internet access" },
  { id: "2", name: "Parking", category: "Essential", icon: "Car", description: "Free parking space" },
  { id: "3", name: "Full Kitchen", category: "Kitchen", icon: "Utensils", description: "Fully equipped kitchen" },
  { id: "4", name: "Coffee Machine", category: "Comfort", icon: "Coffee", description: "Premium coffee maker" },
  { id: "5", name: "Security System", category: "Safety", icon: "Shield", description: "24/7 security monitoring" },
  { id: "6", name: "Pool Access", category: "Outdoor", icon: "Waves", description: "Swimming pool access" },
];

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>(defaultAmenities);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const [newAmenity, setNewAmenity] = useState({
    name: "",
    category: "",
    icon: "Wifi",
    description: ""
  });

  const filteredAmenities = selectedCategory === "all" 
    ? amenities 
    : amenities.filter(amenity => amenity.category === selectedCategory);

  const handleAddAmenity = () => {
    if (!newAmenity.name || !newAmenity.category) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    const amenity: Amenity = {
      id: Date.now().toString(),
      ...newAmenity
    };

    setAmenities([...amenities, amenity]);
    setNewAmenity({
      name: "",
      category: "",
      icon: "Wifi",
      description: ""
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Amenity added successfully!"
    });
  };

  const handleDeleteAmenity = (id: string) => {
    setAmenities(amenities.filter(amenity => amenity.id !== id));
    toast({
      title: "Deleted",
      description: "Amenity deleted successfully."
    });
  };

  const getAmenityCountByCategory = (category: string) => {
    return amenities.filter(amenity => amenity.category === category).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Amenities Management</h1>
          <p className="text-muted-foreground">Manage amenities and assign them to listings</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-button-gradient hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Add Amenity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Amenity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amenity-name">Amenity Name *</Label>
                <Input
                  id="amenity-name"
                  value={newAmenity.name}
                  onChange={(e) => setNewAmenity({...newAmenity, name: e.target.value})}
                  placeholder="Free WiFi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenity-category">Category *</Label>
                <Select 
                  value={newAmenity.category} 
                  onValueChange={(value) => setNewAmenity({...newAmenity, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenity-icon">Icon</Label>
                <Select 
                  value={newAmenity.icon} 
                  onValueChange={(value) => setNewAmenity({...newAmenity, icon: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(iconMap).map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        {iconName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenity-description">Description</Label>
                <Input
                  id="amenity-description"
                  value={newAmenity.description}
                  onChange={(e) => setNewAmenity({...newAmenity, description: e.target.value})}
                  placeholder="Brief description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAmenity} className="bg-button-gradient hover:opacity-90">
                Add Amenity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCategory(category)}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getAmenityCountByCategory(category)}</div>
                <div className="text-sm text-muted-foreground">{category}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Amenities ({filteredAmenities.length})</CardTitle>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category} ({getAmenityCountByCategory(category)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAmenities.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No amenities found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAmenities.map((amenity) => {
                const IconComponent = iconMap[amenity.icon] || Wifi;
                return (
                  <div key={amenity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{amenity.name}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {amenity.category}
                          </Badge>
                          {amenity.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {amenity.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
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
                          onClick={() => handleDeleteAmenity(amenity.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}