import { Router, Response } from 'express';
import { Warning, HazardPoint, User } from '../models';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, hazardPointId } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (hazardPointId) where.hazardPointId = hazardPointId;

    const warnings = await Warning.findAll({
      where,
      include: [
        { model: HazardPoint, as: 'hazardPoint' },
        { model: User, as: 'confirmer', attributes: ['id', 'name'] },
        { model: User, as: 'responder', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(warnings);
  } catch (error) {
    console.error('获取预警列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const warning = await Warning.findByPk(req.params.id, {
      include: [
        { model: HazardPoint, as: 'hazardPoint' },
        { model: User, as: 'confirmer', attributes: ['id', 'name'] },
        { model: User, as: 'responder', attributes: ['id', 'name'] }
      ]
    });

    if (!warning) {
      return res.status(404).json({ message: '预警不存在' });
    }

    res.json(warning);
  } catch (error) {
    console.error('获取预警详情错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/confirm', authenticateToken, requireRoles('monitor'), async (req: AuthRequest, res: Response) => {
  try {
    const warning = await Warning.findByPk(req.params.id);

    if (!warning) {
      return res.status(404).json({ message: '预警不存在' });
    }

    await warning.update({
      status: 'confirmed',
      confirmedById: req.user!.id,
      confirmedAt: new Date()
    });

    res.json(warning);
  } catch (error) {
    console.error('确认预警错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/start-response', authenticateToken, requireRoles('monitor'), async (req: AuthRequest, res: Response) => {
  try {
    const { responseActions, responseDescription } = req.body;
    const warning = await Warning.findByPk(req.params.id);

    if (!warning) {
      return res.status(404).json({ message: '预警不存在' });
    }

    await warning.update({
      status: 'responding',
      responseActions,
      responseDescription,
      responderId: req.user!.id
    });

    res.json(warning);
  } catch (error) {
    console.error('启动应急响应错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/close', authenticateToken, requireRoles('monitor'), async (req: AuthRequest, res: Response) => {
  try {
    const { closeRemark } = req.body;
    const warning = await Warning.findByPk(req.params.id);

    if (!warning) {
      return res.status(404).json({ message: '预警不存在' });
    }

    await warning.update({
      status: 'closed',
      closedAt: new Date(),
      closeRemark
    });

    res.json(warning);
  } catch (error) {
    console.error('关闭预警错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/generate', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { hazardPointId, riskLevel, triggerReason } = req.body;

    const existingWarning = await Warning.findOne({
      where: {
        hazardPointId,
        status: { [Op.in]: ['pending', 'confirmed', 'responding'] }
      }
    });

    if (existingWarning) {
      await existingWarning.update({ riskLevel, triggerReason });
      return res.json(existingWarning);
    }

    const warning = await Warning.create({
      code: `WARN-${Date.now()}`,
      hazardPointId,
      riskLevel,
      triggerReason,
      status: 'pending'
    });

    res.status(201).json(warning);
  } catch (error) {
    console.error('生成预警错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
