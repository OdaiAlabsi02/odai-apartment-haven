import { useState } from "react";
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApartmentCard } from "@/components/ApartmentCard";
import { useApartments } from "@/hooks/useApartments";
import { Apartment } from "@/data/apartments";

export const ApartmentsPage = () => {
  const { apartments, loading, error } = useApartments();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [priceFilter, setPriceFilter] = useState("all");

  const filterApartments = (apartment: Apartment) => {
    if (priceFilter === "budget") return apartment.price_per_night <= 100;
    if (priceFilter === "mid") return apartment.price_per_night > 100 && apartment.price_per_night <= 200;
    if (priceFilter === "luxury") return apartment.price_per_night > 200;
    return true;
  };

  const sortApartments = (a: Apartment, b: Apartment) => {
    if (sortBy === "price-low") return a.price_per_night - b.price_per_night;
    if (sortBy === "price-high") return b.price_per_night - a.price_per_night;
    return 0;
  };

  const filteredApartments = apartments
    .filter(apartment => 
      apartment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apartment.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(apartment => filterApartments(apartment))
    .sort((a, b) => sortApartments(a, b));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading apartments...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">All Apartments</h1>
            <p className="text-muted-foreground text-lg">
              Discover our complete collection of beautiful apartments
            </p>
          </div>
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Error Loading Apartments</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Using demo data as fallback</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">All Apartments</h1>
          <p className="text-muted-foreground text-lg">
            Discover our complete collection of beautiful apartments
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 shadow-card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apartments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Under $100</SelectItem>
                <SelectItem value="mid">$100 - $200</SelectItem>
                <SelectItem value="luxury">$200+</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredApartments.length} apartment{filteredApartments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>

        {filteredApartments.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No apartments found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setPriceFilter("all");
                setSortBy("name");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};