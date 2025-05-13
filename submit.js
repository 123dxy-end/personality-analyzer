export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('只允许 POST 方法');

  global.tasks = global.tasks || {};
  const taskId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  global.tasks[taskId] = { status: 'pending', result: '', data: req.body };

  // 立即响应前端，返回 taskId，开始轮询
  res.status(200).json({ taskId });

  // 异步调用 Make Webhook
  fetch('https://hook.us2.make.com/qc2cyluvofpxxcwiaqsiap59uc9quex8', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req.body, taskId })
  })
  .catch(e => {
    console.error('Webhook 调用失败:', e);
    if (global.tasks[taskId]) {
      global.tasks[taskId].status = 'failed';
    }
  });
}
