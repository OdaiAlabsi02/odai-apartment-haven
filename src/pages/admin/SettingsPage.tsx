import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, Database, Shield, Bell, Globe, Mail, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "Odai's Apartment Booking",
    siteDescription: "Premium apartment rentals with exceptional service",
    adminEmail: "admin@example.com",
    supportEmail: "support@example.com",
    enableBookingNotifications: true,
    enableGuestNotifications: true,
    autoConfirmBookings: false,
    maintenanceMode: false,
    bookingLeadTime: 24,
    maxBookingDuration: 30,
    cancellationPolicy: "Guests can cancel up to 24 hours before check-in for a full refund."
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your admin settings have been updated successfully."
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure your application settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-button-gradient hover:opacity-90">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Booking Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingLeadTime">Booking Lead Time (hours)</Label>
              <Input
                id="bookingLeadTime"
                type="number"
                value={settings.bookingLeadTime}
                onChange={(e) => handleSettingChange('bookingLeadTime', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum time required before booking can start
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxBookingDuration">Max Booking Duration (days)</Label>
              <Input
                id="maxBookingDuration"
                type="number"
                value={settings.maxBookingDuration}
                onChange={(e) => handleSettingChange('maxBookingDuration', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of days for a single booking
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-confirm Bookings</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically confirm bookings without manual approval
                </p>
              </div>
              <Switch
                checked={settings.autoConfirmBookings}
                onCheckedChange={(checked) => handleSettingChange('autoConfirmBookings', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              value={settings.cancellationPolicy}
              onChange={(e) => handleSettingChange('cancellationPolicy', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Booking Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for new bookings and cancellations
              </p>
            </div>
            <Switch
              checked={settings.enableBookingNotifications}
              onCheckedChange={(checked) => handleSettingChange('enableBookingNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Guest Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send confirmation and reminder emails to guests
              </p>
            </div>
            <Switch
              checked={settings.enableGuestNotifications}
              onCheckedChange={(checked) => handleSettingChange('enableGuestNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable the site for maintenance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
              <Badge variant={settings.maintenanceMode ? "destructive" : "secondary"}>
                {settings.maintenanceMode ? "Maintenance" : "Active"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">Online</div>
              <div className="text-sm text-muted-foreground">System Status</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">2.1.0</div>
              <div className="text-sm text-muted-foreground">Version</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}