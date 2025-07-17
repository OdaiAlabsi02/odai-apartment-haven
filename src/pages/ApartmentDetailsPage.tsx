import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Users, Bed, Bath, Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apartments } from "@/data/apartments";

export const ApartmentDetailsPage = () => {
  const { id } = useParams();
  const apartment = apartments.find(apt => apt.id === id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Apartment Not Found</h1>
          <Link to="/apartments">
            <Button variant="outline">Back to Apartments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === apartment.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? apartment.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/apartments" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Apartments
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <img
                src={apartment.images[currentImageIndex]}
                alt={apartment.name}
                className="w-full h-full object-cover"
              />
              
              {apartment.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {apartment.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-3 gap-2">
              {apartment.images.slice(0, 3).map((image, index) => (
                <button
                  key={index}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${apartment.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {apartment.featured && (
                <Badge className="mb-2 bg-accent text-accent-foreground">Featured</Badge>
              )}
              <h1 className="text-3xl font-bold mb-2">{apartment.name}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {apartment.location}
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{apartment.maxGuests} guests</span>
                </div>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{apartment.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{apartment.bathrooms} bathrooms</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6">
              <div className="text-2xl font-bold mb-2">
                ${apartment.pricePerNight}
                <span className="text-base font-normal text-muted-foreground"> / night</span>
              </div>
              <p className="text-muted-foreground mb-4">Plus taxes and fees</p>
              <Link to={`/book/${apartment.id}`}>
                <Button className="w-full bg-button-gradient hover:opacity-90 transition-opacity">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{apartment.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {apartment.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-success mr-2" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Apartments */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Apartments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apartments
              .filter(apt => apt.id !== apartment.id)
              .slice(0, 3)
              .map((apt) => (
                <Card key={apt.id} className="overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={apt.images[0]}
                      alt={apt.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{apt.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{apt.location}</p>
                    <p className="font-semibold">${apt.pricePerNight}/night</p>
                    <Link to={`/apartment/${apt.id}`} className="block mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};