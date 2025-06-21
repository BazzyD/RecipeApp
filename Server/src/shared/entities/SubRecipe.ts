import { z } from 'zod';
import { RecipeIngredientSchema } from './RecipeIngredient';

export const SubRecipeSchema = z.object({
  id: z.string().uuid().nullable(),
  recipeId: z.string().nullable(),
  name: z.string().min(1),
  ingredients: z.array(RecipeIngredientSchema),
  order: z.number().int().min(1),
});

export type SubRecipe = z.infer<typeof SubRecipeSchema>;
