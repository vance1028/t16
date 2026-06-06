import { Router, Response } from 'express';
import { HazardPoint, InspectionTask, Warning, InspectionRecord } from '../models';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Op, fn, col, literal } from 'sequelize';

const router = Router();

router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const totalPoints = await HazardPoint.count();
    const highRiskPoints = await HazardPoint.count({ where: { riskLevel: { [Op.in]: ['high', 'extreme'] } } });
    const activeWarnings = await Warning.count({ where: { status: { [Op.in]: ['pending', 'confirmed', 'responding'] } } });
    const pendingTasks = await InspectionTask.count({ where: { status: { [Op.in]: ['pending', 'in_progress'] } } });

    const riskLevelStats = await HazardPoint.findAll({
      attributes: ['riskLevel', [fn('COUNT', col('id')), 'count']],
      group: ['riskLevel']
    });

    const typeStats = await HazardPoint.findAll({
      attributes: ['type', [fn('COUNT', col('id')), 'count']],
      group: ['type']
    });

    const miningAreaStats = await HazardPoint.findAll({
      attributes: ['miningArea', [fn('COUNT', col('id')), 'count']],
      group: ['miningArea']
    });

    const allTasks = await InspectionTask.findAll();
    const now = new Date();
    let completedCount = 0;
    let totalCount = allTasks.length;

    for (const task of allTasks) {
      if (task.status === 'completed') {
        completedCount++;
      }
    }

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.json({
      totalPoints,
      highRiskPoints,
      activeWarnings,
      pendingTasks,
      completionRate,
      riskLevelStats,
      typeStats,
      miningAreaStats
    });
  } catch (error) {
    console.error('获取看板统计错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/hazard-points-map', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const points = await HazardPoint.findAll({
      attributes: ['id', 'code', 'name', 'type', 'latitude', 'longitude', 'riskLevel', 'miningArea']
    });
    res.json(points);
  } catch (error) {
    console.error('获取地图数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/recent-warnings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const warnings = await Warning.findAll({
      where: { status: { [Op.in]: ['pending', 'confirmed', 'responding'] } },
      include: [{ model: HazardPoint, as: 'hazardPoint' }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(warnings);
  } catch (error) {
    console.error('获取活跃预警错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/mining-area-completion', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await InspectionTask.findAll({
      include: [
        {
          model: HazardPoint,
          as: 'hazardPoints',
          attributes: ['miningArea']
        }
      ]
    });

    const areaStats: Record<string, { total: number; completed: number }> = {};

    for (const task of tasks) {
      const hazardPoints = await HazardPoint.findAll({
        where: { id: { [Op.in]: (task as any).hazardPointIds } }
      });

      for (const point of hazardPoints) {
        if (!areaStats[point.miningArea]) {
          areaStats[point.miningArea] = { total: 0, completed: 0 };
        }
        areaStats[point.miningArea].total++;
        if (task.status === 'completed') {
          areaStats[point.miningArea].completed++;
        }
      }
    }

    const result = Object.entries(areaStats).map(([area, stats]) => ({
      miningArea: area,
      total: stats.total,
      completed: stats.completed,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));

    res.json(result);
  } catch (error) {
    console.error('获取矿区完成率错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
