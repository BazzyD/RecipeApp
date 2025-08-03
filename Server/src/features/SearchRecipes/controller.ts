import express, { Request, Response } from 'express';
import { authenticateFirebase } from '../../shared/middleware/authenticationFirebase';

import { SearchRecipe } from './service';

const router = express.Router();

/**
 * Controller to search for recipes similar to a given recipeId.
 * Requires authentication and a valid recipeId query parameter.
 */
const searchRecipeController = async (req: Request, res: Response) => {

  const recipeId = req.query.recipeId as string;

  // Validate query parameter
  if (!recipeId?.trim()) {
    res.status(400).json({ error: 'Missing or invalid recipeId' });
    return;
  }

  // Fetch similar recipes from the database
  try {
    const result = await SearchRecipe(recipeId);
    res.status(200).json(result);

  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}

// Protected route: GET /api/search?recipeId=...
router.get('/search', authenticateFirebase, searchRecipeController);

export default router;
