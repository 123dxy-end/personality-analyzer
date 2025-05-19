import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://proud-starling-28354.upstash.io',
  token: 'AW7CAAIjcDFkNDBkMmU4MGQ1MDA0NzVmYjg0MzAyNjVmOTM4MzliYXAxMA',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('只允许 POST 方法');
  }

  const taskId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const taskData = {
    status: 'pending',
    result: '',
    data: req.body,
  };

  try {
    await redis.set(taskId, JSON.stringify(taskData));
    console.log('【任务已创建并存储】Task ID:', taskId);
  } catch (e) {
    console.error('【Redis 存储失败】', e);
    // 不要直接中断程序，继续返回 taskId 给前端
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ taskId });

  // 调用 Webhook
  try {
    const response = await fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, taskId }),
    });

    if (!response.ok) {
      console.error('【调用 Make Webhook 失败】状态码:', response.status);
      await redis.set(taskId, JSON.stringify({ status: 'failed', result: '' }));
    } else {
      console.log('【调用 Make Webhook 成功】Task ID:', taskId);
    }
  } catch (e) {
    console.error('【Webhook 调用异常】', e);
    await redis.set(taskId, JSON.stringify({ status: 'failed', result: '' }));
  }
}
