import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import RecipeDetail from "@/pages/recipe-detail";
import CreateRecipe from "@/pages/create-recipe";
import Favorites from "@/pages/favorites";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import React, { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";

type User = {
  id: number;
  username: string;
};

export const UserContext = React.createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}>({
  user: null,
  setUser: () => {},
});

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/recipes/:id" component={RecipeDetail} />
        <Route path="/create" component={CreateRecipe} />
        <Route path="/favorites" component={Favorites} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    apiRequest("GET", "/api/auth/current")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setUser(data);
        }
      })
      .catch(error => {
        console.error("Error checking authentication:", error);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <Toaster />
          <Router />
        </UserContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
