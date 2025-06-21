import express from 'express';
import { uploadRecipeController } from './controller';

const router = express.Router();

router.post('/upload', (req, res) => {
  uploadRecipeController(req, res).catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
});


export default router;