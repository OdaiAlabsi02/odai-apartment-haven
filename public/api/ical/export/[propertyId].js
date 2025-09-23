// Mock iCal export endpoint
// In a real implementation, this would be handled by a proper API endpoint

export default function handler(req, res) {
  const { propertyId } = req.query;
  
  // Generate a basic iCal format
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apartment Haven//Property Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Property ${propertyId} - Apartment Haven
X-WR-TIMEZONE:Asia/Amman
X-WR-CALDESC:Availability calendar for property ${propertyId}

BEGIN:VEVENT
DTSTART:20250101T000000Z
DTEND:20250102T000000Z
DTSTAMP:20250101T000000Z
UID:blocked-20250101-${propertyId}@apartment-haven.com
SUMMARY:Blocked
DESCRIPTION:This date is blocked for booking
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT

END:VCALENDAR`;

  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', `attachment; filename="property-${propertyId}.ics"`);
  res.status(200).send(icalContent);
}
