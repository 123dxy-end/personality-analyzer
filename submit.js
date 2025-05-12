import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('只允许 POST 方法');

  const taskId = uuidv4();

  // 临时存储任务信息（仅演示用途）
  global.tasks = global.tasks || {};
  global.tasks[taskId] = { status: 'pending', result: '', data: req.body };

  // 异步把任务交给 Make
  fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req.body, taskId })
  }).catch(e => console.error('Webhook 调用失败:', e));

  // 把 taskId 直接返回给前端
  res.status(200).json({ taskId });
}
