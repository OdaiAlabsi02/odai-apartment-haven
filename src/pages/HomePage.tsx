import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApartmentCard } from "@/components/ApartmentCard";

import heroImage from "@/assets/hero-apartment.jpg";
import { useApartments } from "@/hooks/useApartments";

export const HomePage = () => {
  const { apartments, loading } = useApartments();
  
  // Show featured apartments if they exist, otherwise show first 2 apartments from database
  const featuredApartments = apartments.length > 0
    ? (apartments.filter(apt => apt.featured).length > 0 
        ? apartments.filter(apt => apt.featured)
        : apartments.slice(0, 2))
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Find Your Perfect
            <span className="block text-accent drop-shadow-sm">
              Home Away From Home
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 animate-slide-up">
            Discover beautiful apartments in prime locations. Skip the fees, book direct with Odai.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Odai's Apartments?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Direct booking means better prices, personal service, and authentic local experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Booking Fees</h3>
              <p className="text-muted-foreground">Save money by booking directly. No hidden fees or commissions.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-muted-foreground">Carefully selected properties in the best neighborhoods.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personal Service</h3>
              <p className="text-muted-foreground">Direct communication with Odai for personalized assistance.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Apartments */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Apartments</h2>
            <Link to="/apartments">
              <Button variant="outline">View All Apartments</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-muted-foreground">Loading apartments...</div>
            </div>
          ) : featuredApartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredApartments.map((apartment) => (
                <ApartmentCard key={apartment.id} apartment={apartment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No apartments available yet. Add your first apartment from the admin panel!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Stay?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our collection of carefully curated apartments and enjoy a seamless booking experience
          </p>
          <Link to="/apartments">
            <Button size="lg" className="bg-button-gradient hover:opacity-90 transition-opacity">
              Explore All Apartments
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};