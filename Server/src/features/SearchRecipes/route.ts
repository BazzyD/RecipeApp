import express from 'express';
import { searchRecipeController } from './controller';
import { authenticateFirebase } from '../../shared/middleware/authenticationFirebase'

const router = express.Router();

router.get('/search', authenticateFirebase, (req, res) => {
  searchRecipeController(req, res).catch(err => {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  });
});


export default router;