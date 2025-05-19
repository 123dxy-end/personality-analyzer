export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('只允许 POST 方法');
  }

  global.tasks = global.tasks || {};
  const taskId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // 记录任务信息
  global.tasks[taskId] = {
    status: 'pending',
    result: '',
    data: req.body
  };

  // 日志确认传入的数据
  console.log('【任务已创建】Task ID:', taskId);
  console.log('【发送到 Make 的数据】', { ...req.body, taskId });

  // 立即返回 Task ID 给前端，方便跳转 loading.html
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ taskId });

  // 异步调用 Make Webhook 开始任务
  try {
    const response = await fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, taskId })
    });

    if (!response.ok) {
      console.error('【调用 Make Webhook 失败】状态码:', response.status);
      global.tasks[taskId].status = 'failed';
    } else {
      console.log('【调用 Make Webhook 成功】Task ID:', taskId);
    }
  } catch (e) {
    console.error('【Webhook 调用异常】:', e);
    if (global.tasks[taskId]) {
      global.tasks[taskId].status = 'failed';
    }
  }
}
