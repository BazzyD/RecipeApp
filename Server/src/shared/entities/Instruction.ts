import { z } from 'zod';

export const InstructionSchema = z.object({
  recipeId: z.string().uuid().nullable(),
  content: z.string().min(1),
    order: z.number().int().min(1),
});

export type instructionRecipe = z.infer<typeof InstructionSchema>;
