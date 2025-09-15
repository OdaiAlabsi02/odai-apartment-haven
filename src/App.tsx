import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomePage } from "./pages/HomePage";
import { ApartmentDetailsPage } from "./pages/ApartmentDetailsPage";
import { BookingPage } from "./pages/BookingPage";
import { BookingConfirmationPage } from "./pages/BookingConfirmationPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminPage } from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";
import ListingsPage from "./pages/admin/ListingsPage";
import BookingsPage from "./pages/admin/BookingsPage";
import MessagesPage from "./pages/admin/MessagesPage";
import UsersPage from "./pages/admin/UsersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AmenitiesPage from "./pages/admin/AmenitiesPage";
import AvailabilityPage from "./pages/admin/AvailabilityPage";
import AddListingPage from "./pages/admin/AddListingPage";
import AddListingStep1Page from "./pages/admin/AddListingStep1Page";
import AddListingStep2Page from "./pages/admin/AddListingStep2Page";
import AddListingStep3Page from "./pages/admin/AddListingStep3Page";
import AddListingStep4Page from "./pages/admin/AddListingStep4Page";
import AddListingStep5Page from "./pages/admin/AddListingStep5Page";
import ListingEditorPage from "./pages/admin/ListingEditorPage";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function AppWithRouterLogic() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/apartment/:id" element={<ApartmentDetailsPage />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth/callback" element={<div>Processing authentication...</div>} />
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="listings" element={<ListingsPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="amenities" element={<AmenitiesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="add-listing" element={<AddListingStep1Page />} />
            <Route path="add-listing/step1" element={<AddListingStep1Page />} />
            <Route path="add-listing/step2" element={<AddListingStep2Page />} />
            <Route path="add-listing/step3" element={<AddListingStep3Page />} />
            <Route path="add-listing/step4" element={<AddListingStep4Page />} />
            <Route path="add-listing/step5" element={<AddListingStep5Page />} />
            <Route path="listing-editor/:listingId" element={<ListingEditorPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppWithRouterLogic />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
