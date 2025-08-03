import { z } from 'zod';

// ------------------------
// Zod Type Inference
// ------------------------
// These types are inferred from the zod schemas below
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Instruction = z.infer<typeof InstructionSchema>;
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type SubRecipe = z.infer<typeof SubRecipeSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;

// ------------------------
// Ingredient Schema
// ------------------------
// Represents a base ingredient in the global ingredient list
export const IngredientSchema = z.object({
  id: z.string().uuid().min(1),       // unique identifier
  name: z.string().min(1),            // ingredient name (e.g., "Flour")
});
// ------------------------
// Instruction Schema
// ------------------------
// Represents a cooking instruction with a specific order in the recipe
export const InstructionSchema = z.object({
  recipeId: z.string().uuid().nullable(), // associated recipe ID
  content: z.string().min(1),             // the actual instruction text
  order: z.number().int().min(1),         // step number in the recipe
});

// ------------------------
// RecipeIngredient Schema
// ------------------------
// Represents a specific usage of an ingredient in a recipe or sub-recipe
export const RecipeIngredientSchema = z.object({
  recipeId: z.string().uuid().nullable(),     // optional reference to parent recipe
  ingredientId: z.string().uuid().nullable(), // reference to IngredientSchema
  amount: z.string().nullable(),              // e.g., "2"
  unit: z.string().nullable(),                // e.g., "cups"
  name: z.string().min(1),                    // resolved name of ingredient
});

// ------------------------
// SubRecipe Schema
// ------------------------
// A nested recipe (e.g., dough, sauce) with its own ingredients
export const SubRecipeSchema = z.object({
  id: z.string().uuid().nullable(),                   // subrecipe ID
  recipeId: z.string().nullable(),                    // parent recipe ID
  name: z.string().min(1),                            // name of the sub-recipe
  ingredients: z.array(RecipeIngredientSchema),       // ingredients used in sub-recipe
});

// ------------------------
// Recipe Schema
// ------------------------
// Full recipe model including ingredients, sub-recipes, and instructions
export const RecipeSchema = z.object({
  id: z.string().uuid().nullable().optional(),        // Firestore ID (optional)
  url: z.string().min(1),                             // source URL
  title: z.string().min(1),                           // recipe title
  userId: z.string().uuid().nullable(),               // uploader ID
  ingredients: z.array(RecipeIngredientSchema),       // top-level ingredients
  subRecipes: z.array(SubRecipeSchema),               // list of sub-recipes
  instructions: z.array(InstructionSchema),           // ordered steps
  image: z.string().nullable().optional(),            // optional image URL
});