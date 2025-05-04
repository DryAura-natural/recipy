import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cuisines = [
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "American",
  "Indian",
  "French",
  "Greek",
  "Thai",
  "Japanese",
  "Chinese",
  "Spanish",
  "Middle Eastern",
  "Korean",
  "Vietnamese"
] as const;

export const mealTypes = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snack",
  "Appetizer",
  "Side Dish",
  "Drink"
] as const;

export const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Low-Fat",
  "Pescatarian",
  "Nut-Free"
] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  prepTime: integer("prep_time").notNull(), // in minutes
  cookingTime: integer("cooking_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  ingredients: json("ingredients").notNull().$type<string[]>(),
  instructions: json("instructions").notNull().$type<string[]>(),
  cuisine: text("cuisine").notNull(),
  mealType: text("meal_type").notNull(),
  dietaryOptions: json("dietary_options").notNull().$type<string[]>(),
  createdBy: integer("created_by").notNull(),
  rating: integer("rating").default(0),
  ratingCount: integer("rating_count").default(0),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  rating: true,
  ratingCount: true,
});

export const recipeSearchSchema = z.object({
  query: z.string().optional(),
  cuisine: z.string().optional(),
  mealType: z.string().optional(),
  dietaryOption: z.string().optional(),
  sort: z.enum(['popular', 'newest', 'cookingTime']).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type RecipeSearch = z.infer<typeof recipeSearchSchema>;
