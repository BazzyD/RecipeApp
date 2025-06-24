import { Request, Response } from 'express';
import { uploadRecipe } from './service';

export async function uploadRecipeController(req: Request, res: Response) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  const userId = req.user?.uid ?? null;

  try {
    const result = await uploadRecipe(url, userId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
