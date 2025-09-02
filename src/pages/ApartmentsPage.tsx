import { useState, useEffect } from "react";
import { useApartments } from "@/hooks/useApartments";
import { ApartmentCard } from "@/components/ApartmentCard";
import { Apartment } from "@/data/apartments";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const ApartmentsPage = () => {
  const { apartments, loading, error, usingDemoData } = useApartments();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const filterApartments = (apartment: Apartment) => {
    const price = apartment.base_price || 0;
    if (priceFilter === "budget") return price <= 100;
    if (priceFilter === "mid") return price > 100 && price <= 200;
    if (priceFilter === "luxury") return price > 200;
    return true;
  };

  const sortApartments = (a: Apartment, b: Apartment) => {
    const priceA = a.base_price || 0;
    const priceB = b.base_price || 0;

    if (sortBy === "price-low") return priceA - priceB;
    if (sortBy === "price-high") return priceB - priceA;
    return 0;
  };

  const filteredApartments = apartments
    .filter(apartment => {
      const title = apartment.title || '';
      const city = apartment.city || '';
      const searchLower = searchTerm.toLowerCase();

      return title.toLowerCase().includes(searchLower) ||
             city.toLowerCase().includes(searchLower);
    })
    .filter(apartment => filterApartments(apartment))
    .sort((a, b) => sortApartments(a, b));

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading apartments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Apartments</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Demo Data Warning */}
        {usingDemoData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Demo Mode Active</span>
            </div>
            <p className="text-yellow-700 mt-2 text-sm">
              We're experiencing temporary database connectivity issues. You're currently viewing demo apartment data. 
              Your actual listings will appear once the connection is restored.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing apartments in prime locations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by apartment name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Budget ($0-$100)</SelectItem>
                <SelectItem value="mid">Mid-Range ($101-$200)</SelectItem>
                <SelectItem value="luxury">Luxury ($200+)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredApartments.length} of {apartments.length} apartments
          </p>
        </div>

        {/* Apartments Grid */}
        {filteredApartments.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No apartments found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredApartments.map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};