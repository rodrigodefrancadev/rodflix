import express from 'express';
import cors from 'cors';
import { authRoutes } from './interfaces/routes/auth.routes';
import { catalogRoutes } from './interfaces/routes/catalog.routes';
import { adminRoutes } from './interfaces/routes/admin.routes';
import { watchedRoutes } from './interfaces/routes/watched.routes';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/watched', watchedRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Rodflix API is running' });
});

export { app }; // Export app for testing

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
