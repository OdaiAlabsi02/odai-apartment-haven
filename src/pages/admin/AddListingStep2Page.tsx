import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, MapPin, Search } from "lucide-react";

// Google Maps API script loader with Extended Component Library
const loadGoogleMapsScript = () => {
  return new Promise<void>((resolve) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    // Load Extended Component Library
    const extScript = document.createElement('script');
    extScript.type = 'module';
    extScript.src = 'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js';
    document.head.appendChild(extScript);

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBnnfa59uanWL3B7fMPJ0F_Bvm0jWH0kGg&libraries=places&v=beta`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

export default function AddListingStep2Page() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    google_location: "",
    street_name: "",
    building_number: "",
    apartment_number: "",
    additional_details: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });
  const [step1Data, setStep1Data] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState<any>(null);
  const [placePicker, setPlacePicker] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load data from step 1
    const step1DataStr = sessionStorage.getItem("listingStep1");
    if (step1DataStr) {
      setStep1Data(JSON.parse(step1DataStr));
    } else {
      // If no step 1 data, redirect back to step 1
      navigate("/admin/add-listing/step1");
    }

    // Load saved location data
    const step2DataStr = sessionStorage.getItem("listingStep2");
    if (step2DataStr) {
      try {
        const savedData = JSON.parse(step2DataStr);
        setForm({
          google_location: savedData.google_location || "",
          street_name: savedData.street_name || "",
          building_number: savedData.building_number || "",
          apartment_number: savedData.apartment_number || "",
          additional_details: savedData.additional_details || "",
          city: savedData.city || "",
          state: savedData.state || "",
          country: savedData.country || "",
          postal_code: savedData.postal_code || "",
        });
        if (savedData.selectedLocation) {
          setSelectedLocation(savedData.selectedLocation);
        }
      } catch (error) {
        console.error("Error loading saved location data:", error);
      }
    }

    // Load Google Maps
    loadGoogleMapsScript().then(() => {
      setMapLoaded(true);
      // Initialize map after a short delay to ensure DOM is ready
      setTimeout(() => {
        if ((window as any).google && (window as any).google.maps) {
          // Load saved map state or use defaults
          const step2DataStr = sessionStorage.getItem("listingStep2");
          let mapCenter = { lat: 31.91561508178711, lng: 35.91399383544922 }; // Amman, Jordan
          let mapZoom = 14;
          
          if (step2DataStr) {
            try {
              const savedData = JSON.parse(step2DataStr);
              if (savedData.mapCenter) {
                mapCenter = savedData.mapCenter;
              }
              if (savedData.mapZoom) {
                mapZoom = savedData.mapZoom;
              }
            } catch (error) {
              console.error("Error loading saved map state:", error);
            }
          }

          const map = new (window as any).google.maps.Map(document.getElementById('map'), {
            center: mapCenter,
            zoom: mapZoom,
            mapId: 'DEMO_MAP_ID'
          });

          // Add click listener to map
          map.addListener('click', handleMapClick);

          // Add a marker for the saved location or default location
          const markerPosition = selectedLocation || mapCenter;
          new (window as any).google.maps.Marker({
            position: markerPosition,
            map: map,
            title: 'Selected Location'
          });

          // Store map reference
          setMap(map);

          // Initialize place picker after custom elements are defined
          (window as any).customElements.whenDefined('gmpx-place-picker').then(() => {
            const container = document.getElementById('place-picker-container');
            if (container) {
              // Create place picker element
              const placePickerElement = document.createElement('gmpx-place-picker');
              placePickerElement.setAttribute('for-map', 'map');
              placePickerElement.setAttribute('placeholder', 'Search for address, place, or landmark...');
              container.appendChild(placePickerElement);
              
              setPlacePicker(placePickerElement);
              
              // Add event listener for place selection
              placePickerElement.addEventListener('gmpx-placechange', (event: any) => {
                const place = event.target.value;
                
                if (!place.location) {
                  alert("No details available for the selected place");
                  return;
                }

                // Update map view
                if (place.viewport) {
                  map.fitBounds(place.viewport);
                } else {
                  map.setCenter(place.location);
                  map.setZoom(17);
                }

                // Update selected location
                setSelectedLocation({
                  lat: typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat,
                  lng: typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng
                });

                // Update form with place details
                const addressComponents = place.formattedAddress || '';
                let streetName = '';
                let buildingNumber = '';
                
                // Try to extract street name and building number from address
                if (place.formattedAddress) {
                  const parts = place.formattedAddress.split(',');
                  if (parts.length > 0) {
                    streetName = parts[0].trim();
                  }
                }
                
                setForm(prev => ({
                  ...prev,
                  google_location: place.formattedAddress || place.displayName,
                  street_name: streetName,
                  building_number: buildingNumber
                }));
              });
            }
          });
        }
      }, 100);
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Auto-save functionality
  const saveDraft = () => {
    setIsSaving(true);
    const locationData = {
      ...form,
      selectedLocation,
      mapCenter: map ? { lat: map.getCenter().lat(), lng: map.getCenter().lng() } : null,
      mapZoom: map ? map.getZoom() : 14
    };
    sessionStorage.setItem("listingStep2", JSON.stringify(locationData));
    
    // Hide saving indicator after a short delay
    setTimeout(() => setIsSaving(false), 1000);
  };

  // Auto-save on form changes and location changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [form, selectedLocation, map]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, selectedLocation, map]);

  const handleMapClick = (event: any) => {
    const lat = typeof event.latLng.lat === 'function' ? event.latLng.lat() : event.latLng.lat;
    const lng = typeof event.latLng.lng === 'function' ? event.latLng.lng() : event.latLng.lng;
    setSelectedLocation({ lat, lng });
    
    // Reverse geocode to get address
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const addressComponents = results[0].address_components;
        let streetName = '';
        let buildingNumber = '';
        let city = '';
        let state = '';
        let country = '';
        let postalCode = '';
        
        for (const component of addressComponents) {
          if (component.types.includes('route')) {
            streetName = component.long_name;
          }
          if (component.types.includes('street_number')) {
            buildingNumber = component.long_name;
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        }
        
        setForm(prev => ({
          ...prev,
          google_location: results[0].formatted_address,
          street_name: streetName || prev.street_name,
          building_number: buildingNumber || prev.building_number,
          city: city || prev.city,
          state: state || prev.state,
          country: country || prev.country,
          postal_code: postalCode || prev.postal_code
        }));
      }
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !map) return;

    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // Update map center and zoom
        map.setCenter(location);
        map.setZoom(16);
        
        // Update selected location
        setSelectedLocation({ lat, lng });
        
        // Update form with address details
        const addressComponents = results[0].address_components;
        let streetName = '';
        let buildingNumber = '';
        let city = '';
        let state = '';
        let country = '';
        let postalCode = '';
        
        for (const component of addressComponents) {
          if (component.types.includes('route')) {
            streetName = component.long_name;
          }
          if (component.types.includes('street_number')) {
            buildingNumber = component.long_name;
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        }
        
        setForm(prev => ({
          ...prev,
          google_location: results[0].formatted_address,
          street_name: streetName || prev.street_name,
          building_number: buildingNumber || prev.building_number,
          city: city || prev.city,
          state: state || prev.state,
          country: country || prev.country,
          postal_code: postalCode || prev.postal_code
        }));
      }
    });
  };

  const handleBack = () => {
    // Save current step data
    saveDraft();
    navigate("/admin/add-listing/step1");
  };

  const handleNext = () => {
    // Validate required fields
    if (!form.google_location || !form.street_name || !form.building_number || 
        !form.city || !form.state || !form.country || !form.postal_code) {
      alert("Please fill in all required location details including city, state, country, and postal code");
      return;
    }

    // Store form data in sessionStorage for multi-step flow
    saveDraft();
    navigate("/admin/add-listing/step3");
  };

  if (!step1Data) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Add New Listing</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              1
            </div>
            <span>Basic Info</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              2
            </div>
            <span>Location</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              3
            </div>
            <span>Images</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              4
            </div>
            <span>Amenities</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
              5
            </div>
            <span>Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 2: Select Location</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click on the map to select your apartment location. The address will be automatically filled.
                </p>
              </div>
              {isSaving && (
                <div className="text-xs text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-1"></div>
                  Saving...
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Place Picker */}
              <div className="space-y-2">
                <Label htmlFor="place-picker">Search Location</Label>
                <div className="relative">
                  <div 
                    id="place-picker-container"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      minHeight: '40px'
                    }}
                  />
                </div>
              </div>

              {/* Map */}
              {mapLoaded ? (
                <div className="h-96 w-full rounded-lg overflow-hidden border relative">
                  <div 
                    id="map" 
                    className="w-full h-full"
                    style={{ height: '384px' }}
                  />
                </div>
              ) : (
                <div className="h-96 w-full rounded-lg border flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              )}
              
              {selectedLocation && (
                <div className="text-sm text-muted-foreground">
                  Selected: {typeof selectedLocation.lat === 'number' ? selectedLocation.lat.toFixed(6) : selectedLocation.lat}, {typeof selectedLocation.lng === 'number' ? selectedLocation.lng.toFixed(6) : selectedLocation.lng}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review and edit the address details for your apartment.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google_location">Full Address *</Label>
                <Input
                  id="google_location"
                  name="google_location"
                  placeholder="Full address from Google Maps"
                  value={form.google_location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_name">Street Name *</Label>
                <Input
                  id="street_name"
                  name="street_name"
                  placeholder="Enter street name"
                  value={form.street_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building_number">Building Number *</Label>
                  <Input
                    id="building_number"
                    name="building_number"
                    placeholder="Enter building number"
                    value={form.building_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment_number">Apartment Number</Label>
                  <Input
                    id="apartment_number"
                    name="apartment_number"
                    placeholder="Enter apartment number"
                    value={form.apartment_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_details">Additional Location Details</Label>
                <Textarea
                  id="additional_details"
                  name="additional_details"
                  placeholder="Any additional location details, landmarks, or directions..."
                  value={form.additional_details}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter state or province"
                    value={form.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Enter country"
                    value={form.country}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    placeholder="Enter postal code"
                    value={form.postal_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Step 1
        </Button>
        <Button type="button" onClick={handleNext}>
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 