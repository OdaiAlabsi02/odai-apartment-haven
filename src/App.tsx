import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomePage } from "./pages/HomePage";
import { ApartmentsPage } from "./pages/ApartmentsPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/apartments" element={<ApartmentsPage />} />
              <Route path="/apartment/:id" element={<ApartmentDetailsPage />} />
              <Route path="/book/:id" element={<BookingPage />} />
              <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPage />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="listings" element={<ListingsPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="settings" element={<SettingsPage />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
