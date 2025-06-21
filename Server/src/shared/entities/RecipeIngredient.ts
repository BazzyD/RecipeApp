import { z } from 'zod';

export const RecipeIngredientSchema = z.object({
  recipeId: z.string().uuid().nullable(),
  ingredientId: z.string().uuid().nullable(),
  amount: z.string().nullable(),
  unit: z.string().nullable(),
  name: z.string().min(1),
  order: z.number().int().min(1),
});

export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
