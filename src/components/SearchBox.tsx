import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { popularDestinations } from "@/data/jordanProperties";

interface SearchBoxProps {
  onSearch?: (searchParams: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: string;
  }) => void;
  initialLocation?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string;
  showPopularDestinations?: boolean;
}

export const SearchBox = ({ 
  onSearch, 
  initialLocation = '', 
  initialCheckIn = '', 
  initialCheckOut = '', 
  initialGuests = '1',
  showPopularDestinations = true
}: SearchBoxProps) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const handleSearch = () => {
    const searchParams = {
      location,
      checkIn,
      checkOut,
      guests
    };
    
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Default behavior - show alert
      if (!location && !checkIn && !checkOut) {
        alert("Please enter at least a location or dates to search");
        return;
      }
      
      alert(`Searching for: ${location || 'Any location'} from ${checkIn || 'any date'} to ${checkOut || 'any date'} for ${guests} guest${guests !== '1' ? 's' : ''}`);
    }
  };

  const handleDestinationClick = (destination: string) => {
    setLocation(destination);
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Main Search Box */}
      <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Where</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Amman, Petra, Wadi Rum..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Check-in */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Check-in</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Check-out</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || tomorrow}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="pl-10 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleSearch}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 h-12 text-lg font-semibold"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Popular Destinations */}
      {showPopularDestinations && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Popular destinations:</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {popularDestinations.map((destination) => (
              <button
                key={destination.name}
                onClick={() => handleDestinationClick(destination.name)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {destination.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
