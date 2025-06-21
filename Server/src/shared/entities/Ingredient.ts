import { z } from 'zod';

export const IngredientSchema = z.object({
  id: z.string().uuid().min(1),
  name: z.string().min(1),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
