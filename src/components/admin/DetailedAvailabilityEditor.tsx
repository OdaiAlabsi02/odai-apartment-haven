import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, DollarSign, Moon, Clock, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailabilitySettings {
  id?: string;
  property_id: string;
  date: string;
  is_available: boolean;
  price?: number;
  minimum_stay?: number;
  is_instant_book: boolean;
  notes?: string;
}

interface DetailedAvailabilityEditorProps {
  date: string;
  availability: AvailabilitySettings;
  onUpdate: (date: string, updates: Partial<AvailabilitySettings>) => Promise<void>;
  onClose: () => void;
}

export function DetailedAvailabilityEditor({
  date,
  availability,
  onUpdate,
  onClose
}: DetailedAvailabilityEditorProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<AvailabilitySettings>({
    property_id: availability?.property_id || '',
    date: availability?.date || date,
    is_available: availability?.is_available ?? true,
    price: availability?.price || 0,
    minimum_stay: availability?.minimum_stay || 1,
    is_instant_book: availability?.is_instant_book ?? true,
    notes: availability?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  // Add null check for availability
  if (!availability) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No availability data for this date</p>
            <Button onClick={onClose} variant="outline" className="mt-4">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(date, formData);
      setEditing(false);
      toast({
        title: "Success",
        description: "Availability settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(availability);
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isPast = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatDate(date)}
          </div>
          <div className="flex gap-2">
            {isToday(date) && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Today
              </Badge>
            )}
            {isPast(date) && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Past
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          // Edit Mode
          <div className="space-y-4">
            {/* Availability Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="availability">Available for Booking</Label>
              <Switch
                id="availability"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                disabled={isPast(date)}
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price per Night ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                placeholder="Enter price"
                min="0"
                step="0.01"
              />
            </div>

            {/* Minimum Stay */}
            <div>
              <Label htmlFor="minimumStay">Minimum Stay (nights)</Label>
              <Input
                id="minimumStay"
                type="number"
                value={formData.minimum_stay || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_stay: parseInt(e.target.value) || undefined }))}
                placeholder="Enter minimum stay"
                min="1"
              />
            </div>

            {/* Instant Book */}
            <div className="flex items-center justify-between">
              <Label htmlFor="instantBook">Instant Booking</Label>
              <Switch
                id="instantBook"
                checked={formData.is_instant_book}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_instant_book: checked }))}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any special notes for this date..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Status</span>
              <Badge variant={availability?.is_available ? "default" : "secondary"}>
                {availability?.is_available ? "Available" : "Unavailable"}
              </Badge>
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Price</span>
              <span className="text-lg font-bold text-green-600">
                ${availability?.price || "Not set"}
              </span>
            </div>

            {/* Minimum Stay Display */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Minimum Stay</span>
              <span className="text-lg font-medium">
                {availability?.minimum_stay || "Not set"} night{(availability?.minimum_stay || 1) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Instant Book Display */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Instant Booking</span>
              <Badge variant={availability?.is_instant_book ? "default" : "secondary"}>
                {availability?.is_instant_book ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {/* Notes Display */}
            {availability?.notes && (
              <div className="p-3 border rounded-lg">
                <span className="font-medium block mb-2">Notes</span>
                <p className="text-sm text-muted-foreground">{availability.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => setEditing(true)} 
                disabled={isPast(date)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
