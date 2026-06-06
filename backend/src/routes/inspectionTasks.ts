import { Router, Response } from 'express';
import { InspectionTask, InspectionRecord, HazardPoint, User, ThresholdConfig, RiskLevelLog, Warning } from '../models';
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

    const { hazardPointId, checkResults, overallConclusion } = req.body;

    if (!hazardPointId) {
      return res.status(400).json({ message: '请选择隐患点' });
    }
    if (!checkResults || !Array.isArray(checkResults) || checkResults.length === 0) {
      return res.status(400).json({ message: '请填写巡查项目检查结果' });
    }
    if (!overallConclusion) {
      return res.status(400).json({ message: '请填写总体结论' });
    }

    const hazardPoint = await HazardPoint.findByPk(hazardPointId);
    if (!hazardPoint) {
      return res.status(404).json({ message: '隐患点不存在' });
    }

    const recordData = {
      ...req.body,
      taskId: task.id,
      inspectorId: req.user!.id,
      inspectionTime: new Date(),
      triggeredUpgrade: false
    };

    const record = await InspectionRecord.create(recordData);

    const thresholds = await ThresholdConfig.findAll({
      where: { hazardType: hazardPoint.type }
    });

    let targetLevel: string | null = null;
    let triggerReason = '';
    const triggeredItems: string[] = [];

    for (const result of checkResults) {
      const matchingThreshold = thresholds.find(
        (t) => t.checkItem === result.item
      );

      if (matchingThreshold && result.isAbnormal) {
        triggeredItems.push(result.item);
        const levelOrder = ['low', 'medium', 'high', 'extreme'];
        const currentTargetIdx = targetLevel ? levelOrder.indexOf(targetLevel) : -1;
        const newTargetIdx = levelOrder.indexOf(matchingThreshold.targetLevel);
        if (newTargetIdx > currentTargetIdx) {
          targetLevel = matchingThreshold.targetLevel;
        }
      }
    }

    if (triggeredItems.length > 0) {
      triggerReason = `巡查发现以下项目异常：${triggeredItems.join('、')}，触发风险等级升级阈值`;
    }

    let upgraded = false;
    if (targetLevel) {
      const levelOrder = ['low', 'medium', 'high', 'extreme'];
      const currentLevelIdx = levelOrder.indexOf(hazardPoint.riskLevel);
      const targetLevelIdx = levelOrder.indexOf(targetLevel);

      if (targetLevelIdx > currentLevelIdx) {
        await RiskLevelLog.create({
          hazardPointId: hazardPoint.id,
          oldLevel: hazardPoint.riskLevel,
          newLevel: targetLevel,
          reason: triggerReason,
          operatorId: req.user!.id
        });

        await hazardPoint.update({ riskLevel: targetLevel });
        upgraded = true;

        await record.update({ triggeredUpgrade: true });

        if (targetLevel === 'high' || targetLevel === 'extreme') {
          const existingWarning = await Warning.findOne({
            where: {
              hazardPointId: hazardPoint.id,
              status: { [Op.in]: ['pending', 'confirmed', 'responding'] }
            }
          });

          if (existingWarning) {
            await existingWarning.update({
              riskLevel: targetLevel,
              triggerReason
            });
          } else {
            await Warning.create({
              code: `WARN-${Date.now()}`,
              hazardPointId: hazardPoint.id,
              riskLevel: targetLevel,
              triggerReason,
              status: 'pending'
            });
          }
        }
      }
    }

    const existingRecords = await InspectionRecord.findAll({
      where: { taskId: task.id }
    });

    if (existingRecords.length >= task.hazardPointIds.length) {
      await task.update({ status: 'completed' });
    }

    res.status(201).json({
      ...record.toJSON(),
      upgraded,
      newRiskLevel: upgraded ? targetLevel : null
    });
  } catch (error: any) {
    console.error('提交巡查记录错误:', error);
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((e: any) => e.message);
      return res.status(400).json({ message: '数据校验失败', errors });
    }
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
