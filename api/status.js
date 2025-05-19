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
      const taskDataRaw = await redis.get(taskId);

      if (!taskDataRaw) {
        return res.status(404).json({
          status: 'not_found',
          message: '任务不存在，请返回首页重新提交。',
        });
      }

      let parsedData;
      try {
        if (typeof taskDataRaw === 'string') {
          parsedData = JSON.parse(taskDataRaw);
        } else if (typeof taskDataRaw === 'object') {
          parsedData = taskDataRaw;
        } else {
          parsedData = { status: 'done', result: String(taskDataRaw) };
        }
      } catch (err) {
        console.error('【JSON解析失败】：', err);
        parsedData = { status: 'done', result: taskDataRaw };
      }

      return res.status(200).json({
        status: 'done',  // 强制 done，避免前端一直轮询或转圈
        result: parsedData.result || '',
        data: parsedData.data || {},
      });

    } catch (error) {
      console.error('【查询 Redis 失败】：', error);
      return res.status(500).json({ status: 'error', message: '服务器内部错误，请稍后重试。' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end('方法不被允许');
}
