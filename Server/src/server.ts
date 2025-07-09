/// <reference path="./types/express/user.d.ts" />

import express from 'express';
import uploadRoutes from './features/uploadRecipe/route';
import searchRoutes from './features/SearchRecipes/route';
import getRoutes from './features/GetRecipe/route';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api', uploadRoutes); // api/upload
app.use('/api', searchRoutes); // api/search
app.use('/api', getRoutes); // api/get

app.listen(3000, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
