import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Register from "@/pages/register";
import Login from "@/pages/login";
import OTPVerification from "@/pages/otp-verification";
import Dashboard from "@/pages/dashboard";
import PlayerDashboard from "@/pages/player-dashboard";
import HotelManagerDashboard from "@/pages/hotel-manager-dashboard";
import EventManagerDashboard from "@/pages/event-manager-dashboard";
import TeamManagerDashboard from "@/pages/team-manager-dashboard";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/verify-otp" component={OTPVerification} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/player-dashboard" component={PlayerDashboard} />
      <Route path="/hotel-manager-dashboard" component={HotelManagerDashboard} />
      <Route path="/event-manager-dashboard" component={EventManagerDashboard} />
      <Route path="/team-manager-dashboard" component={TeamManagerDashboard} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
