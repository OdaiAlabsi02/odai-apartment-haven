import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Users, Star, Filter } from 'lucide-react';
import { propertyTypes, amenitiesList } from '@/data/jordanProperties';

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

interface PropertyFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const PropertyFilters = ({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  onClearFilters 
}: PropertyFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = localFilters.amenities;
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    handleFilterChange('amenities', newAmenities);
  };

  const handleApplyFilters = () => {
    onApplyFilters();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      location: '',
      checkIn: '',
      checkOut: '',
      guests: '1',
      priceRange: [0, 500],
      propertyType: '',
      amenities: [],
      minRating: 0
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  return (
    <Card className="w-80 h-fit sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            placeholder="City or region"
            value={localFilters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Check in
            </Label>
            <Input
              type="date"
              value={localFilters.checkIn}
              onChange={(e) => handleFilterChange('checkIn', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label>Check out</Label>
            <Input
              type="date"
              value={localFilters.checkOut}
              onChange={(e) => handleFilterChange('checkOut', e.target.value)}
              min={localFilters.checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Guests
          </Label>
          <Select 
            value={localFilters.guests} 
            onValueChange={(value) => handleFilterChange('guests', value)}
          >
            <SelectTrigger>
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

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price per night (JOD)</Label>
          <div className="px-2">
            <Slider
              value={localFilters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{localFilters.priceRange[0]} JOD</span>
            <span>{localFilters.priceRange[1]} JOD</span>
          </div>
        </div>

        <Separator />

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select 
            value={localFilters.propertyType} 
            onValueChange={(value) => handleFilterChange('propertyType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any type</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Amenities */}
        <div className="space-y-3">
          <Label>Amenities</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {amenitiesList.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={localFilters.amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                />
                <Label
                  htmlFor={amenity}
                  className="text-sm font-normal cursor-pointer"
                >
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Minimum Rating */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Minimum Rating
          </Label>
          <Select 
            value={localFilters.minRating.toString()} 
            onValueChange={(value) => handleFilterChange('minRating', parseFloat(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <Button 
            onClick={handleApplyFilters}
            className="w-full"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="w-full"
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
