import { useState, useContext } from "react";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "@/App";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe & { isFavorite?: boolean };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { user } = useContext(UserContext);
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite || false);
  const { toast } = useToast();
  
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save recipes to favorites",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${recipe.id}`);
        setIsFavorite(false);
        toast({
          title: "Removed from Favorites",
          description: "Recipe removed from your favorites",
        });
      } else {
        await apiRequest("POST", `/api/favorites/${recipe.id}`);
        setIsFavorite(true);
        toast({
          title: "Added to Favorites",
          description: "Recipe added to your favorites",
        });
      }
      
      // Invalidate favorites cache
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };
  
  const totalTime = recipe.prepTime + recipe.cookingTime;
  
  return (
    <div className="recipe-card bg-white rounded-xl overflow-hidden shadow-md">
      <div className="relative">
        <img 
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        <button 
          className="absolute top-3 right-3 bg-white p-2 rounded-full text-gray-600 hover:text-primary transition-colors"
          onClick={handleFavoriteToggle}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          )}
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex gap-2">
            <span className="text-xs font-medium bg-primary text-white px-2 py-1 rounded">
              {totalTime} min
            </span>
            <span className="text-xs font-medium bg-white text-gray-800 px-2 py-1 rounded">
              {recipe.cuisine}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <Star className="text-accent text-sm" />
              <span className="ml-1 text-sm font-medium">{recipe.rating}</span>
            </div>
            <span className="text-sm text-gray-500">{recipe.ratingCount} ratings</span>
          </div>
          <Link href={`/recipes/${recipe.id}`}>
            <Button variant="link" className="text-primary hover:text-primary-dark font-medium text-sm p-0">
              View Recipe
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
