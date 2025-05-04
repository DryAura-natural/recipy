import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import RecipeCard from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart } from "lucide-react";
import { Link } from "wouter";
import type { Recipe } from "@shared/schema";

export default function Favorites() {
  const { user } = useContext(UserContext);
  
  const { data: favorites, isLoading, isError } = useQuery<Recipe[]>({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Login to View Favorites</h1>
          <p className="text-gray-600 mb-6">Sign in to save and view your favorite recipes.</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading your favorites...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">Failed to load your favorite recipes. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  if (!favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">No Favorites Yet</h1>
          <p className="text-gray-600 mb-6">You haven't saved any recipes to your favorites yet.</p>
          <Link href="/">
            <Button>Explore Recipes</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Favorite Recipes</h1>
        <Link href="/">
          <Button variant="outline">
            Explore More Recipes
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={{ ...recipe, isFavorite: true }} 
          />
        ))}
      </div>
    </div>
  );
}
