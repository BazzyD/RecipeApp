import express from 'express';
import { getRecipeController } from './controller';
import { authenticateFirebase } from '../../shared/middleware/authenticationFirebase'
const router = express.Router();

router.get('/recipe', authenticateFirebase, async  (req, res) => {
  getRecipeController(req, res).catch(err => {
    console.log(err);
    res.status(500).json({ error: err.message });
  });
});


export default router;