import { z } from 'zod';
import { RecipeIngredientSchema } from './RecipeIngredient';
import { SubRecipeSchema } from './SubRecipe';
import { InstructionSchema } from './Instruction';
import { title } from 'process';

export const RecipeSchema = z.object({
  id: z.string().uuid().nullable(),
  url: z.string().min(1),
  title: z.string().min(1),
  userId: z.string().uuid().nullable(),
  ingredients: z.array(RecipeIngredientSchema),
    subRecipes: z.array(SubRecipeSchema),
    instructions: z.array(InstructionSchema),
});

export type Recipe = z.infer<typeof RecipeSchema>;
