const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Enable CORS for all origins
server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Parse JSON bodies
server.use(jsonServer.bodyParser);

// Custom routes
server.post('/send-notification', (req, res) => {
  const { title, message, type, userId } = req.body;
  
  // Create new notification
  const newNotification = {
    id: Date.now(),
    title,
    message,
    type: type || 'general',
    timestamp: new Date().toISOString(),
    read: false,
    userId: userId || 1
  };
  
  // Add to database
  const db = router.db;
  db.get('notifications').push(newNotification).write();
  
  res.json({
    success: true,
    message: 'Notification sent successfully',
    notification: newNotification
  });
});

// Get unread notifications count
server.get('/notifications/unread-count', (req, res) => {
  const db = router.db;
  const unreadCount = db.get('notifications').filter({ read: false }).size().value();
  
  res.json({
    unreadCount
  });
});

// Mark notification as read
server.patch('/notifications/:id/read', (req, res) => {
  const db = router.db;
  const notificationId = parseInt(req.params.id);
  
  const notification = db.get('notifications')
    .find({ id: notificationId })
    .assign({ read: true })
    .write();
  
  if (notification) {
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
});

// Mark all notifications as read
server.patch('/notifications/read-all', (req, res) => {
  const db = router.db;
  
  db.get('notifications')
    .forEach(notification => {
      notification.read = true;
    })
    .write();
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Use default router
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- GET    http://localhost:${PORT}/notifications`);
  console.log(`- POST   http://localhost:${PORT}/send-notification`);
  console.log(`- GET    http://localhost:${PORT}/notifications/unread-count`);
  console.log(`- PATCH  http://localhost:${PORT}/notifications/:id/read`);
  console.log(`- PATCH  http://localhost:${PORT}/notifications/read-all`);
});