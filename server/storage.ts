import { users, type User, type InsertUser, recipes, type Recipe, type InsertRecipe, favorites, type Favorite, type RecipeSearch } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe operations
  getRecipe(id: number): Promise<Recipe | undefined>;
  getAllRecipes(): Promise<Recipe[]>;
  searchRecipes(search: RecipeSearch): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Favorite operations
  addToFavorites(userId: number, recipeId: number): Promise<Favorite>;
  removeFromFavorites(userId: number, recipeId: number): Promise<boolean>;
  getFavorites(userId: number): Promise<Recipe[]>;
  isFavorite(userId: number, recipeId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  private favorites: Map<number, Favorite>;
  private userIdCounter: number;
  private recipeIdCounter: number;
  private favoriteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.favorites = new Map();
    this.userIdCounter = 1;
    this.recipeIdCounter = 1;
    this.favoriteIdCounter = 1;
    
    // Add some initial recipes for testing
    this.seedRecipes();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Recipe operations
  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async searchRecipes(search: RecipeSearch): Promise<Recipe[]> {
    let results = Array.from(this.recipes.values());
    
    // Filter by search query (title, ingredients)
    if (search.query) {
      const query = search.query.toLowerCase();
      results = results.filter(recipe => 
        recipe.title.toLowerCase().includes(query) || 
        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query))
      );
    }
    
    // Filter by cuisine
    if (search.cuisine) {
      results = results.filter(recipe => recipe.cuisine === search.cuisine);
    }
    
    // Filter by meal type
    if (search.mealType) {
      results = results.filter(recipe => recipe.mealType === search.mealType);
    }
    
    // Filter by dietary option
    if (search.dietaryOption) {
      results = results.filter(recipe => 
        recipe.dietaryOptions.includes(search.dietaryOption || '')
      );
    }
    
    // Sort results
    if (search.sort) {
      switch (search.sort) {
        case 'popular':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          results.sort((a, b) => b.id - a.id);
          break;
        case 'cookingTime':
          results.sort((a, b) => a.cookingTime - b.cookingTime);
          break;
      }
    }
    
    return results;
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.recipeIdCounter++;
    const recipe: Recipe = { 
      ...insertRecipe, 
      id, 
      rating: 0, 
      ratingCount: 0 
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async updateRecipe(id: number, recipeUpdate: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const recipe = this.recipes.get(id);
    if (!recipe) return undefined;
    
    const updatedRecipe: Recipe = { ...recipe, ...recipeUpdate };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Favorite operations
  async addToFavorites(userId: number, recipeId: number): Promise<Favorite> {
    // Check if already a favorite
    const existing = Array.from(this.favorites.values()).find(
      f => f.userId === userId && f.recipeId === recipeId
    );
    
    if (existing) return existing;
    
    const id = this.favoriteIdCounter++;
    const favorite: Favorite = { id, userId, recipeId };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: number, recipeId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      f => f.userId === userId && f.recipeId === recipeId
    );
    
    if (!favorite) return false;
    return this.favorites.delete(favorite.id);
  }

  async getFavorites(userId: number): Promise<Recipe[]> {
    const favoriteRecipeIds = Array.from(this.favorites.values())
      .filter(f => f.userId === userId)
      .map(f => f.recipeId);
    
    return Array.from(this.recipes.values())
      .filter(recipe => favoriteRecipeIds.includes(recipe.id));
  }

  async isFavorite(userId: number, recipeId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      f => f.userId === userId && f.recipeId === recipeId
    );
  }

  // Seed initial data
  private seedRecipes() {
    const sampleRecipes: InsertRecipe[] = [
      {
        title: "Mediterranean Quinoa Bowl",
        description: "A protein-rich quinoa bowl with fresh vegetables, feta cheese, and a tangy lemon dressing.",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500",
        prepTime: 15,
        cookingTime: 15,
        servings: 4,
        ingredients: [
          "1 cup quinoa, rinsed",
          "2 cups vegetable broth",
          "1 cucumber, diced",
          "1 cup cherry tomatoes, halved",
          "1/2 red onion, finely diced",
          "1/2 cup kalamata olives, pitted and sliced",
          "1/2 cup feta cheese, crumbled",
          "1/4 cup fresh parsley, chopped",
          "3 tbsp extra virgin olive oil",
          "2 tbsp lemon juice",
          "1 clove garlic, minced",
          "Salt and pepper to taste"
        ],
        instructions: [
          "In a medium saucepan, combine quinoa and vegetable broth. Bring to a boil, then reduce heat to low, cover, and simmer for 15 minutes until liquid is absorbed and quinoa is tender.",
          "While quinoa cooks, prepare the dressing by whisking together olive oil, lemon juice, minced garlic, salt, and pepper in a small bowl.",
          "Once quinoa is done, fluff with a fork and let cool for 5 minutes.",
          "In a large bowl, combine cooked quinoa, cucumber, cherry tomatoes, red onion, kalamata olives, and parsley.",
          "Pour the dressing over the salad and toss gently to combine.",
          "Top with crumbled feta cheese and additional fresh parsley if desired.",
          "Serve immediately or refrigerate for up to 3 days. Enjoy cold or at room temperature."
        ],
        cuisine: "Mediterranean",
        mealType: "Lunch",
        dietaryOptions: ["Vegetarian", "Gluten-Free"],
        createdBy: 1
      },
      {
        title: "Classic Margherita Pizza",
        description: "Traditional Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil on a thin crust.",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500",
        prepTime: 20,
        cookingTime: 25,
        servings: 2,
        ingredients: [
          "Pizza dough for one 12-inch crust",
          "1/4 cup tomato sauce",
          "8 oz fresh mozzarella, sliced",
          "Fresh basil leaves",
          "2 tbsp olive oil",
          "Salt to taste"
        ],
        instructions: [
          "Preheat oven to 475°F (245°C) with a pizza stone if available.",
          "Roll out the pizza dough to a 12-inch circle on a floured surface.",
          "Spread tomato sauce evenly over the dough, leaving a 1/2-inch border for the crust.",
          "Arrange mozzarella slices over the sauce.",
          "Bake for 10-12 minutes until the crust is golden and cheese is bubbly.",
          "Remove from oven, top with fresh basil leaves, drizzle with olive oil, and sprinkle with salt.",
          "Slice and serve immediately."
        ],
        cuisine: "Italian",
        mealType: "Dinner",
        dietaryOptions: ["Vegetarian"],
        createdBy: 1
      },
      {
        title: "Hearty Vegetable Soup",
        description: "Comforting vegetable soup packed with seasonal produce, herbs, and a rich vegetable broth.",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500",
        prepTime: 20,
        cookingTime: 40,
        servings: 6,
        ingredients: [
          "2 tbsp olive oil",
          "1 onion, diced",
          "2 carrots, diced",
          "2 celery stalks, diced",
          "3 cloves garlic, minced",
          "1 zucchini, diced",
          "1 cup green beans, trimmed and cut",
          "1 can (14 oz) diced tomatoes",
          "6 cups vegetable broth",
          "1 bay leaf",
          "1 tsp dried thyme",
          "1/4 cup fresh parsley, chopped",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Heat olive oil in a large pot over medium heat. Add onion, carrots, and celery, and sauté for 5 minutes until softened.",
          "Add garlic and cook for another minute until fragrant.",
          "Add zucchini and green beans, cook for 3 minutes.",
          "Pour in diced tomatoes and vegetable broth. Add bay leaf and thyme.",
          "Bring to a boil, then reduce heat and simmer for 30 minutes until vegetables are tender.",
          "Remove bay leaf, stir in fresh parsley, and season with salt and pepper.",
          "Serve hot with crusty bread if desired."
        ],
        cuisine: "American",
        mealType: "Dinner",
        dietaryOptions: ["Vegetarian", "Vegan", "Gluten-Free"],
        createdBy: 1
      },
      {
        title: "Fudgy Chocolate Brownies",
        description: "Rich and decadent chocolate brownies with a crackly top and gooey center. Perfect for chocolate lovers.",
        imageUrl: "https://images.unsplash.com/photo-1563897539064-7f6d36ef5a1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500",
        prepTime: 15,
        cookingTime: 25,
        servings: 12,
        ingredients: [
          "1/2 cup butter",
          "1 cup granulated sugar",
          "2 eggs",
          "1 tsp vanilla extract",
          "1/2 cup all-purpose flour",
          "1/2 cup unsweetened cocoa powder",
          "1/4 tsp salt",
          "1/2 cup chocolate chips"
        ],
        instructions: [
          "Preheat oven to 350°F (175°C). Line an 8x8 inch baking pan with parchment paper.",
          "Melt butter in a microwave-safe bowl. Add sugar and mix well.",
          "Beat in eggs one at a time, then stir in vanilla.",
          "In a separate bowl, combine flour, cocoa powder, and salt.",
          "Gradually add dry ingredients to the wet mixture, mixing just until combined.",
          "Fold in chocolate chips.",
          "Pour batter into the prepared pan and spread evenly.",
          "Bake for 25-30 minutes until a toothpick inserted comes out with a few moist crumbs.",
          "Allow to cool before cutting into squares."
        ],
        cuisine: "American",
        mealType: "Dessert",
        dietaryOptions: ["Vegetarian"],
        createdBy: 1
      },
      {
        title: "Quick Vegetable Stir Fry",
        description: "A lightning-fast weeknight dinner with fresh vegetables, tofu, and a savory sauce over steamed rice.",
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500",
        prepTime: 10,
        cookingTime: 15,
        servings: 4,
        ingredients: [
          "2 tbsp vegetable oil",
          "1 block (14 oz) firm tofu, cubed",
          "2 cloves garlic, minced",
          "1 tbsp ginger, grated",
          "1 red bell pepper, sliced",
          "1 carrot, julienned",
          "1 cup broccoli florets",
          "1 cup snap peas",
          "3 tbsp soy sauce",
          "1 tbsp rice vinegar",
          "1 tsp sesame oil",
          "1 tsp cornstarch mixed with 2 tbsp water",
          "Cooked rice for serving"
        ],
        instructions: [
          "Heat 1 tablespoon oil in a large wok or skillet over high heat. Add tofu and stir-fry until golden brown, about 5 minutes. Remove and set aside.",
          "Add remaining oil to the wok. Add garlic and ginger, stir-fry for 30 seconds until fragrant.",
          "Add bell pepper, carrot, broccoli, and snap peas. Stir-fry for 3-4 minutes until vegetables begin to soften but remain crisp.",
          "In a small bowl, mix soy sauce, rice vinegar, sesame oil, and cornstarch slurry.",
          "Return tofu to the wok, pour sauce over everything, and toss to coat.",
          "Cook for another 1-2 minutes until sauce thickens.",
          "Serve hot over steamed rice."
        ],
        cuisine: "Asian",
        mealType: "Dinner",
        dietaryOptions: ["Vegetarian", "Vegan"],
        createdBy: 1
      },
      {
        title: "Street-Style Tacos",
        description: "Authentic Mexican tacos with marinated meat, fresh cilantro, onions, and homemade salsa on corn tortillas.",
        imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500",
        prepTime: 20,
        cookingTime: 15,
        servings: 4,
        ingredients: [
          "1 lb flank steak, thinly sliced",
          "2 tbsp olive oil",
          "2 limes, juiced",
          "3 cloves garlic, minced",
          "1 tsp cumin",
          "1 tsp chili powder",
          "1/2 tsp paprika",
          "Salt and pepper to taste",
          "12 small corn tortillas",
          "1/2 cup white onion, finely diced",
          "1/2 cup fresh cilantro, chopped",
          "Lime wedges for serving",
          "Hot sauce or salsa"
        ],
        instructions: [
          "In a bowl, combine olive oil, lime juice, garlic, cumin, chili powder, paprika, salt, and pepper.",
          "Add sliced steak and marinate for at least 30 minutes.",
          "Heat a large skillet over high heat. Cook the marinated steak for 2-3 minutes per side until browned and cooked through.",
          "Warm tortillas in a dry skillet or directly over a gas flame until slightly charred.",
          "Fill each tortilla with steak, topped with diced onion and chopped cilantro.",
          "Serve with lime wedges and your favorite salsa or hot sauce."
        ],
        cuisine: "Mexican",
        mealType: "Dinner",
        dietaryOptions: ["Dairy-Free"],
        createdBy: 1
      }
    ];

    // Add default user
    this.users.set(1, {
      id: 1,
      username: "demo",
      password: "password"
    });
    this.userIdCounter = 2;

    // Add recipes
    sampleRecipes.forEach(recipe => {
      this.createRecipe(recipe);
    });
  }
}

export const storage = new MemStorage();
