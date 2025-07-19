import { Link } from "react-router-dom";
import { MapPin, Users, Bed, Bath } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apartment } from "@/data/apartments";

interface ApartmentCardProps {
  apartment: Apartment;
}

export const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
  return (
    <Card className="group overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={apartment.primary_image || apartment.image_urls?.[0] || '/placeholder.svg'}
          alt={apartment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {apartment.featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-sm font-semibold">${apartment.price_per_night}/night</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight">{apartment.name}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {apartment.location}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{apartment.max_guests}</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-3 w-3 mr-1" />
              <span>{apartment.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-3 w-3 mr-1" />
              <span>{apartment.bathrooms}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2">
          {apartment.description}
        </p>

        <Link to={`/apartment/${apartment.id}`} className="block">
          <Button className="w-full bg-button-gradient hover:opacity-90 transition-opacity">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};