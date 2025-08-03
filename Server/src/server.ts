/// <reference path="./types/express/user.d.ts" />

import express from 'express';
import cors from 'cors';

import uploadRoutes from './features/uploadRecipe/controller';
import searchRoutes from './features/SearchRecipes/controller';
import getRoutes from './features/GetRecipe/controller';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());

app.use(cors( {
  origin: 'http://localhost:3000', // allow frontend during local dev
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// API routes
app.use('/api', uploadRoutes); // Handles POST /api/upload
app.use('/api', searchRoutes); // Handles GET /api/search
app.use('/api', getRoutes); // Handles GET /api/get
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is reachable via ngrok!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
