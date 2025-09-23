// iCal synchronization utilities
import { supabase } from "@/lib/supabaseClient";
import ICAL from 'ical.js';

interface ExternalBooking {
  property_id: string;
  start_date: string;
  end_date: string;
  source: string;
  status: string;
  external_id: string;
  summary: string;
}

export class ICalSyncManager {
  private propertyId: string;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(propertyId: string) {
    this.propertyId = propertyId;
  }

  // Parse iCal content using ical.js library
  private parseICalContent(icalContent: string): ExternalBooking[] {
    const bookings: ExternalBooking[] = [];
    
    try {
      console.log('iCal content preview:', icalContent.substring(0, 500));
      console.log('Total content length:', icalContent.length);
      
      // Parse using ical.js
      const jcalData = ICAL.parse(icalContent);
      const comp = new ICAL.Component(jcalData);
      
      console.log('ICAL.js parsed successfully');
      console.log('Component name:', comp.name);
      
      // Get all VEVENT components
      const vevents = comp.getAllSubcomponents('vevent');
      console.log('Found VEVENTs:', vevents.length);
      
      for (let i = 0; i < vevents.length; i++) {
        const vevent = vevents[i];
        console.log(`Processing event ${i + 1}:`, vevent.toString().substring(0, 200));
        
        try {
          const event = new ICAL.Event(vevent);
          
          const startDate = event.startDate;
          const endDate = event.endDate;
          const summary = event.summary || 'Blocked';
          const uid = event.uid || `event-${i}`;
          
          console.log('Event details:', {
            uid,
            summary,
            startDate: startDate?.toJSDate(),
            endDate: endDate?.toJSDate(),
            isDate: startDate?.isDate,
            duration: event.duration
          });
          
          if (startDate && endDate) {
            const start = startDate.toJSDate();
            const end = endDate.toJSDate();
            
            // Convert to YYYY-MM-DD format
            const startDateStr = start.toISOString().split('T')[0];
            const endDateStr = end.toISOString().split('T')[0];
            
            console.log('Converted dates:', { startDateStr, endDateStr });
            
            bookings.push({
              property_id: this.propertyId,
              start_date: startDateStr,
              end_date: endDateStr,
              source: 'airbnb', // Will be dynamic based on calendar name
              status: 'booked',
              external_id: uid,
              summary: summary
            });
          }
        } catch (eventError) {
          console.error('Error processing individual event:', eventError);
        }
      }
      
    } catch (parseError) {
      console.error('Error parsing iCal with ical.js:', parseError);
      
      // Fallback: try to extract any blocked dates manually
      console.log('Attempting manual fallback parsing...');
      const lines = icalContent.split(/\r?\n/);
      
      for (const line of lines) {
        if (line.includes('DTSTART') || line.includes('DTEND') || line.includes('SUMMARY')) {
          console.log('Found relevant line:', line);
        }
      }
    }
    
    console.log(`Successfully parsed ${bookings.length} bookings`);
    return bookings;
  }

  // Fetch and parse iCal from URL
  private async fetchICalData(url: string, source: string): Promise<ExternalBooking[]> {
    try {
      console.log('Fetching iCal from URL:', url);
      
      // Use a CORS proxy for development
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const icalContent = data.contents;
      
      console.log('iCal fetch successful, content length:', icalContent?.length);
      console.log('iCal content type check:', {
        hasVCALENDAR: icalContent.includes('BEGIN:VCALENDAR'),
        hasVEVENT: icalContent.includes('BEGIN:VEVENT'),
        lineCount: icalContent.split('\n').length
      });
      
      // Log the full iCal content for debugging
      console.log('=== FULL iCal CONTENT START ===');
      console.log(icalContent);
      console.log('=== FULL iCal CONTENT END ===');
      
      if (!icalContent || !icalContent.includes('BEGIN:VCALENDAR')) {
        throw new Error('Invalid iCal content received');
      }
      
      const bookings = this.parseICalContent(icalContent);
      
      // Update source for all bookings
      return bookings.map(booking => ({
        ...booking,
        source: source.toLowerCase()
      }));
      
    } catch (error) {
      console.error('Error fetching iCal data:', error);
      throw error;
    }
  }

  // Sync a single iCal calendar
  async syncCalendar(calendarId: string, icalUrl: string, calendarName: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Syncing iCal calendar: ${calendarName} (${icalUrl})`);
      
      // Update sync status to 'syncing'
      await supabase
        .from('property_ical_calendars')
        .update({ 
          sync_status: 'syncing',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', calendarId);

      // Fetch and parse iCal data using proper library
      const bookings = await this.fetchICalData(icalUrl, calendarName);
      console.log(`Found ${bookings.length} bookings in iCal`);

      // Step 1: Clear existing bookings from this source
      await supabase
        .from('external_bookings')
        .delete()
        .eq('property_id', this.propertyId)
        .eq('source', calendarName.toLowerCase());

      // Step 2: Insert new bookings into external_bookings table
      if (bookings.length > 0) {
        const { error: bookingsError } = await supabase
          .from('external_bookings')
          .insert(bookings);

        if (bookingsError) {
          throw bookingsError;
        }
      }

      // Step 3: Update property_calendar with blocked dates
      const blockedDates = new Set<string>();
      
      for (const booking of bookings) {
        // Add all dates from start to end as blocked
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        
        // Include all nights of the booking
        for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
          blockedDates.add(d.toISOString().split('T')[0]);
        }
      }

      // Clear existing external blocks for this property from this source
      await supabase
        .from('property_calendar')
        .delete()
        .eq('property_id', this.propertyId)
        .like('notes', `%${calendarName.toLowerCase()}%`);

      // Insert new blocked dates
      if (blockedDates.size > 0) {
        const calendarEntries = Array.from(blockedDates).map(date => ({
          property_id: this.propertyId,
          date,
          is_available: false,
          notes: `Blocked by ${calendarName} sync`
        }));

        const { error: calendarError } = await supabase
          .from('property_calendar')
          .upsert(calendarEntries, {
            onConflict: 'property_id,date',
            ignoreDuplicates: false
          });

        if (calendarError) {
          throw calendarError;
        }
      }

      // Update sync status to 'success'
      await supabase
        .from('property_ical_calendars')
        .update({ 
          sync_status: 'success',
          sync_error: null,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', calendarId);

      console.log(`Successfully synced ${bookings.length} bookings, blocking ${blockedDates.size} dates`);
      return { success: true };

    } catch (error) {
      console.error('iCal sync error:', error);
      
      // Update sync status to 'error'
      await supabase
        .from('property_ical_calendars')
        .update({ 
          sync_status: 'error',
          sync_error: error instanceof Error ? error.message : 'Unknown error',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', calendarId);

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Sync all active iCal calendars for this property
  async syncAllCalendars(): Promise<void> {
    const { data: calendars } = await supabase
      .from('property_ical_calendars')
      .select('*')
      .eq('property_id', this.propertyId)
      .eq('is_active', true);

    if (!calendars || calendars.length === 0) {
      console.log('No active iCal calendars to sync');
      return;
    }

    console.log(`Syncing ${calendars.length} iCal calendars for property ${this.propertyId}`);

    for (const calendar of calendars) {
      await this.syncCalendar(calendar.id, calendar.ical_url, calendar.name);
      // Small delay between syncs to avoid overwhelming external servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Start automatic sync every minute
  startAutoSync(): void {
    console.log(`Starting auto-sync for property ${this.propertyId} (every 60 seconds)`);
    
    // Initial sync
    this.syncAllCalendars();
    
    // Set up interval for every minute
    this.syncInterval = setInterval(() => {
      this.syncAllCalendars();
    }, 60 * 1000); // 60 seconds
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log(`Stopped auto-sync for property ${this.propertyId}`);
    }
  }

  // Test connectivity to an iCal URL
  static async testICalConnectivity(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const icalContent = data.contents;
      
      // Basic validation - check if it's actually iCal content
      if (!icalContent.includes('BEGIN:VCALENDAR')) {
        throw new Error('Invalid iCal format - missing VCALENDAR');
      }
      
      console.log('iCal connectivity test successful');
      return { success: true };
      
    } catch (error) {
      console.error('iCal connectivity test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
