import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeTelegramWebApp, getTelegramUser } from "@/lib/telegram";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Sponsorships from "@/pages/Sponsorships";
import Platforms from "@/pages/Platforms";
import Payment from "@/pages/Payment";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import type { User } from "@/lib/types";

function AuthenticatedApp({ user }: { user: User }) {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative">
      <Switch>
        <Route path="/" component={() => <Dashboard user={user} />} />
        <Route path="/profile" component={() => <Profile user={user} />} />
        <Route path="/sponsorships" component={() => <Sponsorships user={user} />} />
        <Route path="/platforms" component={() => <Platforms user={user} />} />
        <Route path="/payment" component={() => <Payment user={user} />} />
        <Route path="/admin" component={() => <Admin user={user} />} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg flex items-center justify-center">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Creator Sponsorship Hub</h1>
        <p className="text-gray-600 mb-6">Please open this app through Telegram WebApp</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authMutation = useMutation({
    mutationFn: (telegramUserData: any) => 
      apiRequest("POST", "/api/auth/telegram", telegramUserData),
    onSuccess: (response) => {
      response.json().then((userData) => {
        setUser(userData);
        setIsLoading(false);
      });
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  useEffect(() => {
    initializeTelegramWebApp();
    
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      authMutation.mutate({
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || `user_${telegramUser.id}`,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        profilePhoto: telegramUser.photo_url || null,
      });
    }
  }, []);

  if (isLoading || authMutation.isPending) {
    return <LoginScreen />;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Failed</h1>
          <p className="text-gray-600">Unable to authenticate with Telegram</p>
        </div>
      </div>
    );
  }

  return <AuthenticatedApp user={user} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
