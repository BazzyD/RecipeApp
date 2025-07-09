import express from 'express';
import { getRecipeController } from './controller';
const router = express.Router();

router.get('/recipe', (req, res) => {
  getRecipeController(req, res).catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
});


export default router;