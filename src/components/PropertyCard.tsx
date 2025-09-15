import { Star, MapPin, Users, Bed, Bath } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JordanProperty } from '@/data/jordanProperties';

interface PropertyCardProps {
  property: JordanProperty;
  onClick?: () => void;
}

export const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    return `${price} JOD per night`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={property.image_url}
          alt={property.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {property.featured && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500">
            Featured
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2">
          <div className="flex items-center text-white text-sm">
            {renderStars(property.rating)}
            <span className="ml-1">({property.review_count})</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>

          {/* Property Type */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {property.property_type}
            </Badge>
            {property.property_subtype && (
              <Badge variant="outline" className="text-xs">
                {property.property_subtype}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {property.description}
          </p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{property.guests} guest{property.guests !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(property.base_price)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">per night</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
