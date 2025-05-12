import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('只允许 POST 方法');

  const taskId = uuidv4();

  // 临时存储任务信息
  global.tasks = global.tasks || {};
  global.tasks[taskId] = { status: 'pending', result: '', data: req.body };

  // ✅ 直接响应前端，不等待 Webhook 返回
  res.status(200).json({ taskId });

  // 异步调用 Webhook，不影响用户体验
  fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req.body, taskId })
  })
  .then(response => {
    if (!response.ok) throw new Error(`Webhook 调用失败，状态码：${response.status}`);
    return response.json();
  })
  .then(result => {
    // 👇 这里可以更新任务状态为 "done"，并保存结果（如果有的话）
    if (global.tasks[taskId]) {
      global.tasks[taskId].status = 'done';
      global.tasks[taskId].result = result; // 假设 webhook 会返回分析结果
    }
  })
  .catch(e => {
    console.error('Webhook 调用失败:', e);
    if (global.tasks[taskId]) {
      global.tasks[taskId].status = 'failed';
    }
  });
}
