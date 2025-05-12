import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('只允许 POST 方法');

  const taskId = uuidv4();

  // 暂存在内存中（演示用，生产建议用数据库）
  global.tasks = global.tasks || {};
  global.tasks[taskId] = { status: 'pending', result: '', data: req.body };

  // 异步把任务交给 Make
  fetch('https://hook.us2.make.com/你的Webhook地址', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req.body, taskId })
  }).catch(e => console.error('Webhook 调用失败:', e));

  // 马上返回任务ID
  res.status(200).json({ taskId });
}
