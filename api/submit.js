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
  const { birthDate, birthTime, city, mbti } = req.body;  // 提取必要字段

  const taskData = {
    status: 'pending',
    result: '',
    data: { birthDate, birthTime, city, mbti }, // 确保 data 里是普通对象，不是复杂结构
  };

  try {
    await redis.set(taskId, JSON.stringify(taskData));
    console.log('【任务已创建并存储】Task ID:', taskId);
  } catch (e) {
    console.error('【Redis 存储失败】', e);
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ taskId });

  // 异步调用 Webhook
  try {
    const response = await fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime, city, mbti, taskId }),
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
