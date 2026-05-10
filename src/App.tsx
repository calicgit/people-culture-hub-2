import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import CouncilLogin from "./pages/CouncilLogin";
import PortalDashboard from "./pages/PortalDashboard";
import ResetPassword from "./pages/ResetPassword";
import Sections from "./pages/Sections";
import Legal from "./pages/Legal";
import MeetupInvite from "./pages/MeetupInvite";
import Resources from "./pages/Resources";
import Team from "./pages/Team";
import MembershipApplication from "./pages/MembershipApplication";
import CorporateMembershipApplication from "./pages/CorporateMembershipApplication";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/council-login" element={<CouncilLogin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/portal" element={<PortalDashboard />} />
              </Route>
              <Route path="/sections" element={<Sections />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/meetup-invite" element={<MeetupInvite />} />
              <Route path="/tim" element={<Team />} />
              <Route path="/prijava-clanstvo" element={<MembershipApplication />} />
              <Route path="/prijava-korporativno" element={<CorporateMembershipApplication />} />
              <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
