import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ZipCode from "./pages/ZipCode";
import Account from "./pages/Account";
import BoxSelection from "./pages/BoxSelection";
import ProductSelection from "./pages/ProductSelection";
import AddOns from "./pages/AddOns";
import Delivery from "./pages/Delivery";
import OrderSummary from "./pages/OrderSummary";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
