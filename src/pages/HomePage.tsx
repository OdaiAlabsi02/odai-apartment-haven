import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "@/components/SearchBox";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";
import { jordanProperties, JordanProperty } from "@/data/jordanProperties";
import heroImage from "@/assets/hero-apartment.jpg";

interface FilterState {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  priceRange: [number, number];
  propertyType: string;
  amenities: string[];
  minRating: number;
}

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '1'
  });
  
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '1',
    priceRange: [0, 500],
    propertyType: 'any',
    amenities: [],
    minRating: 0
  });

  // Filter properties based on search and filter criteria
  const filteredProperties = useMemo(() => {
    return jordanProperties.filter(property => {
      // Location filter
      if (filters.location && !property.city.toLowerCase().includes(filters.location.toLowerCase()) && 
          !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Price range filter
      if (property.base_price < filters.priceRange[0] || property.base_price > filters.priceRange[1]) {
        return false;
      }

      // Property type filter
      if (filters.propertyType && filters.propertyType !== 'any' && property.property_type !== filters.propertyType) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Rating filter
      if (filters.minRating > 0 && property.rating < filters.minRating) {
        return false;
      }

      // Guests filter
      if (parseInt(filters.guests) > property.guests) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleSearch = (searchData: typeof searchParams) => {
    setSearchParams(searchData);
    setFilters(prev => ({
      ...prev,
      location: searchData.location,
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests: searchData.guests
    }));
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are already applied in the useMemo
  };

  const handleClearFilters = () => {
    setFilters({
      location: '',
      checkIn: '',
      checkOut: '',
      guests: '1',
      priceRange: [0, 500],
      propertyType: 'any',
      amenities: [],
      minRating: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search Box */}
      <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Discover Jordan's
            <span className="block text-yellow-400 drop-shadow-sm">
              Hidden Gems
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 animate-slide-up mb-12 max-w-3xl mx-auto">
            From ancient Petra to pristine Red Sea shores, find unique stays that capture the soul of Jordan
          </p>
          
          {/* Search Box */}
          <div className="animate-slide-up">
            <SearchBox 
              onSearch={handleSearch}
              initialLocation={searchParams.location}
              initialCheckIn={searchParams.checkIn}
              initialCheckOut={searchParams.checkOut}
              initialGuests={searchParams.guests}
              showPopularDestinations={false}
            />
          </div>
        </div>
      </section>


      {/* Main Content with Built-in Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProperties.length} properties found
          </h2>
          <p className="text-gray-600 mt-1">
            {filters.location ? `in ${filters.location}` : 'in Jordan'}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Built-in Filters Sidebar - Always visible on desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <PropertyFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Properties Grid */}
          <div className="flex-1">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => {
                      navigate(`/apartment/${property.id}`);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};