import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Home, Users, Bed, Bath } from "lucide-react";
import { Apartment } from "@/data/apartments";

interface YourSpaceSectionProps {
  listing: Apartment;
  onUpdate: (data: Partial<Apartment>) => void;
}

// Property type options - same as AddListingStep5Page
const propertyTypes = [
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'secondary_unit', label: 'Secondary Unit', icon: '🏘️' },
  { value: 'unique_space', label: 'Unique Space', icon: '✨' },
  { value: 'boutique_hotel', label: 'Boutique Hotel', icon: '🏨' }
];

const propertySubtypes = {
  apartment: [
    { value: 'rental_unit', label: 'Rental Unit' },
    { value: 'condo', label: 'Condo' },
    { value: 'serviced_apartment', label: 'Serviced Apartment' },
    { value: 'loft', label: 'Loft' }
  ],
  house: [
    { value: 'detached_house', label: 'Detached House' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'cottage', label: 'Cottage' },
    { value: 'villa', label: 'Villa' }
  ],
  secondary_unit: [
    { value: 'basement', label: 'Basement' },
    { value: 'garage_apartment', label: 'Garage Apartment' },
    { value: 'in_law_suite', label: 'In-Law Suite' },
    { value: 'guest_house', label: 'Guest House' }
  ],
  unique_space: [
    { value: 'treehouse', label: 'Treehouse' },
    { value: 'yurt', label: 'Yurt' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'boat', label: 'Boat' }
  ],
  boutique_hotel: [
    { value: 'boutique_hotel', label: 'Boutique Hotel' },
    { value: 'inn', label: 'Inn' },
    { value: 'guesthouse', label: 'Guesthouse' }
  ]
};

const listingTypes = [
  { value: 'entire_place', label: 'Entire Place', description: 'Guests have the whole place to themselves' },
  { value: 'shared_room', label: 'Shared Room', description: 'Guests share a room with others' },
  { value: 'room', label: 'Room', description: 'Guests have a private room in a shared space' }
];

const sizeUnits = [
  { value: 'sq_meters', label: 'Square Meters' },
  { value: 'sq_feet', label: 'Square Feet' },
  { value: 'acres', label: 'Acres' }
];

export default function YourSpaceSection({ listing, onUpdate }: YourSpaceSectionProps) {
  // Property type form data state
  const [formData, setFormData] = useState({
    property_type: listing.property_type || 'apartment',
    property_subtype: listing.property_subtype || 'rental_unit',
    listing_type: listing.listing_type || 'entire_place',
    building_floors: listing.building_floors || 1,
    listing_floor: listing.listing_floor || 1,
    building_age: listing.building_age || '',
    unit_size: listing.unit_size || '',
    unit_size_unit: listing.unit_size_unit || 'sq_meters'
  });

  // Update formData when listing changes (for editing existing listings)
  useEffect(() => {
    setFormData({
      property_type: listing.property_type || 'apartment',
      property_subtype: listing.property_subtype || 'rental_unit',
      listing_type: listing.listing_type || 'entire_place',
      building_floors: listing.building_floors || 1,
      listing_floor: listing.listing_floor || 1,
      building_age: listing.building_age || '',
      unit_size: listing.unit_size || '',
      unit_size_unit: listing.unit_size_unit || 'sq_meters'
    });
  }, [listing]);

  const handleNumberChange = (field: keyof Apartment, value: number) => {
    onUpdate({ [field]: value });
  };

  const handleFormDataChange = (field: keyof typeof formData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update the listing with the new property type data
    onUpdate({
      property_type: newFormData.property_type,
      property_subtype: newFormData.property_subtype,
      listing_type: newFormData.listing_type,
      building_floors: newFormData.building_floors,
      listing_floor: newFormData.listing_floor,
      building_age: newFormData.building_age,
      unit_size: newFormData.unit_size,
      unit_size_unit: newFormData.unit_size_unit
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Space</h2>
        <p className="text-muted-foreground">Tell guests about your property and what makes it special.</p>
      </div>

      {/* Property Type Selection Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-3">🏠</span>
          Property Type Selection
        </h3>
        
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Progress</span>
            <span className="text-sm text-gray-500">
              {(() => {
                const totalFields = 7;
                const completedFields = [
                  formData.property_type,
                  formData.property_subtype,
                  formData.listing_type,
                  formData.building_floors,
                  formData.listing_floor,
                  formData.building_age,
                  formData.unit_size
                ].filter(Boolean).length;
                return `${completedFields}/${totalFields}`;
              })()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(() => {
                  const totalFields = 7;
                  const completedFields = [
                    formData.property_type,
                    formData.property_subtype,
                    formData.listing_type,
                    formData.building_floors,
                    formData.listing_floor,
                    formData.building_age,
                    formData.unit_size
                  ].filter(Boolean).length;
                  return (completedFields / totalFields) * 100;
                })()}%`
              }}
            ></div>
          </div>
        </div>
        
        {/* Current Selection Summary */}
        {(formData.property_type || formData.property_subtype || formData.listing_type) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Current Selection:</h4>
            <div className="flex flex-wrap gap-2">
              {formData.property_type && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {propertyTypes.find(t => t.value === formData.property_type)?.label}
                </Badge>
              )}
              {formData.property_subtype && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {propertySubtypes[formData.property_type as keyof typeof propertySubtypes]?.find(s => s.value === formData.property_subtype)?.label}
                </Badge>
              )}
              {formData.listing_type && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {listingTypes.find(t => t.value === formData.listing_type)?.label}
                </Badge>
              )}
            </div>
            {(formData.building_floors > 1 || formData.listing_floor > 1 || formData.building_age || formData.unit_size) && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="text-sm text-blue-700">
                  {formData.building_floors > 1 && `Building: ${formData.building_floors} floors`}
                  {formData.listing_floor > 1 && ` • Floor: ${formData.listing_floor}`}
                  {formData.building_age && ` • Built: ${formData.building_age}`}
                  {formData.unit_size && ` • Size: ${formData.unit_size} ${sizeUnits.find(u => u.value === formData.unit_size_unit)?.label}`}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Property Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Which is most like your place?
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Choose the category that best describes your property type. This helps guests understand what to expect.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {propertyTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  handleFormDataChange('property_type', type.value);
                  handleFormDataChange('property_subtype', ''); // Reset subtype when main type changes
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  formData.property_type === type.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-gray-900">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Property Subtype Selection */}
        {formData.property_type && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Property Type
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Select the specific type within your chosen category. This provides more detailed information for guests.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {propertySubtypes[formData.property_type as keyof typeof propertySubtypes]?.map((subtype) => (
                <button
                  key={subtype.value}
                  type="button"
                  onClick={() => handleFormDataChange('property_subtype', subtype.value)}
                  className={`p-3 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                    formData.property_subtype === subtype.value
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{subtype.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Listing Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Listing Type
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Choose how guests will access your space. This affects pricing and guest expectations.
          </p>
          <div className="space-y-3">
            {listingTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleFormDataChange('listing_type', type.value)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  formData.listing_type === type.value
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Building Details */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Building Details</h4>
          <p className="text-sm text-gray-600 mb-4">
            Provide information about the building structure and location of your listing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Floors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many floors in the building?
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleFormDataChange('building_floors', Math.max(1, formData.building_floors - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-lg">−</span>
                </button>
                <span className="text-2xl font-semibold min-w-[3rem] text-center">
                  {formData.building_floors}
                </span>
                <button
                  type="button"
                  onClick={() => handleFormDataChange('building_floors', formData.building_floors + 1)}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>

            {/* Listing Floor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which floor is the listing on?
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleFormDataChange('listing_floor', Math.max(1, formData.listing_floor - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-lg">−</span>
                </button>
                <span className="text-2xl font-semibold min-w-[3rem] text-center">
                  {formData.listing_floor}
                </span>
                <button
                  type="button"
                  onClick={() => handleFormDataChange('listing_floor', Math.min(formData.building_floors, formData.listing_floor + 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be between 1 and {formData.building_floors}
              </p>
            </div>
          </div>
        </div>

        {/* Building Age and Unit Size */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Property Specifications</h4>
          <p className="text-sm text-gray-600 mb-4">
            Additional details that help guests understand the property better.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built
              </label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.building_age}
                onChange={(e) => handleFormDataChange('building_age', e.target.value)}
                placeholder="e.g., 2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if unknown
              </p>
            </div>

            {/* Unit Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Size
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  value={formData.unit_size}
                  onChange={(e) => handleFormDataChange('unit_size', e.target.value)}
                  placeholder="e.g., 140"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={formData.unit_size_unit}
                  onChange={(e) => handleFormDataChange('unit_size_unit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sizeUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                The amount of indoor space that's available to guests.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity & Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity & Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Guest Capacity */}
            <div className="space-y-2">
              <Label htmlFor="max-guests">Guest capacity</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('max_guests', Math.max(1, (listing.max_guests || 1) - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold min-w-[3rem] text-center">
                  {listing.max_guests || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('max_guests', (listing.max_guests || 1) + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('bedrooms', Math.max(1, (listing.bedrooms || 1) - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold min-w-[3rem] text-center">
                  {listing.bedrooms || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('bedrooms', (listing.bedrooms || 1) + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total Beds */}
            <div className="space-y-2">
              <Label htmlFor="beds">Total Beds</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('beds', Math.max(1, (listing.beds || 1) - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold min-w-[3rem] text-center">
                  {listing.beds || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('beds', (listing.beds || 1) + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('bathrooms', Math.max(1, (listing.bathrooms || 1) - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold min-w-[3rem] text-center">
                  {listing.bathrooms || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange('bathrooms', (listing.bathrooms || 1) + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <p className="text-sm text-muted-foreground">
            Write a compelling description of your space. Highlight what makes it unique!
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe your space, its unique features, and what guests can expect..."
            value={listing.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {listing.description?.length || 0} characters
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 