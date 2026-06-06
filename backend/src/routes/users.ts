import { Router, Response } from 'express';
import { User } from '../models';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    const where: any = {};

    if (role) where.role = role;

    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'name', 'role', 'phone', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/inspectors', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const inspectors = await User.findAll({
      where: { role: 'inspector' },
      attributes: ['id', 'username', 'name', 'phone']
    });

    res.json(inspectors);
  } catch (error) {
    console.error('获取巡查员列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.create(req.body);
    const result = user.toJSON();
    delete (result as any).password;
    res.status(201).json(result);
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const updateData: any = { ...req.body };
    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    await user.update(updateData);
    const result = user.toJSON();
    delete (result as any).password;
    res.json(result);
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
