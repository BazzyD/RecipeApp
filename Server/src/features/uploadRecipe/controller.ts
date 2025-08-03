import express, { Request, Response } from 'express';
import { authenticateFirebase } from '../../shared/middleware/authenticationFirebase';

import { uploadRecipe } from './service';

const router = express.Router();

/**
 * Controller to handle uploading a recipe by URL.
 * Requires user authentication and a valid URL in the request body.
 */
const uploadRecipeController = async (req: Request, res : Response) => {
  const { url } = req.body;

  // Validate body parameter
    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({ error: 'Missing or invalid URL' });
      return;
    }
  try {

    const userId = req.user?.uid ?? null;
    
    // Delegate recipe upload logic to service
    const recipe = await uploadRecipe(url, userId);
    res.status(200).json(recipe);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}

// Protected route: POST /api/upload
router.post('/upload', authenticateFirebase, uploadRecipeController)

export default router;
