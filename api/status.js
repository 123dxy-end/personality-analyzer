export default async function handler(req, res) {
  global.tasks = global.tasks || {};
  const { method } = req;

  // 设置通用响应头
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (method === 'GET') {
    const { taskId } = req.query;
    const task = global.tasks[taskId];

    if (!task) {
      return res.status(404).json({
        status: 'not_found',
        message: '任务不存在，请返回首页重新提交。'
      });
    }

    return res.status(200).json({
      status: task.status,
      result: task.result || ''
    });
  }

  if (method === 'POST') {
    const { taskId, status, result } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ error: '缺少 taskId 或 status 参数' });
    }

    global.tasks[taskId] = {
      status,
      result: result || ''
    };

    return res.status(200).json({ message: '任务状态已更新' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('方法不被允许');
}
