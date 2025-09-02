import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, DollarSign, Moon, Clock, X, Check, Minus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { DetailedAvailabilityEditor } from "@/components/admin/DetailedAvailabilityEditor";

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

interface Property {
  id: string;
  title: string;
  base_price: number;
  minimum_stay: number;
}

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<AvailabilitySettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkSettings, setBulkSettings] = useState({
    isAvailable: true,
    price: "",
    minimumStay: "",
    instantBook: true
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailedEditor, setShowDetailedEditor] = useState(false);

  // Fetch properties for the admin
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('properties')
          .select('id, title, base_price, minimum_stay')
          .eq('host_id', user.id);

        if (error) throw error;
        setProperties(data || []);
        
        if (data && data.length > 0) {
          setSelectedProperty(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive"
        });
      }
    };

    fetchProperties();
  }, [toast]);

  // Fetch availability data when property or month changes
  useEffect(() => {
    if (selectedProperty) {
      fetchAvailabilityData();
    }
  }, [selectedProperty, currentMonth]);

  const fetchAvailabilityData = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      console.log('Fetching availability for:', { selectedProperty, startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] });
      
      // Fetch availability settings
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('property_id', selectedProperty)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (availabilityError) throw availabilityError;

      // Fetch existing bookings for the same period
      // We need to catch all bookings that overlap with the month, not just those contained within it
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', selectedProperty)
        .or(`and(check_in_date.lte.${endDate.toISOString().split('T')[0]},check_out_date.gte.${startDate.toISOString().split('T')[0]})`);

      console.log('Fetched bookings for month:', { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0], bookingsData });

      if (bookingsError) {
        console.warn('Error fetching bookings:', bookingsError);
      }

      // Debug: Let's also check all bookings for this property to see what we have
      const { data: allBookings, error: allBookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', selectedProperty);

      if (allBookingsError) {
        console.warn('Error fetching all bookings:', allBookingsError);
      } else {
        console.log('All bookings for property:', allBookings);
      }

      // Generate calendar dates for the month
      const calendarDates: AvailabilitySettings[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if this date has existing availability settings
        const existingAvailability = availabilityData?.find(item => item.date === dateStr);
        
        // Check if this date is within any existing booking
        const isBooked = bookingsData?.some(booking => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          const currentDateObj = new Date(dateStr);
          const isInRange = currentDateObj >= checkIn && currentDateObj < checkOut;
          
          // Debug logging for the first few dates
          if (currentDate.getDate() <= 5) {
            console.log(`Date ${dateStr}: checkIn=${booking.check_in_date}, checkOut=${booking.check_out_date}, isInRange=${isInRange}`);
          }
          
          return isInRange;
        }) || false;

        if (existingAvailability) {
          // Use existing settings but override availability if booked
          calendarDates.push({
            ...existingAvailability,
            is_available: existingAvailability.is_available && !isBooked
          });
        } else {
          // Generate default availability for this date
          const property = properties.find(p => p.id === selectedProperty);
          calendarDates.push({
            property_id: selectedProperty,
            date: dateStr,
            is_available: !isBooked,
            price: property?.base_price || 100,
            minimum_stay: property?.minimum_stay || 1,
            is_instant_book: true,
            notes: isBooked ? 'Booked' : undefined
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setAvailabilityData(calendarDates);
    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast({
        title: "Error",
        description: "Failed to load availability data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const updateAvailability = async (date: string, updates: Partial<AvailabilitySettings>) => {
    try {
      const existing = availabilityData.find(item => item.date === date);
      const updateData = {
        property_id: selectedProperty,
        date,
        ...updates
      };

      if (existing?.id) {
        // Update existing
        const { error } = await supabase
          .from('availability_settings')
          .update(updateData)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('availability_settings')
          .insert([updateData]);
        
        if (error) throw error;
      }

      // Update local state
      setAvailabilityData(prev => 
        prev.map(item => 
          item.date === date 
            ? { ...item, ...updates }
            : item
        )
      );

      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
    }
  };

  const applyBulkSettings = async () => {
    if (!selectedProperty) return;
    
    try {
      const updates = availabilityData.map(item => ({
        property_id: selectedProperty,
        date: item.date,
        is_available: bulkSettings.isAvailable,
        price: bulkSettings.price ? parseFloat(bulkSettings.price) : item.price,
        minimum_stay: bulkSettings.minimumStay ? parseInt(bulkSettings.minimumStay) : item.minimum_stay,
        is_instant_book: bulkSettings.instantBook
      }));

      // Batch update/insert
      const { error } = await supabase
        .from('availability_settings')
        .upsert(updates, { onConflict: 'property_id,date' });

      if (error) throw error;

      setAvailabilityData(updates);
      toast({
        title: "Success",
        description: "Bulk settings applied successfully",
      });
    } catch (error) {
      console.error('Error applying bulk settings:', error);
      toast({
        title: "Error",
        description: "Failed to apply bulk settings",
        variant: "destructive"
      });
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay();
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

  const handleDateClick = (date: string) => {
    if (isPast(date)) return;
    setSelectedDate(date);
    setShowDetailedEditor(true);
  };

  const handleCloseDetailedEditor = () => {
    setShowDetailedEditor(false);
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Availability Management</h1>
            <p className="text-muted-foreground">
              Manage your property's availability, pricing, and booking settings
            </p>
          </div>
        </div>

        {/* Property Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Property Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Bulk Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Bulk Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Availability</Label>
                <Select 
                  value={bulkSettings.isAvailable ? "available" : "unavailable"} 
                  onValueChange={(value) => setBulkSettings(prev => ({ ...prev, isAvailable: value === "available" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Price per Night</Label>
                <Input
                  type="number"
                  placeholder="Leave empty to keep current"
                  value={bulkSettings.price}
                  onChange={(e) => setBulkSettings(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Minimum Stay (nights)</Label>
                <Input
                  type="number"
                  placeholder="Leave empty to keep current"
                  value={bulkSettings.minimumStay}
                  onChange={(e) => setBulkSettings(prev => ({ ...prev, minimumStay: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Instant Book</Label>
                <Select 
                  value={bulkSettings.instantBook ? "yes" : "no"} 
                  onValueChange={(value) => setBulkSettings(prev => ({ ...prev, instantBook: value === "yes" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={applyBulkSettings} 
              className="mt-4"
              disabled={!selectedProperty}
            >
              Apply to All Dates
            </Button>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigateMonth('prev')}>
                      Previous Month
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" onClick={() => navigateMonth('next')}>
                      Next Month
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading availability data...</div>
                ) : (
                  <div className="space-y-4">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2">{day}</div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: getDayOfWeek(availabilityData[0]?.date || '') }, (_, i) => (
                        <div key={`empty-${i}`} className="h-24 border border-muted rounded-lg" />
                      ))}
                      
                      {/* Month dates */}
                      {availabilityData.map((item) => (
                        <div
                          key={item.date}
                          className={`h-24 border border-muted rounded-lg p-2 relative cursor-pointer transition-all hover:shadow-md ${
                            isToday(item.date) ? 'ring-2 ring-primary' : ''
                          } ${isPast(item.date) ? 'opacity-50' : 'hover:bg-muted/50'}`}
                          onClick={() => handleDateClick(item.date)}
                        >
                          {/* Date number */}
                          <div className="text-sm font-medium mb-1">
                            {new Date(item.date).getDate()}
                          </div>
                          
                          {/* Availability status */}
                          <div className="flex items-center gap-1 mb-1">
                            {item.is_available ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Open
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                                <X className="h-3 w-3 mr-1" />
                                {item.notes === 'Booked' ? 'Booked' : 'Closed'}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Price */}
                          <div className="text-xs font-medium text-green-600">
                            ${item.price}
                          </div>
                          
                          {/* Minimum stay */}
                          <div className="text-xs text-muted-foreground">
                            Min: {item.minimum_stay} night{item.minimum_stay !== 1 ? 's' : ''}
                          </div>
                          
                          {/* Edit indicator */}
                          {!isPast(item.date) && (
                            <div className="absolute top-1 right-1">
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Editor Sidebar */}
          <div className="lg:col-span-1">
            {showDetailedEditor && selectedDate && (
              <DetailedAvailabilityEditor
                date={selectedDate}
                availability={availabilityData.find(item => item.date === selectedDate)!}
                onUpdate={updateAvailability}
                onClose={handleCloseDetailedEditor}
              />
            )}
            
            {!showDetailedEditor && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click on any date in the calendar to edit its availability settings.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                      <span>Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                      <span>Today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
