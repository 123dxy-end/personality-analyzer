export default async function handler(req, res) {
  global.tasks = global.tasks || {};
  const { method } = req;

  // 设置通用响应头
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (method === 'GET') {
    const { taskId } = req.query;
    if (!taskId) {
      return res.status(400).json({ error: '缺少 taskId 参数' });
    }

    const task = global.tasks[taskId];

    if (!task) {
      console.warn(`【状态查询】未找到任务: ${taskId}`);
      return res.status(404).json({
        status: 'not_found',
        message: '任务不存在，请返回首页重新提交。'
      });
    }

    console.log(`【状态查询】TaskID: ${taskId} 状态: ${task.status}`);
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

    console.log(`【状态更新】TaskID: ${taskId} 状态更新为: ${status}`);
    return res.status(200).json({ message: '任务状态已更新' });
  }

  // 方法不被允许
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('方法不被允许');
}
