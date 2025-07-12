import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import UnauthenticatedLanding from "./pages/UnauthenticatedLanding";
import Auth from "./pages/Auth";
import MyPlan from "./pages/MyPlan";
import MyBag from "./pages/MyBag";
import HowWeGrow from "./pages/HowWeGrow";
import OurMission from "./pages/OurMission";
import MeetFarmers from "./pages/MeetFarmers";
import FAQs from "./pages/FAQs";
import GiftCards from "./pages/GiftCards";
import Sustainability from "./pages/Sustainability";
import SupportLocal from "./pages/SupportLocal";
import AnasFlowers from "./pages/AnasFlowers";
import ZipCode from "./pages/ZipCode";
import Account from "./pages/Account";
import BoxSelection from "./pages/BoxSelection";
import ProductSelection from "./pages/ProductSelection";
import AddOns from "./pages/AddOns";
import Delivery from "./pages/Delivery";
import OrderSummary from "./pages/OrderSummary";
import Confirmation from "./pages/Confirmation";
import HowFarmBagsWork from "./pages/HowFarmBagsWork";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🌱</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/anas-flowers" element={<AnasFlowers />} />
        <Route path="/how-we-grow" element={<HowWeGrow />} />
        <Route path="/our-mission" element={<OurMission />} />
        <Route path="/meet-farmers" element={<MeetFarmers />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/sustainability" element={<Sustainability />} />
        <Route path="/support-local" element={<SupportLocal />} />
        <Route path="/how-farm-bags-work" element={<HowFarmBagsWork />} />
        <Route path="/gift-cards" element={<GiftCards />} />
        
        {/* Conditional landing page */}
        <Route path="/" element={user ? <Landing /> : <UnauthenticatedLanding />} />
        
        {/* Protected routes */}
        {user ? (
          <>
            <Route path="/zip-code" element={<ZipCode />} />
            <Route path="/account" element={<Account />} />
            <Route path="/box-selection" element={<BoxSelection />} />
            <Route path="/product-selection" element={<ProductSelection />} />
            <Route path="/add-ons" element={<AddOns />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/my-plan" element={<MyPlan />} />
            <Route path="/my-bag" element={<MyBag />} />
          </>
        ) : (
          <>
            {/* Redirect protected routes to auth */}
            <Route path="/my-plan" element={<Auth />} />
            <Route path="/my-bag" element={<Auth />} />
            <Route path="/account" element={<Auth />} />
          </>
        )}
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
