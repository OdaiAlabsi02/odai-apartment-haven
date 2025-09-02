import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Key, Info, AlertCircle } from "lucide-react";
import { Apartment } from "@/data/apartments";

interface CheckInOutSectionProps {
  listing: Apartment;
  onUpdate: (data: Partial<Apartment>) => void;
}

const timeSlots = [
  { value: "00:00", label: "12:00 AM" },
  { value: "01:00", label: "1:00 AM" },
  { value: "02:00", label: "2:00 AM" },
  { value: "03:00", label: "3:00 AM" },
  { value: "04:00", label: "4:00 AM" },
  { value: "05:00", label: "5:00 AM" },
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "23:00", label: "11:00 PM" }
];

export default function CheckInOutSection({ listing, onUpdate }: CheckInOutSectionProps) {
  const checkInStart = listing.check_in_start || "15:00";
  const checkInEnd = listing.check_in_end || "18:00";
  const checkOutTime = listing.check_out_time || "11:00";
  const selfCheckIn = listing.self_check_in || false;
  const lateCheckOut = listing.late_check_out || false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Check-in & Check-out</h2>
        <p className="text-muted-foreground">Set when guests can arrive and depart from your property.</p>
      </div>

      {/* Check-in Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Check-in Times
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the time window when guests can check in. This helps you plan your day and ensures guests know when to arrive.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="check-in-start">Check-in start time</Label>
              <Select 
                value={checkInStart} 
                onValueChange={(value) => onUpdate({ check_in_start: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-in-end">Check-in end time</Label>
              <Select 
                value={checkInEnd} 
                onValueChange={(value) => onUpdate({ check_in_end: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Guest Information</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Guests will see: "Check-in between {checkInStart} and {checkInEnd}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Check-out Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Check-out Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="check-out-time">Check-out time</Label>
            <Select 
              value={checkOutTime} 
              onValueChange={(value) => onUpdate({ check_out_time: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Guest Information</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Guests will see: "Check-out by {checkOutTime}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Check-in Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Self check-in</Label>
              <p className="text-sm text-muted-foreground">
                Allow guests to check in without meeting you in person (e.g., smart lock, key box)
              </p>
            </div>
            <Switch
              checked={selfCheckIn}
              onCheckedChange={(checked) => onUpdate({ self_check_in: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Allow late check-out</Label>
              <p className="text-sm text-muted-foreground">
                Let guests stay past the standard check-out time (subject to availability)
              </p>
            </div>
            <Switch
              checked={lateCheckOut}
              onCheckedChange={(checked) => onUpdate({ late_check_out: checked })}
            />
          </div>

          {selfCheckIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Self check-in enabled</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Guests will receive instructions for self check-in. Make sure your check-in method is clearly described in your listing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {lateCheckOut && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Late check-out enabled</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Guests can request late check-out, but you can approve or decline based on your schedule and cleaning needs.
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
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Check-in window</span>
              <Badge variant="secondary">
                {checkInStart} - {checkInEnd}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Check-out time</span>
              <Badge variant="secondary">
                {checkOutTime}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Self check-in</span>
              <Badge variant={selfCheckIn ? "default" : "secondary"}>
                {selfCheckIn ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Late check-out</span>
              <Badge variant={lateCheckOut ? "default" : "secondary"}>
                {lateCheckOut ? "Allowed" : "Not allowed"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 