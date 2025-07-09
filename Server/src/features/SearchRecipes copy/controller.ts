import { Request, Response } from 'express';
import { GetRecipe } from './service';

export async function getRecipeController(req: Request, res: Response) {
  const recipeId = req.query.recipeId as string;

  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe indentifiction Error' });
  }


  try {
    const result = await GetRecipe(recipeId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
