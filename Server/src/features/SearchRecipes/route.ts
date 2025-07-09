import express from 'express';
import { searchRecipeController } from './controller';
const router = express.Router();

router.get('/search', (req, res) => {
  searchRecipeController(req, res).catch(err => {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  });
});


export default router;