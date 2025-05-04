import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recipeSearchSchema, insertRecipeSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";
import { z } from "zod";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "recipe-finder-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000 // 24 hours
      })
    })
  );

  // Authentication check middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/current", (req, res) => {
    if (!req.session.userId) {
      return res.json(null);
    }
    
    storage.getUser(req.session.userId).then(user => {
      if (!user) {
        return res.json(null);
      }
      res.json({ id: user.id, username: user.username });
    }).catch(() => {
      res.json(null);
    });
  });

  // Recipe routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const searchParams = recipeSearchSchema.parse({
        query: req.query.query,
        cuisine: req.query.cuisine,
        mealType: req.query.mealType,
        dietaryOption: req.query.dietaryOption,
        sort: req.query.sort
      });
      
      const recipes = await storage.searchRecipes(searchParams);
      res.json(recipes);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Check if favorite for current user
      let isFavorite = false;
      if (req.session.userId) {
        isFavorite = await storage.isFavorite(req.session.userId, id);
      }
      
      res.json({ ...recipe, isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes", requireAuth, async (req, res) => {
    try {
      const recipeData = insertRecipeSchema.parse({
        ...req.body,
        createdBy: req.session.userId
      });
      
      const recipe = await storage.createRecipe(recipeData);
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.put("/api/recipes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      if (recipe.createdBy !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this recipe" });
      }
      
      const recipeData = insertRecipeSchema.partial().parse(req.body);
      const updatedRecipe = await storage.updateRecipe(id, recipeData);
      
      res.json(updatedRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      if (recipe.createdBy !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this recipe" });
      }
      
      await storage.deleteRecipe(id);
      res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Favorite routes
  app.post("/api/favorites/:recipeId", requireAuth, async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const recipe = await storage.getRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      await storage.addToFavorites(req.session.userId, recipeId);
      res.json({ message: "Recipe added to favorites" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:recipeId", requireAuth, async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      await storage.removeFromFavorites(req.session.userId, recipeId);
      res.json({ message: "Recipe removed from favorites" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get("/api/favorites", requireAuth, async (req, res) => {
    try {
      const recipes = await storage.getFavorites(req.session.userId);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
