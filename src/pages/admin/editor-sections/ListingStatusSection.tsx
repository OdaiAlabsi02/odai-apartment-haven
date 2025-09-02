import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, EyeOff, Clock, Settings, Info, AlertCircle, Globe, Lock } from "lucide-react";
import { Apartment } from "@/data/apartments";

interface ListingStatusSectionProps {
  listing: Apartment;
  onUpdate: (data: Partial<Apartment>) => void;
}

const listingStatuses = [
  { value: "listed", label: "Listed", description: "Active and bookable" },
  { value: "snoozed", label: "Snoozed", description: "Temporarily hidden" },
  { value: "unlisted", label: "Unlisted", description: "Not visible publicly" }
];

export default function ListingStatusSection({ listing, onUpdate }: ListingStatusSectionProps) {
  const status = listing.status || "listed";
  const instantBook = listing.instant_book || false;
  const manualApproval = listing.manual_approval || false;
  const publicVisibility = listing.public_visibility !== false; // Default to true

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Status & Preferences</h2>
        <p className="text-muted-foreground">Control your listing's visibility and booking settings.</p>
      </div>

      {/* Listing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Listing Status
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control whether your listing is visible to guests and accepting bookings.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="listing-status">Current status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => onUpdate({ status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {listingStatuses.map((statusOption) => (
                  <SelectItem key={statusOption.value} value={statusOption.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{statusOption.label}</span>
                      <span className="text-xs text-muted-foreground">{statusOption.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "listed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Listing is active</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your listing is visible to guests and accepting bookings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "snoozed" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Listing is snoozed</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Your listing is temporarily hidden from guests. Existing bookings are not affected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "unlisted" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <EyeOff className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Listing is unlisted</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your listing is not visible to guests. Only accessible via direct link.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Booking Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Instant Book</Label>
              <p className="text-sm text-muted-foreground">
                Allow guests to book instantly without requiring your approval
              </p>
            </div>
            <Switch
              checked={instantBook}
              onCheckedChange={(checked) => onUpdate({ instant_book: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Manual approval required</Label>
              <p className="text-sm text-muted-foreground">
                Review and approve all booking requests before confirming
              </p>
            </div>
            <Switch
              checked={manualApproval}
              onCheckedChange={(checked) => onUpdate({ manual_approval: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Public visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show your listing in search results and recommendations
              </p>
            </div>
            <Switch
              checked={publicVisibility}
              onCheckedChange={(checked) => onUpdate({ public_visibility: checked })}
            />
          </div>

          {instantBook && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Instant Book enabled</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Guests can book your property immediately without waiting for approval. Make sure your calendar is up to date.
                  </p>
                </div>
              </div>
            </div>
          )}

          {manualApproval && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Manual approval enabled</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    You'll need to review and approve each booking request. Guests will be notified when you respond.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!publicVisibility && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Private listing</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Your listing is only accessible via direct link. It won't appear in search results.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Listing status</span>
              <Badge 
                variant={
                  status === "listed" ? "default" : 
                  status === "snoozed" ? "secondary" : "destructive"
                }
              >
                {status === "listed" ? "Listed" : 
                 status === "snoozed" ? "Snoozed" : "Unlisted"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Instant Book</span>
              <Badge variant={instantBook ? "default" : "secondary"}>
                {instantBook ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Manual approval</span>
              <Badge variant={manualApproval ? "default" : "secondary"}>
                {manualApproval ? "Required" : "Not required"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Public visibility</span>
              <Badge variant={publicVisibility ? "default" : "secondary"}>
                {publicVisibility ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 