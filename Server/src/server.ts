import express from 'express';
import uploadRoutes from './features/uploadRecipe/route';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api', uploadRoutes); // routes under /api/upload

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
