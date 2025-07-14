import express from 'express';
import { uploadRecipeController } from './controller';
import { authenticateFirebase } from '../../shared/middleware/authenticationFirebase'
const router = express.Router();

router.post('/upload', authenticateFirebase,(req, res) => {
  uploadRecipeController(req, res).catch(err => {
    console.error(err);
    res.status(500).json({ error: err.message });
  });
});


export default router;