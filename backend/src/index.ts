import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/database';
import { seed } from './seed';
import authRoutes from './routes/auth';
import hazardPointRoutes from './routes/hazardPoints';
import inspectionTaskRoutes from './routes/inspectionTasks';
import warningRoutes from './routes/warnings';
import dashboardRoutes from './routes/dashboard';
import thresholdRoutes from './routes/thresholds';
import userRoutes from './routes/users';
import './models';

const app = express();
const PORT = process.env.PORT || 6823;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/hazard-points', hazardPointRoutes);
app.use('/api/inspection-tasks', inspectionTaskRoutes);
app.use('/api/warnings', warningRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '地质灾害隐患点管理平台 API 运行正常' });
});

const startServer = async () => {
  await connectDB();
  await seed();
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API 健康检查: http://localhost:${PORT}/api/health`);
  });
};

startServer();
