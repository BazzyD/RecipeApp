import express from 'express';
import { uploadRecipeController } from './controller';
import { authenticateFirebase } from '../../shared/middleware/authenticationFirebase'
const router = express.Router();

router.post('/upload', authenticateFirebase, async (req, res) => {
  console.log('Incoming request to /api/upload');
    console.log('Query:', req.query);
    console.log('Headers:', req.headers);
  console.log('Body:', req.body);
    const recipeId = req.body.url as string;
    if (!recipeId) {
      throw new Error('Missing recipeId');
    }
  console.log('recipeId:', recipeId);
  uploadRecipeController(req, res).catch(err => {
    console.log(err);
    res.status(500).json({ error: err.message });
  });
});


export default router;