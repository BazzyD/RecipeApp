import { z } from 'zod';

export const SubRecipeIngredientSchema = z.object({
  subRecipeId: z.string().uuid(),
  ingredientId: z.string().uuid(),
  amount: z.string().nullable(),
  unit: z.string().nullable(),
  name: z.string().min(1),
  order: z.number().int().min(1),
});

export type SubRecipeIngredient = z.infer<typeof SubRecipeIngredientSchema>;
