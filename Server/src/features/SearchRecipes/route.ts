import express from 'express';
import { searchRecipeController } from './controller';
const router = express.Router();

router.get('/search', (req, res) => {
  searchRecipeController(req, res).catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
});


export default router;