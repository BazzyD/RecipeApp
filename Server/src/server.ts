/// <reference path="./types/express/user.d.ts" />

import express from 'express';
import uploadRoutes from './features/uploadRecipe/route';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api', uploadRoutes); // api/upload

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
