import { Router, Response } from 'express';
import { ThresholdConfig } from '../models';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { hazardType } = req.query;
    const where: any = {};

    if (hazardType) where.hazardType = hazardType;

    const thresholds = await ThresholdConfig.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(thresholds);
  } catch (error) {
    console.error('获取阈值配置错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const threshold = await ThresholdConfig.create(req.body);
    res.status(201).json(threshold);
  } catch (error) {
    console.error('创建阈值配置错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const threshold = await ThresholdConfig.findByPk(req.params.id);

    if (!threshold) {
      return res.status(404).json({ message: '阈值配置不存在' });
    }

    await threshold.update(req.body);
    res.json(threshold);
  } catch (error) {
    console.error('更新阈值配置错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const threshold = await ThresholdConfig.findByPk(req.params.id);

    if (!threshold) {
      return res.status(404).json({ message: '阈值配置不存在' });
    }

    await threshold.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除阈值配置错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
