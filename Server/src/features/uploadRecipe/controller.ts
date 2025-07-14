import { Request, Response } from 'express';
import { uploadRecipe } from './service';

export async function uploadRecipeController(req: Request, res: Response) {
  const { url } = req.body;

  if (!url) {
    throw new Error('Missing URL' );
  }

  const userId = req.user?.uid ?? null;

    const result = await uploadRecipe(url, userId);
    return res.status(200).json(result);
}
