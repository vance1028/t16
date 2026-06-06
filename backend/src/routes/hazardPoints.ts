import { Router, Response } from 'express';
import { HazardPoint, RiskLevelLog } from '../models';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { miningArea, riskLevel, type } = req.query;
    const where: any = {};

    if (miningArea) where.miningArea = miningArea;
    if (riskLevel) where.riskLevel = riskLevel;
    if (type) where.type = type;

    const points = await HazardPoint.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(points);
  } catch (error) {
    console.error('获取隐患点列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const point = await HazardPoint.findByPk(req.params.id, {
      include: [
        {
          model: RiskLevelLog,
          as: 'riskLevelLogs',
          include: [{ model: require('../models').default.User, as: 'operator', attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!point) {
      return res.status(404).json({ message: '隐患点不存在' });
    }

    res.json(point);
  } catch (error) {
    console.error('获取隐患点详情错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const point = await HazardPoint.create(req.body);
    res.status(201).json(point);
  } catch (error) {
    console.error('创建隐患点错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const point = await HazardPoint.findByPk(req.params.id);

    if (!point) {
      return res.status(404).json({ message: '隐患点不存在' });
    }

    await point.update(req.body);
    res.json(point);
  } catch (error) {
    console.error('更新隐患点错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/risk-level', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { newLevel, reason } = req.body;
    const point = await HazardPoint.findByPk(req.params.id);

    if (!point) {
      return res.status(404).json({ message: '隐患点不存在' });
    }

    const oldLevel = point.riskLevel;

    await RiskLevelLog.create({
      hazardPointId: point.id,
      oldLevel,
      newLevel,
      reason,
      operatorId: req.user!.id
    });

    await point.update({ riskLevel: newLevel });

    res.json({ message: '风险等级更新成功' });
  } catch (error) {
    console.error('更新风险等级错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const point = await HazardPoint.findByPk(req.params.id);

    if (!point) {
      return res.status(404).json({ message: '隐患点不存在' });
    }

    await point.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除隐患点错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
