import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://proud-starling-28354.upstash.io',  // 在这里填你的 URL
  token: 'AW7CAAIjcDFkNDBkMmU4MGQ1MDA0NzVmYjg0MzAyNjVmOTM4MzliYXAxMA',  // 在这里填你的 Token
});

export default async function handler(req, res) {
  const { method } = req;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (method === 'GET') {
    const { taskId } = req.query;
    if (!taskId) {
      return res.status(400).json({ error: '缺少 taskId 参数' });
    }

    const taskData = await redis.get(taskId);
    if (!taskData) {
      console.warn(`【状态查询】未找到任务: ${taskId}`);
      return res.status(404).json({
        status: 'not_found',
        message: '任务不存在，请返回首页重新提交。'
      });
    }

    const task = JSON.parse(taskData);
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

    await redis.set(taskId, JSON.stringify({
      status,
      result: result || ''
    }));

    console.log(`【状态更新】TaskID: ${taskId} 状态更新为: ${status}`);
    return res.status(200).json({ message: '任务状态已更新' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('方法不被允许');
}
