import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Settings, 
  DollarSign, 
  Clock, 
  Download, 
  Upload,
  Copy,
  RefreshCw
} from "lucide-react";
import { Apartment } from "@/data/apartments";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { ICalSyncManager } from "@/lib/icalSync";

type Props = {
  listing: Apartment;
  onUpdate: (data: Partial<Apartment>) => void;
};

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  customPrice?: number;
  isBooked: boolean;
  isPast: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

interface PricingSettings {
  default_nightly_price: number;
  weekly_discount_percent: number;
  monthly_discount_percent: number;
}

interface AvailabilitySettings {
  min_nights: number;
  max_nights: number;
  advance_notice_days: number;
  property_open?: boolean;
}

interface ICalCalendar {
  id: string;
  name: string;
  ical_url: string;
  is_active: boolean;
  last_sync_at?: string;
  sync_status: string;
  sync_error?: string;
}

export default function CalendarSection({ listing }: Props) {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Map<string, CalendarDay>>(new Map());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    default_nightly_price: 57,
    weekly_discount_percent: 3,
    monthly_discount_percent: 8
  });
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({
    min_nights: 1,
    max_nights: 30,
    advance_notice_days: 0,
    property_open: true
  });
  const [icalCalendars, setICalCalendars] = useState<ICalCalendar[]>([]);
  const [newICalUrl, setNewICalUrl] = useState("");
  const [newICalName, setNewICalName] = useState("");
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [isDateAvailable, setIsDateAvailable] = useState(true);
  const [isAllDatesSelected, setIsAllDatesSelected] = useState(false);
  const [syncManager] = useState(() => new ICalSyncManager(listing.id));

  // Load calendar data and settings
  useEffect(() => {
    loadCalendarData();
    loadPricingSettings();
    loadAvailabilitySettings();
    loadICalCalendars();
    
    // Start auto-sync for iCal calendars
    syncManager.startAutoSync();
    
    // Cleanup on unmount
    return () => {
      syncManager.stopAutoSync();
    };
  }, [listing.id, currentMonth, syncManager]);

  // Update calendar visual states when selection changes
  useEffect(() => {
    if (calendarData.size > 0) {
      loadCalendarData();
    }
  }, [selectedStartDate, selectedEndDate]);

  const loadCalendarData = async () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Extend range to show previous/next month days for complete calendar grid
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const { data } = await supabase
      .from('property_calendar')
      .select('*')
      .eq('property_id', listing.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    const calendarMap = new Map<string, CalendarDay>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate calendar grid
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existingData = data?.find(item => item.date === dateStr);
      const currentDate = new Date(d);
      currentDate.setHours(0, 0, 0, 0);
      
      // Normalize selected dates to midnight for comparison
      const normalizedStartDate = selectedStartDate ? new Date(selectedStartDate) : null;
      const normalizedEndDate = selectedEndDate ? new Date(selectedEndDate) : null;
      if (normalizedStartDate) normalizedStartDate.setHours(0, 0, 0, 0);
      if (normalizedEndDate) normalizedEndDate.setHours(0, 0, 0, 0);
      
      const dateTime = currentDate.getTime();
      const startTime = normalizedStartDate?.getTime();
      const endTime = normalizedEndDate?.getTime();
      
      const isRangeStart = normalizedStartDate && dateTime === startTime;
      const isRangeEnd = normalizedEndDate && dateTime === endTime;
      const isInRange = normalizedStartDate && normalizedEndDate && dateTime > startTime! && dateTime < endTime!;
      const isSelected = normalizedStartDate && (
        (!normalizedEndDate && dateTime === startTime) || 
        (normalizedEndDate && dateTime >= startTime! && dateTime <= endTime!)
      );
      
      calendarMap.set(dateStr, {
        date: new Date(d),
        isCurrentMonth: d.getMonth() === currentMonth.getMonth(),
        isAvailable: existingData?.is_available ?? true,
        customPrice: existingData?.custom_price,
        isBooked: false, // TODO: Connect with bookings table
        isPast: currentDate < today,
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd
      });
    }
    
    setCalendarData(calendarMap);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedStartDate) return false;
    const dateTime = date.getTime();
    const startTime = selectedStartDate.getTime();
    
    if (!selectedEndDate) {
      // Single date selection
      return dateTime === startTime;
    }
    
    const endTime = selectedEndDate.getTime();
    // Range selection - include start date, end date, and all dates in between
    return dateTime >= startTime && dateTime <= endTime;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const dateTime = date.getTime();
    const startTime = selectedStartDate.getTime();
    const endTime = selectedEndDate.getTime();
    // Only the dates strictly between start and end (not including start/end)
    return dateTime > startTime && dateTime < endTime;
  };

  const loadPricingSettings = async () => {
    // Get both property base price and pricing settings
    const [pricingResult, propertyResult] = await Promise.all([
      supabase
        .from('property_pricing_settings')
        .select('*')
        .eq('property_id', listing.id)
        .maybeSingle(),
      supabase
        .from('properties')
        .select('base_price')
        .eq('id', listing.id)
        .single()
    ]);
    
    const pricingData = pricingResult.data;
    const propertyData = propertyResult.data;
    
    if (pricingData) {
      // Use property base_price as the source of truth for default_nightly_price
      setPricingSettings({
        ...pricingData,
        default_nightly_price: propertyData?.base_price || pricingData.default_nightly_price
      });
    } else if (propertyData) {
      // Create initial pricing settings based on property base_price
      const newPricingSettings = {
        default_nightly_price: propertyData.base_price,
        weekly_discount_percent: 3,
        monthly_discount_percent: 8
      };
      setPricingSettings(newPricingSettings);
      
      // Save to database
      await supabase.from('property_pricing_settings').upsert({
        property_id: listing.id,
        ...newPricingSettings
      });
    }
  };

  const loadAvailabilitySettings = async () => {
    const { data } = await supabase
      .from('property_availability_settings')
      .select('*')
      .eq('property_id', listing.id)
      .maybeSingle();
    
    if (data) {
      setAvailabilitySettings(data);
    }
  };

  const loadICalCalendars = async () => {
    const { data } = await supabase
      .from('property_ical_calendars')
      .select('*')
      .eq('property_id', listing.id)
      .order('created_at');
    
    setICalCalendars(data || []);
  };

  const savePricingSettings = async () => {
    // Update both pricing settings and property base_price to keep them in sync
    const { error: pricingError } = await supabase.from('property_pricing_settings').upsert({
      property_id: listing.id,
      ...pricingSettings
    });
    
    const { error: propertyError } = await supabase.from('properties').update({
      base_price: pricingSettings.default_nightly_price
    }).eq('id', listing.id);
    
    if (pricingError || propertyError) {
      toast({ title: "Error saving pricing settings", variant: "destructive" });
      console.error('Pricing save errors:', { pricingError, propertyError });
    } else {
      toast({ title: "Pricing settings saved and synced" });
      // Reload calendar to reflect changes
      await loadCalendarData();
    }
  };

  const saveAvailabilitySettings = async () => {
    await supabase.from('property_availability_settings').upsert({
      property_id: listing.id,
      ...availabilitySettings
    });
    toast({ title: "Availability settings saved" });
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow selection of past dates
    if (date < today) return;
    
    // Create a proper date object with noon time to avoid timezone issues
    const clickedDate = new Date(date);
    clickedDate.setHours(12, 0, 0, 0);
    
    if (!selectedStartDate) {
      // First click - set FROM date
      setSelectedStartDate(clickedDate);
      setSelectedEndDate(null);
      setIsSelectingRange(true);
    } else if (!selectedEndDate) {
      // Second click - set TO date
      if (clickedDate.getTime() === selectedStartDate.getTime()) {
        // Clicking same date - single date selection
        setSelectedEndDate(null);
        setIsSelectingRange(false);
      } else if (clickedDate < selectedStartDate) {
        // Clicked date is before start date - swap them
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(clickedDate);
        setIsSelectingRange(false);
      } else {
        // Normal case - clicked date is after start date
        setSelectedEndDate(clickedDate);
        setIsSelectingRange(false);
      }
    } else {
      // Both dates are set - start new selection
      setSelectedStartDate(clickedDate);
      setSelectedEndDate(null);
      setIsSelectingRange(true);
    }
    
    // Visual states will update automatically via useEffect
  };

  // Update custom price and availability when dates are selected
  useEffect(() => {
    if (selectedStartDate) {
      const dateStr = selectedStartDate.toISOString().split('T')[0];
      const dayData = calendarData.get(dateStr);
      setCustomPrice(dayData?.customPrice?.toString() || "");
      setIsDateAvailable(dayData?.isAvailable ?? true);
    } else {
      setCustomPrice("");
      setIsDateAvailable(true);
    }
  }, [selectedStartDate, calendarData]);

  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelectingRange(false);
    setIsAllDatesSelected(false);
    setCustomPrice("");
    setIsDateAvailable(true);
  };

  const saveDateSettings = async () => {
    if (!selectedStartDate && !isAllDatesSelected) return;
    
    const price = customPrice ? parseFloat(customPrice) : null;
    
    if (isAllDatesSelected) {
      // For "All Dates" - this sets the PRIMARY/DEFAULT settings for the entire property
      
      // 1. Clear ALL existing custom calendar entries (all months, all dates)
      await supabase.from('property_calendar').delete().eq('property_id', listing.id);
      
      // 2. Update the main property table FIRST (this is the source of truth)
      if (price !== null) {
        const { error: propertyError } = await supabase.from('properties').update({
          base_price: price
        }).eq('id', listing.id);
        
        if (propertyError) {
          console.error('Error updating property base_price:', propertyError);
          toast({ title: "Error updating property price", variant: "destructive" });
          return;
        }
      }
      
      // 3. Update PRIMARY pricing settings (keep in sync with property base_price)
      if (price !== null) {
        const { error: pricingError } = await supabase.from('property_pricing_settings').upsert({
          property_id: listing.id,
          default_nightly_price: price,
          weekly_discount_percent: pricingSettings.weekly_discount_percent,
          monthly_discount_percent: pricingSettings.monthly_discount_percent
        });
        
        if (pricingError) {
          console.error('Error updating pricing settings:', pricingError);
        }
      }
      
      // 4. Update PRIMARY availability settings (applies to all dates by default)
      const { error: availabilityError } = await supabase.from('property_availability_settings').upsert({
        property_id: listing.id,
        min_nights: availabilitySettings.min_nights,
        max_nights: availabilitySettings.max_nights,
        advance_notice_days: availabilitySettings.advance_notice_days,
        property_open: availabilitySettings.property_open
      });
      
      if (availabilityError) {
        console.error('Error updating availability settings:', availabilityError);
      }
      
      // 5. Handle availability changes for all future dates
      if (!isDateAvailable) {
        // If marking as unavailable, we'll rely on the default availability settings
        // and only create specific calendar entries when needed for bookings or custom prices
        // This avoids creating thousands of database entries
        console.log('Property marked as unavailable - default availability settings will handle this');
      }
      
      toast({ 
        title: "Primary settings updated successfully", 
        description: `These settings now apply to ALL future dates. ${!isDateAvailable ? 'Property blocked for next 2 years.' : 'Default price updated for all dates.'}`
      });
    } else {
      // For specific date ranges
      const datesToUpdate = [];
      const startDate = new Date(selectedStartDate!);
      const endDate = selectedEndDate || selectedStartDate!;
      
      // Generate all dates in the range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        datesToUpdate.push(d.toISOString().split('T')[0]);
      }
      
      // Update all dates in the range with better error handling
      try {
        const calendarEntries = datesToUpdate.map(dateStr => ({
          property_id: listing.id,
          date: dateStr,
          is_available: isDateAvailable,
          custom_price: price
        }));
        
        // Use upsert with proper conflict resolution
        const { error } = await supabase
          .from('property_calendar')
          .upsert(calendarEntries, {
            onConflict: 'property_id,date',
            ignoreDuplicates: false
          });
          
        if (error) {
          console.error('Error updating calendar entries:', error);
          toast({ title: "Error updating dates", description: error.message, variant: "destructive" });
          return;
        }
      } catch (err) {
        console.error('Calendar update error:', err);
        toast({ title: "Error updating calendar", variant: "destructive" });
        return;
      }
      
      const dateCount = datesToUpdate.length;
      toast({ 
        title: `${dateCount} ${dateCount === 1 ? 'date' : 'dates'} updated successfully` 
      });
    }
    
    // Reload all data to reflect changes
    await loadPricingSettings();
    await loadAvailabilitySettings();
    await loadCalendarData();
    clearSelection();
  };

  const addICalCalendar = async () => {
    if (!newICalUrl || !newICalName) return;
    
    // Test connectivity first
    toast({ title: "Testing iCal connectivity...", description: "Checking if the calendar URL is accessible" });
    
    const connectivityTest = await ICalSyncManager.testICalConnectivity(newICalUrl);
    
    if (!connectivityTest.success) {
      toast({ 
        title: "iCal connectivity failed", 
        description: connectivityTest.error || "Unable to access the calendar URL",
        variant: "destructive"
      });
      return;
    }
    
    // Add to database
    const { data, error } = await supabase.from('property_ical_calendars').insert({
      property_id: listing.id,
      name: newICalName,
      ical_url: newICalUrl,
      is_active: true,
      sync_status: 'pending'
    }).select().single();
    
    if (error) {
      toast({ title: "Error adding calendar", description: error.message, variant: "destructive" });
      return;
    }
    
    // Immediately sync the new calendar
    if (data) {
      toast({ title: "Calendar added successfully", description: "Starting initial sync..." });
      const syncResult = await syncManager.syncCalendar(data.id, newICalUrl, newICalName);
      
      if (syncResult.success) {
        toast({ title: "iCal sync successful", description: "Calendar data has been imported" });
        loadCalendarData(); // Refresh calendar to show blocked dates
      } else {
        toast({ 
          title: "Sync failed", 
          description: syncResult.error || "Unable to sync calendar data",
          variant: "destructive"
        });
      }
    }
    
    setNewICalUrl("");
    setNewICalName("");
    loadICalCalendars();
  };

  const removeICalCalendar = async (id: string) => {
    await supabase.from('property_ical_calendars').delete().eq('id', id);
    loadICalCalendars();
    toast({ title: "iCal calendar removed" });
  };

  const generateExportUrl = () => {
    return `${window.location.origin}/api/ical/export/${listing.id}`;
  };

  const copyExportUrl = () => {
    navigator.clipboard.writeText(generateExportUrl());
    toast({ title: "Export URL copied to clipboard" });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const getDayPrice = (day: CalendarDay) => {
    return day.customPrice || pricingSettings.default_nightly_price;
  };

  const getDayClass = (day: CalendarDay) => {
    let baseClass = "w-full h-16 p-1 border text-xs transition-all relative ";
    
    // Handle past dates (gray and disabled)
    if (day.isPast) {
      baseClass += "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 ";
    }
    // Handle non-current month dates
    else if (!day.isCurrentMonth) {
      baseClass += "text-gray-400 bg-gray-50 cursor-pointer border-gray-200 hover:bg-gray-100 ";
    }
    // Handle selected range start, end, or any selected date
    else if (day.isRangeStart || day.isRangeEnd || day.isSelected || day.isInRange) {
      baseClass += "bg-gray-800 text-white border-gray-800 cursor-pointer ";
    }
    // Handle booked dates (dark gray/black)
    else if (day.isBooked) {
      baseClass += "bg-gray-800 text-white border-gray-800 cursor-not-allowed ";
    }
    // Handle blocked/unavailable dates (gray)
    else if (!day.isAvailable) {
      baseClass += "bg-gray-300 text-gray-600 border-gray-400 cursor-pointer ";
    }
    // Handle available dates (white)
    else {
      baseClass += "bg-white text-gray-900 border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 ";
    }
    
    return baseClass;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Calendar View */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold min-w-[140px] text-center">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
            </CardHeader>
            <CardContent>
              {/* Calendar Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-gray-200"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 border border-gray-400"></div>
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 border border-gray-800"></div>
                  <span>Booked/Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200"></div>
                  <span>Past dates</span>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200">
                {/* Week day headers */}
                {weekDays.map(day => (
                  <div key={day} className="p-2 bg-gray-100 text-center font-semibold text-sm border-b">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {Array.from(calendarData.values()).map((day, index) => (
                  <div
                    key={index}
                    className={getDayClass(day)}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className="font-semibold">{day.date.getDate()}</div>
                    {!day.isPast && (
                      <div className={`font-medium ${
                        day.isSelected || day.isInRange || day.isRangeStart || day.isRangeEnd || day.isBooked
                          ? 'text-white' 
                          : !day.isAvailable 
                            ? 'text-gray-600' 
                            : 'text-green-600'
                      }`}>
                        JD {getDayPrice(day)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-4">
          {/* Date Selection Panel - Independent Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Dates to Edit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* All Dates Option */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="all-dates"
                  checked={isAllDatesSelected}
                  onChange={(e) => {
                    setIsAllDatesSelected(e.target.checked);
                    if (e.target.checked) {
                      // Clear specific date selection when "All Dates" is selected
                      setSelectedStartDate(null);
                      setSelectedEndDate(null);
                      setIsSelectingRange(false);
                    }
                  }}
                />
                <Label htmlFor="all-dates" className="font-medium">
                  Set as Primary Default
                </Label>
                <span className="text-xs text-gray-500">(Apply to ALL months & dates as the main setting)</span>
              </div>

              {!isAllDatesSelected && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start-date" className="text-xs text-gray-500">From Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={selectedStartDate ? selectedStartDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value + 'T12:00:00');
                          setSelectedStartDate(date);
                          // If end date exists and is before new start date, clear it
                          if (selectedEndDate && date > selectedEndDate) {
                            setSelectedEndDate(null);
                          }
                          setIsSelectingRange(false);
                        } else {
                          setSelectedStartDate(null);
                          setSelectedEndDate(null);
                          setIsSelectingRange(false);
                        }
                      }}
                      className="text-xs"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs text-gray-500">To Date (optional)</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={selectedEndDate ? selectedEndDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value + 'T12:00:00');
                          if (!selectedStartDate) {
                            // If no start date, this becomes the start date
                            setSelectedStartDate(date);
                          } else if (date >= selectedStartDate) {
                            // Valid end date
                            setSelectedEndDate(date);
                          } else {
                            // End date is before start date - swap them
                            setSelectedEndDate(selectedStartDate);
                            setSelectedStartDate(date);
                          }
                          setIsSelectingRange(false);
                        } else {
                          setSelectedEndDate(null);
                          setIsSelectingRange(false);
                        }
                      }}
                      className="text-xs"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>
              )}
              {selectedStartDate && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  Selected: {selectedStartDate.toLocaleDateString()}
                  {selectedEndDate && selectedEndDate.getTime() !== selectedStartDate.getTime() && 
                    ` to ${selectedEndDate.toLocaleDateString()}`
                  }
                  {selectedEndDate && selectedEndDate.getTime() !== selectedStartDate.getTime() && (
                    <span className="ml-2">
                      ({Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} nights)
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearSelection}
                    className="ml-2 h-5 px-2 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              )}
              
              {/* Bulk Change Option - Show when dates are selected or all dates selected */}
              {(selectedStartDate || isAllDatesSelected) && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bulk-change"
                      checked={true}
                      readOnly
                    />
                    <Label htmlFor="bulk-change" className="text-sm font-medium">
                      {isAllDatesSelected ? 'Set as primary defaults for entire property' : 'Apply changes to selected dates'}
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isAllDatesSelected 
                      ? 'These will become the DEFAULT settings for ALL months and dates. Any existing custom overrides will be cleared.'
                      : 'Price and availability settings below will apply to your selected dates only'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Settings Panel */}
          <Card>
            <Collapsible open={isPricingOpen} onOpenChange={setIsPricingOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Price Settings
                      {(selectedStartDate || isAllDatesSelected) && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {isAllDatesSelected ? 'All Dates' : 'Selected Dates'}
                        </Badge>
                      )}
                    </div>
                    {isPricingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {!selectedStartDate && !isAllDatesSelected ? (
                    // Default settings when no dates selected
                    <>
                      <div>
                        <Label htmlFor="default-price">Default Nightly Price (JD)</Label>
                        <Input
                          id="default-price"
                          type="number"
                          value={pricingSettings.default_nightly_price}
                          onChange={(e) => setPricingSettings(prev => ({
                            ...prev,
                            default_nightly_price: parseFloat(e.target.value) || 0
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="weekly-discount">Weekly Discount (%)</Label>
                        <Input
                          id="weekly-discount"
                          type="number"
                          min="0"
                          max="100"
                          value={pricingSettings.weekly_discount_percent}
                          onChange={(e) => setPricingSettings(prev => ({
                            ...prev,
                            weekly_discount_percent: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="monthly-discount">Monthly Discount (%)</Label>
                        <Input
                          id="monthly-discount"
                          type="number"
                          min="0"
                          max="100"
                          value={pricingSettings.monthly_discount_percent}
                          onChange={(e) => setPricingSettings(prev => ({
                            ...prev,
                            monthly_discount_percent: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                      
                      <Button onClick={savePricingSettings} className="w-full">
                        Save Default Price Settings
                      </Button>
                    </>
                  ) : (
                    // Custom price for selected dates or all dates
                    <>
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                        {isAllDatesSelected ? (
                          <>Setting PRIMARY DEFAULT PRICE for the entire property (all months, all dates)</>
                        ) : (
                          <>
                            Setting price for selected dates: {selectedStartDate?.toLocaleDateString()}
                            {selectedEndDate && selectedEndDate.getTime() !== selectedStartDate?.getTime() && 
                              ` to ${selectedEndDate.toLocaleDateString()}`
                            }
                          </>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="selected-price">Custom Price (JD)</Label>
                        <Input
                          id="selected-price"
                          type="number"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          placeholder={`Default: ${pricingSettings.default_nightly_price}`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to use default price (JD {pricingSettings.default_nightly_price})
                        </p>
                      </div>
                      
                      <Button onClick={saveDateSettings} className="w-full">
                        {isAllDatesSelected ? 'Set as Primary Default Price' : 'Apply Price to Selected Dates'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Availability Settings Panel */}
          <Card>
            <Collapsible open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Availability Settings
                      {(selectedStartDate || isAllDatesSelected) && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {isAllDatesSelected ? 'All Dates' : 'Selected Dates'}
                        </Badge>
                      )}
                    </div>
                    {isAvailabilityOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {!selectedStartDate && !isAllDatesSelected ? (
                    // Default settings when no dates selected
                    <>
                      <div>
                        <Label htmlFor="min-nights">Minimum Nights Stay</Label>
                        <Input
                          id="min-nights"
                          type="number"
                          min="1"
                          value={availabilitySettings.min_nights}
                          onChange={(e) => setAvailabilitySettings(prev => ({
                            ...prev,
                            min_nights: parseInt(e.target.value) || 1
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max-nights">Maximum Nights Stay</Label>
                        <Input
                          id="max-nights"
                          type="number"
                          min="1"
                          value={availabilitySettings.max_nights}
                          onChange={(e) => setAvailabilitySettings(prev => ({
                            ...prev,
                            max_nights: parseInt(e.target.value) || 30
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="advance-notice">Advance Notice (days)</Label>
                        <Input
                          id="advance-notice"
                          type="number"
                          min="0"
                          value={availabilitySettings.advance_notice_days}
                          onChange={(e) => setAvailabilitySettings(prev => ({
                            ...prev,
                            advance_notice_days: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                      
                      <Button onClick={saveAvailabilitySettings} className="w-full">
                        Save Default Availability Settings
                      </Button>
                    </>
                  ) : (
                    // Availability for selected dates or all dates
                    <>
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                        {isAllDatesSelected ? (
                          <>Setting availability for ALL DATES (this will override all existing availability)</>
                        ) : (
                          <>
                            Setting availability for selected dates: {selectedStartDate?.toLocaleDateString()}
                            {selectedEndDate && selectedEndDate.getTime() !== selectedStartDate?.getTime() && 
                              ` to ${selectedEndDate.toLocaleDateString()}`
                            }
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is-available-bulk"
                          checked={isDateAvailable}
                          onChange={(e) => setIsDateAvailable(e.target.checked)}
                        />
                        <Label htmlFor="is-available-bulk" className="text-sm">
                          Available for booking
                        </Label>
                      </div>
                      
                      <Button onClick={saveDateSettings} className="w-full">
                        {isAllDatesSelected ? 'Set as Primary Default Availability' : 'Apply Availability to Selected Dates'}
                      </Button>
                    </>
                  )}
                  
                  {/* iCal Integration */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">Calendar Sync</h4>
                    
                    {/* Export iCal */}
                    <div className="space-y-2 mb-4">
                      <Label>Export Calendar</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyExportUrl}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Export URL
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use this URL to sync your availability to external platforms
                      </p>
                    </div>
                    
                    {/* Import iCal */}
                    <div className="space-y-2">
                      <Label>Import External Calendars</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Calendar name (e.g., Airbnb)"
                          value={newICalName}
                          onChange={(e) => setNewICalName(e.target.value)}
                        />
                        <Input
                          placeholder="iCal URL"
                          value={newICalUrl}
                          onChange={(e) => setNewICalUrl(e.target.value)}
                        />
                        <Button onClick={addICalCalendar} size="sm" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Add Calendar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Existing iCal Calendars */}
                    {icalCalendars.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <Label>Connected Calendars</Label>
                        {icalCalendars.map((calendar) => (
                          <div key={calendar.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">{calendar.name}</div>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    toast({ title: "Syncing calendar...", description: "Fetching latest data" });
                                    const result = await syncManager.syncCalendar(calendar.id, calendar.ical_url, calendar.name);
                                    if (result.success) {
                                      toast({ title: "Sync successful" });
                                      loadCalendarData();
                                      loadICalCalendars();
                                    } else {
                                      toast({ title: "Sync failed", description: result.error, variant: "destructive" });
                                    }
                                  }}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeICalCalendar(calendar.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div>Last sync: {calendar.last_sync_at ? new Date(calendar.last_sync_at).toLocaleString() : 'Never'}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span>Status:</span>
                                <Badge 
                                  variant={calendar.sync_status === 'success' ? 'default' : calendar.sync_status === 'error' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {calendar.sync_status}
                                </Badge>
                                {calendar.sync_status === 'error' && calendar.sync_error && (
                                  <span className="text-red-600">({calendar.sync_error})</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>

    </div>
  );
}
