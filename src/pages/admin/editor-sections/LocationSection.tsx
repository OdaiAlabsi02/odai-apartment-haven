import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Apartment } from "@/data/apartments";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  listing: Apartment;
  onUpdate: (data: Partial<Apartment>) => void;
};

// Reuse the same loader approach as AddListingStep2Page
const loadGoogleMapsScript = () => {
  return new Promise<void>((resolve) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    const extScript = document.createElement('script');
    extScript.type = 'module';
    extScript.src = 'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js';
    document.head.appendChild(extScript);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBnnfa59uanWL3B7fMPJ0F_Bvm0jWH0kGg&libraries=places&v=beta`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

export default function LocationSection({ listing, onUpdate }: Props) {
  // Local form state for manual entry
  const [form, setForm] = useState<any>({
    latitude: "",
    longitude: "",
    street_name: "",
    building_number: "",
    floor_number: "",
    flat_number: "",
    neighborhood: "",
    country: "",
    city: "",
  });
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const mapObjRef = useRef<any>(null);

  // Load existing stored location (if any) and init map/search
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('property_locations')
        .select('*')
        .eq('property_id', (listing as any).id)
        .maybeSingle();
      if (data) {
        setForm({
          latitude: data.latitude ?? "",
          longitude: data.longitude ?? "",
          street_name: data.street_name ?? "",
          building_number: data.building_number ?? "",
          floor_number: data.floor_number ?? "",
          flat_number: data.flat_number ?? "",
          neighborhood: data.neighborhood ?? "",
          country: data.country ?? "",
          city: listing.city || "",
        });
      } else {
        setForm((prev: any) => ({ ...prev, city: listing.city || "" }));
      }

      // Initialize Google map and place picker
      await loadGoogleMapsScript();
      const center = (data?.latitude && data?.longitude)
        ? { lat: Number(data.latitude), lng: Number(data.longitude) }
        : { lat: 31.9539, lng: 35.9106 };
      const map = new (window as any).google.maps.Map(mapRef.current, { center, zoom: data?.zoom || 13 });
      mapObjRef.current = map;
      if (data?.latitude && data?.longitude) {
        markerRef.current = new (window as any).google.maps.Marker({ position: center, map });
      }
      map.addListener('click', (event: any) => handleMapClick(event, map));
      (window as any).customElements.whenDefined('gmpx-place-picker').then(() => initPlacePicker(map));
    })();
  }, [(listing as any).id]);

  const initPlacePicker = (map: any) => {
    const container = document.getElementById('editor-place-picker');
    if (!container || container.childElementCount > 0) return;
    const el = document.createElement('gmpx-place-picker');
    el.setAttribute('for-map', 'editor-map');
    el.setAttribute('placeholder', 'Search for address, place, or landmark...');
    container.appendChild(el);
    el.addEventListener('gmpx-placechange', (event: any) => onPlaceChange(event, map));
  };

  const setMarker = (position: any, map: any) => {
    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new (window as any).google.maps.Marker({ position, map });
  };

  const onPlaceChange = async (event: any, map: any) => {
    const place = event.target.value;
    if (!place) return;
    if (place.viewport) map.fitBounds(place.viewport); else if (place.location) { map.setCenter(place.location); map.setZoom(16); }
    if (place.location) setMarker(place.location, map);

    // Fallback: if place.location missing, geocode the formatted address
    let lat = typeof place.location?.lat === 'function' ? place.location.lat() : place.location?.lat;
    let lng = typeof place.location?.lng === 'function' ? place.location.lng() : place.location?.lng;
    if ((lat == null || lng == null) && (window as any).google?.maps) {
      const geocoder = new (window as any).google.maps.Geocoder();
      const address = place.formattedAddress || place.displayName;
      if (address) {
        await new Promise<void>((resolve) => {
          geocoder.geocode({ address }, (results: any, status: any) => {
            if (status === 'OK' && results?.[0]) {
              const loc = results[0].geometry.location;
              lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
              lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
              const pos = { lat, lng } as any;
              setMarker(pos, map);
              map.setCenter(pos);
              map.setZoom(16);
            }
            resolve();
          });
        });
      }
    }
    const address = place.formattedAddress || '';
    const parts = address ? String(address).split(',') : [];
    const streetName = parts.length > 0 ? parts[0].trim() : '';
    const city = form.city || (place?.displayName || '');

    setForm((prev: any) => ({
      ...prev,
      latitude: lat ?? prev.latitude,
      longitude: lng ?? prev.longitude,
      street_name: streetName || prev.street_name,
      city: city || prev.city
    }));

    const mapUrl = lat != null && lng != null ? `https://www.google.com/maps?q=${lat},${lng}` : null;
    await supabase.from('property_locations').upsert({
      property_id: (listing as any).id,
      place_id: place?.id || null,
      place_name: place?.displayName || null,
      formatted_address: place?.formattedAddress || null,
      latitude: lat ?? null,
      longitude: lng ?? null,
      zoom: map.getZoom?.() ?? 15,
      map_url: mapUrl,
      address_components: place?.addressComponents ? JSON.parse(JSON.stringify(place.addressComponents)) : null,
      street_name: streetName || null
    });
    if (city) onUpdate({ city } as any);
  };

  const handleMapClick = (event: any, map: any) => {
    const lat = typeof event.latLng.lat === 'function' ? event.latLng.lat() : event.latLng.lat;
    const lng = typeof event.latLng.lng === 'function' ? event.latLng.lng() : event.latLng.lng;
    setMarker({ lat, lng }, map);
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, async (results: any, status: any) => {
      if (status === 'OK' && results?.[0]) {
        const comps = results[0].address_components;
        const locality = comps.find((c: any) => c.types.includes('locality'))?.long_name;
        const route = comps.find((c: any) => c.types.includes('route'))?.long_name;
        setForm((prev: any) => ({ ...prev, latitude: lat, longitude: lng, city: locality || prev.city, street_name: route || prev.street_name }));
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        await supabase.from('property_locations').upsert({
          property_id: (listing as any).id,
          formatted_address: results[0].formatted_address,
          latitude: lat,
          longitude: lng,
          zoom: map.getZoom?.() ?? 15,
          map_url: mapUrl,
          address_components: JSON.parse(JSON.stringify(results[0].address_components))
        });
        if (locality) onUpdate({ city: locality } as any);
      }
    });
  };

  // Debounced autosave to DB when fields change
  useEffect(() => {
    const t = setTimeout(async () => {
      await supabase.from('property_locations').upsert({
        property_id: (listing as any).id,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        street_name: form.street_name || null,
        building_number: form.building_number || null,
        floor_number: form.floor_number || null,
        flat_number: form.flat_number || null,
        neighborhood: form.neighborhood || null,
        country: form.country || null,
      });
      // Keep property.city in sync for listings/search
      if (form.city !== undefined && form.city !== listing.city) {
        onUpdate({ city: form.city } as any);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [form, (listing as any).id]);

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: any) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Search Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="editor-place-picker" className="mb-4" />
          <div id="editor-map" ref={mapRef} className="h-80 w-full rounded-lg border" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Latitude</Label>
              <Input value={form.latitude} onChange={handleChange('latitude')} placeholder="e.g., 31.9539" />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input value={form.longitude} onChange={handleChange('longitude')} placeholder="e.g., 35.9106" />
            </div>
            <div>
              <Label>Street Name</Label>
              <Input value={form.street_name} onChange={handleChange('street_name')} />
            </div>
            <div>
              <Label>Building Number</Label>
              <Input value={form.building_number} onChange={handleChange('building_number')} />
            </div>
            <div>
              <Label>Floor Number</Label>
              <Input value={form.floor_number} onChange={handleChange('floor_number')} />
            </div>
            <div>
              <Label>Flat Number</Label>
              <Input value={form.flat_number} onChange={handleChange('flat_number')} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={handleChange('city')} />
            </div>
            <div>
              <Label>Neighborhood</Label>
              <Input value={form.neighborhood} onChange={handleChange('neighborhood')} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={handleChange('country')} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


