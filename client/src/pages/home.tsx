import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RecipeCard from "@/components/recipe-card";
import SearchBar from "@/components/search-bar";
import FilterSection from "@/components/filter-section";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Recipe } from "@shared/schema";

export default function Home() {
  const [searchParams, setSearchParams] = useState({
    query: "",
    cuisine: "",
    mealType: "",
    dietaryOption: "",
    sort: "popular"
  });
  
  const queryString = Object.entries(searchParams)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  
  const { data: recipes, isLoading, isError } = useQuery<Recipe[]>({
    queryKey: [`/api/recipes?${queryString}`],
  });
  
  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query }));
  };
  
  const handleFilterChange = (type: string, value: string) => {
    setSearchParams(prev => ({ 
      ...prev, 
      [type]: value === "all" ? "" : value 
    }));
  };
  
  const handleSortChange = (sort: string) => {
    setSearchParams(prev => ({ ...prev, sort }));
  };

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-[#FF8A5B] text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find the Perfect Recipe for Any Occasion</h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">Search by ingredients, cuisine, or dietary needs to discover your next favorite dish.</p>
            
            <SearchBar onSearch={handleSearch} className="max-w-2xl mx-auto" />
          </div>
        </div>
      </section>
      
      <FilterSection 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        selectedCuisine={searchParams.cuisine}
        selectedMealType={searchParams.mealType}
        selectedDietaryOption={searchParams.dietaryOption}
        selectedSort={searchParams.sort}
      />
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">
          {searchParams.query ? `Search Results: "${searchParams.query}"` : "Popular Recipes"}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading recipes...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load recipes. Please try again later.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No recipes found. Try adjusting your search or filters.</p>
            <Button 
              className="mt-4" 
              onClick={() => setSearchParams({
                query: "",
                cuisine: "",
                mealType: "",
                dietaryOption: "",
                sort: "popular"
              })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
