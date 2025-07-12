import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
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
          <Route path="/how-we-grow" element={<HowWeGrow />} />
          <Route path="/how-farm-bags-work" element={<HowFarmBagsWork />} />
          <Route path="/meet-farmers" element={<MeetFarmers />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/support-local" element={<SupportLocal />} />
          <Route path="/anas-flowers" element={<AnasFlowers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
