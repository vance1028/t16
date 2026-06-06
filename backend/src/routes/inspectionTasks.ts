import { Router, Response } from 'express';
import { InspectionTask, InspectionRecord, HazardPoint, User } from '../models';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, inspectorId } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (req.user!.role === 'inspector') {
      where.inspectorId = req.user!.id;
    } else if (inspectorId) {
      where.inspectorId = inspectorId;
    }

    const tasks = await InspectionTask.findAll({
      where,
      include: [
        { model: User, as: 'inspector', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const now = new Date();
    for (const task of tasks) {
      if (task.status === 'pending' && new Date(task.deadline) < now) {
        await task.update({ status: 'overdue' });
        task.status = 'overdue';
      }
    }

    res.json(tasks);
  } catch (error) {
    console.error('获取巡查任务列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const task = await InspectionTask.findByPk(req.params.id, {
      include: [
        { model: User, as: 'inspector', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: InspectionRecord, as: 'records' }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: '巡查任务不存在' });
    }

    const hazardPoints = await HazardPoint.findAll({
      where: { id: { [Op.in]: task.hazardPointIds } }
    });

    res.json({ ...task.toJSON(), hazardPoints });
  } catch (error) {
    console.error('获取巡查任务详情错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const taskData = {
      ...req.body,
      createdById: req.user!.id,
      code: `TASK-${Date.now()}`
    };
    const task = await InspectionTask.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('创建巡查任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const task = await InspectionTask.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: '巡查任务不存在' });
    }

    await task.update(req.body);
    res.json(task);
  } catch (error) {
    console.error('更新巡查任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/:id/start', authenticateToken, requireRoles('inspector'), async (req: AuthRequest, res: Response) => {
  try {
    const task = await InspectionTask.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: '巡查任务不存在' });
    }

    if (task.inspectorId !== req.user!.id) {
      return res.status(403).json({ message: '无权操作此任务' });
    }

    await task.update({ status: 'in_progress' });
    res.json(task);
  } catch (error) {
    console.error('开始巡查任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/:id/submit-record', authenticateToken, requireRoles('inspector'), async (req: AuthRequest, res: Response) => {
  try {
    const task = await InspectionTask.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: '巡查任务不存在' });
    }

    if (task.inspectorId !== req.user!.id) {
      return res.status(403).json({ message: '无权操作此任务' });
    }

    const recordData = {
      ...req.body,
      taskId: task.id,
      inspectorId: req.user!.id,
      inspectionTime: new Date()
    };

    const record = await InspectionRecord.create(recordData);

    const existingRecords = await InspectionRecord.findAll({
      where: { taskId: task.id }
    });

    if (existingRecords.length >= task.hazardPointIds.length) {
      await task.update({ status: 'completed' });
    }

    res.status(201).json(record);
  } catch (error) {
    console.error('提交巡查记录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:id/records', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const records = await InspectionRecord.findAll({
      where: { taskId: req.params.id },
      include: [
        { model: HazardPoint, as: 'hazardPoint' },
        { model: User, as: 'inspector', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    console.error('获取巡查记录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
