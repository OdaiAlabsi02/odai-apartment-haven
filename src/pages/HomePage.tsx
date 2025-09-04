import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApartmentCard } from "@/components/ApartmentCard";

import heroImage from "@/assets/hero-apartment.jpg";
import { useApartmentsProxy } from "@/hooks/useApartmentsProxy";

export const HomePage = () => {
  const { apartments, loading, connectionStatus, usingDemoData } = useApartmentsProxy();
  
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

      {/* Connection Status Banner */}
      {connectionStatus === 'fallback' && (
        <section className="py-4 bg-blue-50 border-l-4 border-blue-400">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Using Real Data (Offline Mode).</strong> We're experiencing temporary connectivity issues with our database. You're viewing real apartment data from our backup system.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {connectionStatus === 'failed' && (
        <section className="py-4 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Demo Mode Active.</strong> We're experiencing database connectivity issues. You're currently viewing demo apartment data.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

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