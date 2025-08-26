import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hola mundo' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
