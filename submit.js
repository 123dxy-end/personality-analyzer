import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('只允许 POST 方法');

  const taskId = uuidv4();

  // 临时存储任务信息（仅用于演示）
  global.tasks = global.tasks || {};
  global.tasks[taskId] = { status: 'pending', result: '', data: req.body };

  try {
    // 等待 Make 完成任务提交，否则直接失败
    const response = await fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, taskId })
    });

    if (!response.ok) {
      throw new Error(`Webhook 调用失败，状态码：${response.status}`);
    }

    // 正确提交后，返回 taskId 给前端
    res.status(200).json({ taskId });

  } catch (e) {
    console.error('Webhook 调用失败:', e);
    // 明确告诉前端失败了
    res.status(500).json({ error: 'Webhook 调用失败', details: e.message });
  }
}
