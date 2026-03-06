import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Version Route
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Sustainable Climate Action API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      climate: '/api/climate-data',
      carbon: '/api/carbon-calculator'
    }
  });
});

// Climate Data Route
app.get('/api/climate-data', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        globalTemperatureIncrease: 1.1,
        co2Levels: 421.0,
        year: 2026,
        source: 'IPCC Report 2024',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch climate data' });
  }
});

// Carbon Calculator Route
app.post('/api/carbon-calculator', (req: Request, res: Response) => {
  try {
    const { energyUsage, transportMode, diet } = req.body;

    if (!energyUsage) {
      return res.status(400).json({ error: 'energyUsage is required' });
    }

    const carbonFootprint = {
      energy: energyUsage * 0.92,
      transport: transportMode === 'car' ? 2.3 : transportMode === 'bus' ? 0.09 : 0.12,
      diet: diet === 'meat' ? 6.5 : diet === 'vegetarian' ? 3.5 : 2.0,
    };

    const total = carbonFootprint.energy + carbonFootprint.transport + carbonFootprint.diet;

    res.json({
      success: true,
      carbonFootprint,
      totalDailyCO2e: total.toFixed(2),
      yearlyEstimate: (total * 365).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate carbon footprint' });
  }
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

// Error Handler
app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status((err as { status?: number }).status || 500).json({
    error: err.message || 'Internal Server Error',
    status: (err as { status?: number }).status || 500
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API documentation at http://localhost:${PORT}/api`);
  console.log(`Health check at http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down gracefully...');
  process.exit(0);
});

export default app;
