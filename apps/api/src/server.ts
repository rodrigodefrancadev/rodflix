import express from 'express';
import cors from 'cors';
import { authRoutes } from './interfaces/routes/auth.routes';
import { catalogRoutes } from './interfaces/routes/catalog.routes';
import { adminRoutes } from './interfaces/routes/admin.routes';
import { watchedRoutes } from './interfaces/routes/watched.routes';
import { ratingRoutes } from './interfaces/routes/rating.routes';
import { socialRoutes } from './interfaces/routes/social.routes';
import { notificationRoutes } from './interfaces/routes/notification.routes';
import { prisma } from './infrastructure/prisma';

const app = express();
const PORT = process.env.PORT || 3333;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

const healthCheck = async (req: express.Request, res: express.Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      message: 'Rodflix API is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'Error', 
      message: 'Rodflix API is running but database is unreachable',
      database: 'Disconnected',
      timestamp: new Date().toISOString()
    });
  }
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/watched', watchedRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);

export { app }; // Export app for testing

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
