import express, { Request, Response } from 'express';
import { authenticateFirebase } from '../../shared/middleware/authenticationFirebase';

import { GetRecipe } from './service';

const router = express.Router();

/**
 * Controller to get a recipe by its ID from the database.
 * Requires authentication and a valid recipeId query parameter.
 */
const getRecipeController = async (req: Request, res: Response) => {
  
  const recipeId = req.query.recipeId as string;

  // Validate query parameter
  if (!recipeId?.trim()) {
     res.status(400).json({ error: 'Missing or invalid recipeId' });
     return;
  }
  
// Fetch recipe from database
  try {
    const result = await GetRecipe(recipeId);
    res.status(200).json(result);

  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

// Protected route: GET /api/recipe?recipeId=...
router.get('/recipe', authenticateFirebase, getRecipeController);

export default router;
