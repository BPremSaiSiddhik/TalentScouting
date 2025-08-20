import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import Marketplace from "@/pages/marketplace";
import TalentDashboard from "@/pages/talent-dashboard";
import InvestorDashboard from "@/pages/investor-dashboard";
import Navbar from "@/components/ui/navbar";

function Router() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/marketplace" component={Marketplace} />
          <ProtectedRoute path="/talent" component={TalentDashboard} />
          <ProtectedRoute path="/investor" component={InvestorDashboard} />
          <Route path="/" component={Marketplace} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
