import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "@/App";
import { Clock, Star, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "@shared/schema";

export default function RecipeDetail() {
  const params = useParams<{ id: string }>();
  const recipeId = parseInt(params.id);
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  const { data: recipe, isLoading, isError } = useQuery<Recipe & { isFavorite: boolean }>({
    queryKey: [`/api/recipes/${recipeId}`],
  });
  
  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save recipes to favorites",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (recipe?.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${recipeId}`);
        queryClient.setQueryData(
          [`/api/recipes/${recipeId}`], 
          (old: any) => ({ ...old, isFavorite: false })
        );
        toast({
          title: "Removed from Favorites",
          description: "Recipe removed from your favorites",
        });
      } else {
        await apiRequest("POST", `/api/favorites/${recipeId}`);
        queryClient.setQueryData(
          [`/api/recipes/${recipeId}`], 
          (old: any) => ({ ...old, isFavorite: true })
        );
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
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-8 w-1/2 mb-3" />
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Skeleton className="h-8 w-1/2 mb-3" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex">
                  <Skeleton className="h-6 w-6 rounded-full mr-3" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError || !recipe) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-6">Failed to load recipe. The recipe may not exist or there was a server error.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  const totalTime = recipe.prepTime + recipe.cookingTime;
  
  // Dummy nutrition data for display purposes
  const nutritionInfo = {
    calories: "320 kcal",
    protein: "12g",
    carbs: "42g",
    fat: "14g"
  };
  
  // Dummy review data
  const reviews = [
    {
      name: "Sarah J.",
      rating: 5,
      comment: "This was absolutely delicious and so easy to make! I added chickpeas as suggested in the tips and it was perfect for my work lunches all week. Will definitely make again!"
    },
    {
      name: "Michael P.",
      rating: 4,
      comment: "Great recipe! I substituted some ingredients since that's what I had on hand. Still turned out great. Would make again but with a bit more seasoning next time."
    },
    {
      name: "Emma L.",
      rating: 5,
      comment: "My family loved this! Even my picky eaters asked for seconds. The instructions were easy to follow and the result was fantastic."
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl overflow-hidden shadow-md mb-8">
        <div className="relative">
          <img 
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-primary text-white">
                {totalTime} min
              </Badge>
              <Badge variant="outline" className="bg-white text-gray-800">
                {recipe.cuisine}
              </Badge>
              {recipe.dietaryOptions.map(option => (
                <Badge key={option} variant="outline" className="bg-white text-gray-800">
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{recipe.title}</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="text-accent mr-1" />
                <span className="font-medium">{recipe.rating}</span>
                <span className="text-gray-500 ml-1">({recipe.ratingCount} ratings)</span>
              </div>
              <div className="flex items-center">
                <Clock className="text-gray-500 mr-1" />
                <span className="text-gray-500">{totalTime} minutes</span>
              </div>
            </div>
            <Button 
              className={recipe.isFavorite ? "bg-primary-dark" : ""}
              onClick={handleFavoriteToggle}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 24 24" 
                fill={recipe.isFavorite ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {recipe.isFavorite ? "Saved" : "Save Recipe"}
            </Button>
          </div>
          
          <p className="text-gray-700 mb-6">
            {recipe.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h2 className="font-bold text-lg mb-3 border-b pb-2">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      className="text-secondary mt-1 mr-2 h-5 w-5"
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
              
              <h2 className="font-bold text-lg mt-6 mb-3 border-b pb-2">Nutrition Info</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-500">Calories</p>
                  <p className="font-semibold">{nutritionInfo.calories}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-500">Protein</p>
                  <p className="font-semibold">{nutritionInfo.protein}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-500">Carbs</p>
                  <p className="font-semibold">{nutritionInfo.carbs}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-500">Fat</p>
                  <p className="font-semibold">{nutritionInfo.fat}</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h2 className="font-bold text-lg mb-3 border-b pb-2">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <p>{instruction}</p>
                  </li>
                ))}
              </ol>
              
              <div className="mt-8">
                <h2 className="font-bold text-lg mb-3">Chef's Tips</h2>
                <div className="bg-amber-50 border-l-4 border-accent p-4 rounded-r">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg 
                        className="text-accent mt-1 mr-2 h-5 w-5"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M9.663 17h4.673M12 3v1M12 20v1M3 12h1M20 12h1M18.364 5.636l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>For extra flavor, toast any nuts or seeds before adding them to the recipe.</span>
                    </li>
                    <li className="flex items-start">
                      <svg 
                        className="text-accent mt-1 mr-2 h-5 w-5"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M9.663 17h4.673M12 3v1M12 20v1M3 12h1M20 12h1M18.364 5.636l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Adjust seasoning to your taste preferences - recipes are just guidelines!</span>
                    </li>
                    <li className="flex items-start">
                      <svg 
                        className="text-accent mt-1 mr-2 h-5 w-5"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M9.663 17h4.673M12 3v1M12 20v1M3 12h1M20 12h1M18.364 5.636l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>This recipe works great for meal prep - portion into containers for quick meals.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="font-bold text-lg mb-3">Reviews</h2>
                <div className="space-y-4">
                  {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                            <User className="text-gray-500 h-4 w-4" />
                          </div>
                          <span className="font-medium">{review.name}</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                  
                  {reviews.length > 2 && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      {showAllReviews ? (
                        <>Show Less <ChevronUp className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>Show More Reviews <ChevronDown className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
