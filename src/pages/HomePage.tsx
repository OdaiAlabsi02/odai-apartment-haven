import { SearchBox } from "@/components/SearchBox";
import heroImage from "@/assets/hero-apartment.jpg";

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Search Box */}
      <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Find Your Perfect
            <span className="block text-accent drop-shadow-sm">
              Home Away From Home
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 animate-slide-up mb-12">
            Discover beautiful apartments in prime locations. Skip the fees, book direct with Odai.
          </p>
          
          {/* Search Box */}
          <div className="animate-slide-up">
            <SearchBox />
          </div>
        </div>
      </section>
    </div>
  );
};