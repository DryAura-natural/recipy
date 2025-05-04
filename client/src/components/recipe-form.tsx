import { useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRecipeSchema } from "@shared/schema";
import { cuisines, mealTypes, dietaryOptions } from "@shared/schema";
import { UserContext } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { X, Plus } from "lucide-react";

// Add validation rules to the schema
const formSchema = insertRecipeSchema
  .omit({ createdBy: true })
  .extend({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    imageUrl: z.string().url("Please enter a valid image URL"),
    prepTime: z.number().min(1, "Prep time must be at least 1 minute"),
    cookingTime: z.number().min(1, "Cooking time must be at least 1 minute"),
    servings: z.number().min(1, "Servings must be at least 1"),
    ingredients: z.array(z.string()).min(2, "Add at least 2 ingredients"),
    instructions: z.array(z.string()).min(2, "Add at least 2 instructions"),
  });

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RecipeForm() {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      prepTime: 15,
      cookingTime: 30,
      servings: 4,
      ingredients: [],
      instructions: [],
      cuisine: "American",
      mealType: "Dinner",
      dietaryOptions: [],
    },
  });
  
  const { control, formState, handleSubmit, watch, setValue } = form;
  const watchedIngredients = watch("ingredients");
  const watchedInstructions = watch("instructions");

  const addIngredient = () => {
    if (newIngredient.trim() === "") return;
    setValue("ingredients", [...watchedIngredients, newIngredient.trim()]);
    setNewIngredient("");
  };

  const removeIngredient = (index: number) => {
    setValue(
      "ingredients",
      watchedIngredients.filter((_, i) => i !== index)
    );
  };

  const addInstruction = () => {
    if (newInstruction.trim() === "") return;
    setValue("instructions", [...watchedInstructions, newInstruction.trim()]);
    setNewInstruction("");
  };

  const removeInstruction = (index: number) => {
    setValue(
      "instructions",
      watchedInstructions.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a recipe",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/recipes", data);
      const newRecipe = await response.json();
      
      toast({
        title: "Recipe Created",
        description: "Your recipe has been successfully created",
      });
      
      // Invalidate recipes cache
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      
      // Redirect to the new recipe
      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Homemade Margherita Pizza" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe your recipe..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a URL to an image of your dish
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={control}
                name="prepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="cookingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="cuisine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cuisines.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mealTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="dietaryOptions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Dietary Options</FormLabel>
                    <FormDescription>
                      Select all that apply
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map((option) => (
                      <FormField
                        key={option}
                        control={control}
                        name="dietaryOptions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div>
              <FormLabel>Ingredients</FormLabel>
              <FormDescription>
                Add all ingredients needed for your recipe
              </FormDescription>
              <div className="flex mt-2 mb-2">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="e.g. 2 cups flour"
                  className="mr-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addIngredient();
                    }
                  }}
                />
                <Button type="button" onClick={addIngredient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {watchedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span>{ingredient}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {formState.errors.ingredients && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {formState.errors.ingredients.message}
                </p>
              )}
            </div>

            <div>
              <FormLabel>Instructions</FormLabel>
              <FormDescription>
                Add step-by-step instructions for your recipe
              </FormDescription>
              <div className="flex mt-2 mb-2">
                <Textarea
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="Describe a step in your recipe..."
                  className="mr-2 resize-none"
                />
                <Button type="button" onClick={addInstruction} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {watchedInstructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between bg-gray-50 p-2 rounded"
                  >
                    <div className="flex">
                      <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        {index + 1}
                      </span>
                      <p className="flex-1">{instruction}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeInstruction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {formState.errors.instructions && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {formState.errors.instructions.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto" size="lg">
            Create Recipe
          </Button>
        </div>
      </form>
    </Form>
  );
}
