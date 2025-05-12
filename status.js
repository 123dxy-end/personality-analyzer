// status.js

export default async function handler(req, res) {
  global.tasks = global.tasks || {};

  if (req.method === 'GET') {
    const { taskId } = req.query;
    const task = global.tasks[taskId];

    if (!task) return res.status(404).json({ status: 'not_found' });

    if (task.status === 'done') {
      return res.status(200).json({ status: 'done', result: task.result });
    }

    return res.status(200).json({ status: 'pending' });
  }

  if (req.method === 'PUT') {
    const { taskId } = req.query;
    const { status, result } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ error: '缺少 taskId 或 status 参数' });
    }

    global.tasks[taskId] = {
      status,
      result: result || ''
    };

    return res.status(200).json({ message: '状态已更新' });
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).end('方法不被允许');
}
