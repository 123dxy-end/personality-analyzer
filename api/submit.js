import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://proud-starling-28354.upstash.io',  // 在这里填你的 URL
  token: 'AW7CAAIjcDFkNDBkMmU4MGQ1MDA0NzVmYjg0MzAyNjVmOTM4MzliYXAxMA',  // 在这里填你的 Token
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('只允许 POST 方法');
  }

  const taskId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // 保存任务到 Redis
  await redis.set(taskId, JSON.stringify({
    status: 'pending',
    result: '',
    data: req.body
  }));

  console.log('【任务已创建并存储】Task ID:', taskId);

  // 返回 taskId 给前端
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ taskId });

  // 异步调用 Make Webhook
  try {
    const response = await fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, taskId })
    });

    if (!response.ok) {
      console.error('【调用 Make Webhook 失败】状态码:', response.status);
      await redis.set(taskId, JSON.stringify({ status: 'failed', result: '' }));
    } else {
      console.log('【调用 Make Webhook 成功】Task ID:', taskId);
    }
  } catch (e) {
    console.error('【Webhook 调用异常】:', e);
    await redis.set(taskId, JSON.stringify({ status: 'failed', result: '' }));
  }
}
