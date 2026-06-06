import { connectDB, sequelize } from './config/database';
import {
  User,
  HazardPoint,
  InspectionTask,
  InspectionRecord,
  Warning,
  ThresholdConfig,
  RiskLevelLog
} from './models';
import bcrypt from 'bcryptjs';

export const seed = async () => {
  try {
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('数据库已存在数据，跳过种子数据初始化');
      return;
    }

    console.log('开始创建种子数据...');

    console.log('开始创建用户...');

    const admin = await User.create({
      username: 'admin',
      password: '123456',
      name: '系统管理员',
      role: 'admin',
      phone: '13800138000'
    });

    const inspector = await User.create({
      username: 'inspector',
      password: '123456',
      name: '张三（巡查员）',
      role: 'inspector',
      phone: '13800138001'
    });

    const inspector2 = await User.create({
      username: 'inspector2',
      password: '123456',
      name: '李四（巡查员）',
      role: 'inspector',
      phone: '13800138002'
    });

    const monitor = await User.create({
      username: 'monitor',
      password: '123456',
      name: '王五（值班员）',
      role: 'monitor',
      phone: '13800138003'
    });

    console.log('用户创建完成');

    console.log('开始创建隐患点...');
    const hazardPointsData = [
      {
        code: 'HZD-001',
        name: '东山矿区1号滑坡点',
        type: 'landslide' as const,
        latitude: 34.756789,
        longitude: 113.654321,
        miningArea: '东山矿区',
        threatTarget: 'mine_tunnel' as const,
        riskLevel: 'high' as const,
        description: '位于东山矿区南坡，坡度约35度，岩体破碎，有明显滑动迹象',
        historicalRecords: '2020年8月发生小型滑坡，造成矿区道路中断；2022年雨季出现裂缝扩展'
      },
      {
        code: 'HZD-002',
        name: '东山矿区2号崩塌点',
        type: 'collapse' as const,
        latitude: 34.758901,
        longitude: 113.656789,
        miningArea: '东山矿区',
        threatTarget: 'highway' as const,
        riskLevel: 'extreme' as const,
        description: '陡峭岩壁，节理发育，近期有零星落石',
        historicalRecords: '2019年发生重大崩塌，砸毁运输车1辆；2023年监测到岩体位移加速'
      },
      {
        code: 'HZD-003',
        name: '西山矿区1号泥石流沟',
        type: 'debris_flow' as const,
        latitude: 34.723456,
        longitude: 113.612345,
        miningArea: '西山矿区',
        threatTarget: 'residential_area' as const,
        riskLevel: 'high' as const,
        description: '沟口有居民区，沟内松散堆积物丰富，暴雨期易发生泥石流',
        historicalRecords: '2010年、2016年、2021年均发生泥石流，造成房屋损毁'
      },
      {
        code: 'HZD-004',
        name: '西山矿区2号地面塌陷区',
        type: 'subsidence' as const,
        latitude: 34.725678,
        longitude: 113.615678,
        miningArea: '西山矿区',
        threatTarget: 'mine_tunnel' as const,
        riskLevel: 'medium' as const,
        description: '采空区上方地面出现裂缝，沉降速率约5mm/月',
        historicalRecords: '2022年首次发现沉降，已设置监测桩'
      },
      {
        code: 'HZD-005',
        name: '南山矿区1号滑坡点',
        type: 'landslide' as const,
        latitude: 34.698765,
        longitude: 113.687654,
        miningArea: '南山矿区',
        threatTarget: 'highway' as const,
        riskLevel: 'medium' as const,
        description: '边坡稳定性较差，雨季需重点关注',
        historicalRecords: '2021年雨季出现表层滑塌'
      },
      {
        code: 'HZD-006',
        name: '南山矿区2号崩塌点',
        type: 'collapse' as const,
        latitude: 34.701234,
        longitude: 113.690123,
        miningArea: '南山矿区',
        threatTarget: 'mine_tunnel' as const,
        riskLevel: 'low' as const,
        description: '危岩带，已进行初步加固处理',
        historicalRecords: '无重大灾情记录'
      },
      {
        code: 'HZD-007',
        name: '东山矿区3号泥石流沟',
        type: 'debris_flow' as const,
        latitude: 34.761234,
        longitude: 113.661234,
        miningArea: '东山矿区',
        threatTarget: 'highway' as const,
        riskLevel: 'medium' as const,
        description: '沟域面积较大，汇水条件好',
        historicalRecords: '2018年发生小型泥石流'
      },
      {
        code: 'HZD-008',
        name: '西山矿区3号滑坡点',
        type: 'landslide' as const,
        latitude: 34.728901,
        longitude: 113.618901,
        miningArea: '西山矿区',
        threatTarget: 'residential_area' as const,
        riskLevel: 'low' as const,
        description: '古滑坡体，目前处于稳定状态',
        historicalRecords: '1998年发生滑坡，后经治理'
      },
      {
        code: 'HZD-009',
        name: '南山矿区3号地面塌陷区',
        type: 'subsidence' as const,
        latitude: 34.703456,
        longitude: 113.693456,
        miningArea: '南山矿区',
        threatTarget: 'mine_tunnel' as const,
        riskLevel: 'high' as const,
        description: '深部开采导致的地面沉降，影响范围约2000平方米',
        historicalRecords: '2023年发现塌陷坑3个，最大直径约5米'
      },
      {
        code: 'HZD-010',
        name: '东山矿区4号崩塌点',
        type: 'collapse' as const,
        latitude: 34.763456,
        longitude: 113.665432,
        miningArea: '东山矿区',
        threatTarget: 'highway' as const,
        riskLevel: 'low' as const,
        description: '小型危岩体，已设置防护网',
        historicalRecords: '无重大灾情'
      },
      {
        code: 'HZD-011',
        name: '南山矿区4号泥石流沟',
        type: 'debris_flow' as const,
        latitude: 34.706789,
        longitude: 113.696789,
        miningArea: '南山矿区',
        threatTarget: 'mine_tunnel' as const,
        riskLevel: 'extreme' as const,
        description: '沟口紧邻主巷道入口，泥石流风险极高',
        historicalRecords: '2005年、2015年、2023年三次大型泥石流，均造成矿井入口堵塞'
      },
      {
        code: 'HZD-012',
        name: '西山矿区4号滑坡点',
        type: 'landslide' as const,
        latitude: 34.731234,
        longitude: 113.623456,
        miningArea: '西山矿区',
        threatTarget: 'residential_area' as const,
        riskLevel: 'medium' as const,
        description: '村后边坡，居民约50户受威胁',
        historicalRecords: '2020年出现裂缝扩展，已转移部分群众'
      }
    ];

    const hazardPoints = await HazardPoint.bulkCreate(hazardPointsData);
    console.log(`创建了 ${hazardPoints.length} 个隐患点`);

    console.log('开始创建阈值配置...');
    const thresholdsData = [
      { hazardType: 'landslide' as const, checkItem: '裂缝宽度变化率', thresholdValue: '5', unit: 'mm/天', targetLevel: 'high' as const, description: '裂缝日变化超过5mm需升级' },
      { hazardType: 'landslide' as const, checkItem: '裂缝宽度变化率', thresholdValue: '10', unit: 'mm/天', targetLevel: 'extreme' as const, description: '裂缝日变化超过10mm需升级至极高' },
      { hazardType: 'landslide' as const, checkItem: '位移量', thresholdValue: '50', unit: 'mm', targetLevel: 'high' as const, description: '累计位移超过50mm需升级' },
      { hazardType: 'collapse' as const, checkItem: '落石频次', thresholdValue: '3', unit: '次/天', targetLevel: 'high' as const, description: '日落石超过3次需升级' },
      { hazardType: 'collapse' as const, checkItem: '落石频次', thresholdValue: '10', unit: '次/天', targetLevel: 'extreme' as const, description: '日落石超过10次需升级至极高' },
      { hazardType: 'collapse' as const, checkItem: '岩体裂缝宽度', thresholdValue: '20', unit: 'cm', targetLevel: 'high' as const, description: '裂缝宽度超过20cm需升级' },
      { hazardType: 'debris_flow' as const, checkItem: '降雨量', thresholdValue: '50', unit: 'mm/小时', targetLevel: 'high' as const, description: '小时降雨量超过50mm需升级' },
      { hazardType: 'debris_flow' as const, checkItem: '沟谷水位上涨', thresholdValue: '1', unit: 'm/小时', targetLevel: 'high' as const, description: '水位上涨超过1m/小时需升级' },
      { hazardType: 'debris_flow' as const, checkItem: '泥石流前兆声响', thresholdValue: '1', unit: '是/否', targetLevel: 'extreme' as const, description: '听到泥石流轰鸣声立即升级' },
      { hazardType: 'subsidence' as const, checkItem: '沉降速率', thresholdValue: '10', unit: 'mm/月', targetLevel: 'high' as const, description: '月沉降超过10mm需升级' },
      { hazardType: 'subsidence' as const, checkItem: '塌陷坑直径', thresholdValue: '3', unit: 'm', targetLevel: 'high' as const, description: '塌陷坑直径超过3m需升级' },
      { hazardType: 'subsidence' as const, checkItem: '地表裂缝宽度', thresholdValue: '10', unit: 'cm', targetLevel: 'high' as const, description: '地表裂缝宽度超过10cm需升级' }
    ];

    await ThresholdConfig.bulkCreate(thresholdsData);
    console.log('阈值配置创建完成');

    console.log('开始创建巡查任务...');
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dayBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasksData = [
      {
        code: 'TASK-20240601-001',
        title: '东山矿区高风险点每日巡查',
        inspectorId: inspector.id,
        hazardPointIds: [hazardPoints[0].id, hazardPoints[1].id, hazardPoints[6].id],
        checkItems: ['裂缝宽度测量', '位移监测', '渗水情况检查', '周边环境变化', '照片记录'],
        deadline: yesterday,
        status: 'overdue' as const,
        frequency: '每日',
        createdById: admin.id,
        remark: '高风险点，必须每日巡查'
      },
      {
        code: 'TASK-20240605-001',
        title: '西山矿区高风险点巡查',
        inspectorId: inspector.id,
        hazardPointIds: [hazardPoints[2].id, hazardPoints[3].id],
        checkItems: ['沟口堆积物观察', '水位监测', '沉降点测量', '照片记录'],
        deadline: tomorrow,
        status: 'pending' as const,
        frequency: '每周',
        createdById: admin.id,
        remark: '暴雨后重点巡查'
      },
      {
        code: 'TASK-20240603-001',
        title: '南山矿区常规巡查',
        inspectorId: inspector2.id,
        hazardPointIds: [hazardPoints[4].id, hazardPoints[5].id, hazardPoints[8].id],
        checkItems: ['边坡稳定性观察', '落石记录', '沉降监测', '照片记录'],
        deadline: dayBefore,
        status: 'completed' as const,
        frequency: '每周',
        createdById: admin.id,
        remark: '常规巡查任务'
      },
      {
        code: 'TASK-20240606-001',
        title: '东山矿区极高风险点专项巡查',
        inspectorId: inspector2.id,
        hazardPointIds: [hazardPoints[1].id],
        checkItems: ['危岩体详细检查', '落石统计', '防护设施检查', '裂缝测量', '多角度拍照'],
        deadline: tomorrow,
        status: 'in_progress' as const,
        frequency: '每日',
        createdById: admin.id,
        remark: 'HZD-002风险极高，需重点关注'
      },
      {
        code: 'TASK-20240606-002',
        title: '全矿区低风险点周巡',
        inspectorId: inspector.id,
        hazardPointIds: [hazardPoints[5].id, hazardPoints[7].id, hazardPoints[9].id],
        checkItems: ['整体外观观察', '有无新变化', '照片记录'],
        deadline: nextWeek,
        status: 'pending' as const,
        frequency: '每周',
        createdById: admin.id,
        remark: '低风险点每周巡查一次即可'
      }
    ];

    const tasks = await InspectionTask.bulkCreate(tasksData);
    console.log(`创建了 ${tasks.length} 个巡查任务`);

    console.log('开始创建巡查记录...');
    const recordsData = [
      {
        taskId: tasks[2].id,
        hazardPointId: hazardPoints[4].id,
        inspectorId: inspector2.id,
        checkResults: [
          { item: '边坡稳定性观察', value: '无明显变化', isAbnormal: false },
          { item: '落石记录', value: '0次', isAbnormal: false },
          { item: '沉降监测', value: '2mm', isAbnormal: false }
        ],
        photos: ['/uploads/hzd-005-1.jpg', '/uploads/hzd-005-2.jpg'],
        overallConclusion: '整体稳定，无异常情况',
        weatherCondition: '晴',
        inspectionTime: dayBefore,
        triggeredUpgrade: false
      },
      {
        taskId: tasks[2].id,
        hazardPointId: hazardPoints[5].id,
        inspectorId: inspector2.id,
        checkResults: [
          { item: '边坡稳定性观察', value: '稳定', isAbnormal: false },
          { item: '落石记录', value: '1小块', isAbnormal: false },
          { item: '沉降监测', value: '无', isAbnormal: false }
        ],
        photos: ['/uploads/hzd-006-1.jpg'],
        overallConclusion: '防护网完好，情况正常',
        weatherCondition: '晴',
        inspectionTime: dayBefore,
        triggeredUpgrade: false
      },
      {
        taskId: tasks[2].id,
        hazardPointId: hazardPoints[8].id,
        inspectorId: inspector2.id,
        checkResults: [
          { item: '边坡稳定性观察', value: '发现新裂缝', isAbnormal: true },
          { item: '落石记录', value: '5次', isAbnormal: true },
          { item: '沉降监测', value: '15mm', isAbnormal: true }
        ],
        photos: ['/uploads/hzd-009-1.jpg', '/uploads/hzd-009-2.jpg', '/uploads/hzd-009-3.jpg'],
        overallConclusion: '情况异常，发现新塌陷坑，建议升级风险等级',
        weatherCondition: '多云有小雨',
        inspectionTime: dayBefore,
        triggeredUpgrade: true
      }
    ];

    await InspectionRecord.bulkCreate(recordsData);
    console.log('巡查记录创建完成');

    console.log('开始创建风险等级变更记录...');
    await RiskLevelLog.create({
      hazardPointId: hazardPoints[8].id,
      oldLevel: 'medium',
      newLevel: 'high',
      reason: '巡查发现新塌陷坑，沉降速率加快，落石频次增加',
      operatorId: admin.id,
      createdAt: dayBefore
    });
    console.log('风险等级变更记录创建完成');

    console.log('开始创建预警...');
    const warningsData = [
      {
        code: 'WARN-20240603-001',
        hazardPointId: hazardPoints[8].id,
        riskLevel: 'high' as const,
        triggerReason: '巡查发现新塌陷坑，沉降速率达到15mm/月，超过阈值',
        status: 'responding' as const,
        confirmedById: monitor.id,
        confirmedAt: dayBefore,
        responseActions: ['road_closure' as const, 'warning_set' as const],
        responseDescription: '已封锁塌陷区周边道路，设置警戒标志，通知矿区安全部门加强监测',
        responderId: monitor.id
      },
      {
        code: 'WARN-20240605-001',
        hazardPointId: hazardPoints[1].id,
        riskLevel: 'extreme' as const,
        triggerReason: '连续监测显示危岩体位移加速，落石频次明显增加',
        status: 'pending' as const
      },
      {
        code: 'WARN-20240520-001',
        hazardPointId: hazardPoints[2].id,
        riskLevel: 'high' as const,
        triggerReason: '暴雨天气，小时降雨量达到60mm，超过阈值',
        status: 'closed' as const,
        confirmedById: monitor.id,
        confirmedAt: new Date('2024-05-20'),
        responseActions: ['evacuation' as const, 'road_closure' as const],
        responseDescription: '紧急转移沟口居民30户，封锁进入沟谷道路',
        responderId: monitor.id,
        closedAt: new Date('2024-05-22'),
        closeRemark: '暴雨结束，泥石流未发生，居民已返回，解除预警'
      },
      {
        code: 'WARN-20240601-001',
        hazardPointId: hazardPoints[10].id,
        riskLevel: 'extreme' as const,
        triggerReason: '气象预报有大暴雨，泥石流风险极高',
        status: 'confirmed' as const,
        confirmedById: monitor.id,
        confirmedAt: new Date('2024-06-01')
      }
    ];

    await Warning.bulkCreate(warningsData);
    console.log('预警创建完成');

    console.log('');
    console.log('========================================');
    console.log('种子数据创建完成！');
    console.log('========================================');
    console.log('');
    console.log('测试账号：');
    console.log('  管理员: admin / 123456');
    console.log('  巡查员: inspector / 123456');
    console.log('  巡查员2: inspector2 / 123456');
    console.log('  值班员: monitor / 123456');
    console.log('');
    console.log('数据统计：');
    console.log(`  用户: 4个`);
    console.log(`  隐患点: ${hazardPoints.length}个`);
    console.log(`  巡查任务: ${tasks.length}个（含待巡、进行中、已完成、超期）`);
    console.log(`  巡查记录: 3条`);
    console.log(`  预警: 4条（活跃2条，历史2条）`);
    console.log(`  阈值配置: 12条`);
    console.log('');

    console.log('种子数据初始化完成！');
  } catch (error) {
    console.error('种子数据创建失败:', error);
  }
};

if (require.main === module) {
  seed();
}
