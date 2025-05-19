import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://proud-starling-28354.upstash.io',
  token: 'AW7CAAIjcDFkNDBkMmU4MGQ1MDA0NzVmYjg0MzAyNjVmOTM4MzliYXAxMA',
});

export default async function handler(req, res) {
  const { method } = req;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (method === 'GET') {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ status: 'error', message: '缺少 taskId 参数' });
    }

    try {
      const taskData = await redis.get(taskId);

      if (!taskData) {
        return res.status(404).json({
          status: 'not_found',
          message: '任务不存在，请返回首页重新提交。',
        });
      }

      const parsedData = JSON.parse(taskData);

      return res.status(200).json({
        status: parsedData.status,
        result: parsedData.result || '',
        data: parsedData.data || {},  // 如果你需要拿到传入的字段，可以通过这个 data 拿到
      });

    } catch (error) {
      console.error('【查询 Redis 失败】:', error);
      return res.status(500).json({ status: 'error', message: '服务器内部错误，请稍后重试。' });
    }
  }

  if (method === 'POST') {
    const { taskId, status, result } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ error: '缺少 taskId 或 status 参数' });
    }

    try {
      await redis.set(taskId, JSON.stringify({
        status,
        result: result || '',
      }));

      return res.status(200).json({ message: '任务状态已更新' });

    } catch (error) {
      console.error('【写入 Redis 失败】:', error);
      return res.status(500).json({ status: 'error', message: '服务器内部错误，请稍后重试。' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('方法不被允许');
}
