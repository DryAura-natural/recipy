import { useContext } from "react";
import { UserContext } from "@/App";
import RecipeForm from "@/components/recipe-form";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CreateRecipe() {
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to create a recipe.</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-[#FF8A5B] p-6">
            <h1 className="text-2xl font-bold text-white">Create a New Recipe</h1>
            <p className="text-white/80 mt-2">Share your culinary masterpiece with the world</p>
          </div>
          
          <div className="p-6">
            <RecipeForm />
          </div>
        </div>
      </div>
    </div>
  );
}
