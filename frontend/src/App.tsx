import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { SportsBackground } from "./components/ui/SportsBackground";
import { motion, AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PlayerDashboard from "./pages/PlayerDashboard";
import TurfDiscovery from "./pages/TurfDiscovery";
import BookingCalendar from "./pages/BookingCalendar";
import Matchmaking from "./pages/Matchmaking";
import MatchDetails from "./pages/MatchDetails";
import CreateMatch from "./pages/CreateMatch";
import MyMatches from "./pages/MyMatches";
import MyGames from "./pages/MyGames";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderTurfs from "./pages/ProviderTurfs";
import ProviderSlots from "./pages/ProviderSlots";
import ProviderBookings from "./pages/ProviderBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            {/* Player routes */}
            <Route path="/dashboard" element={<PlayerDashboard />} />
            <Route path="/discover" element={<TurfDiscovery />} />
            <Route path="/booking" element={<BookingCalendar />} />
            <Route path="/matchmaking" element={<Matchmaking />} />
            <Route path="/matches" element={<Matchmaking />} />
            <Route path="/matches/create" element={<CreateMatch />} />
            <Route path="/matches/:id" element={<MatchDetails />} />
            <Route path="/matchmaking/:id" element={<MatchDetails />} />
            <Route path="/my-matches" element={<MyMatches />} />
            <Route path="/my-games" element={<MyGames />} />
            {/* Provider routes */}
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/turfs" element={<ProviderTurfs />} />
            <Route path="/provider/slots" element={<ProviderSlots />} />
            <Route path="/provider/bookings" element={<ProviderBookings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SportsBackground />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RoleProvider>
            <AnimatedRoutes />
          </RoleProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

