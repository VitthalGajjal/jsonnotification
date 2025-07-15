const jsonServer = require('json-server');

// Create server
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Database data (since we can't use files in serverless)
const db = {
  notifications: [
    {
      "id": "1",
      "title": "Welcome",
      "body": "Welcome to the notification app!",
      "type": "local",
      "notified": false,
      "time": null,
      "timestamp": "2025-01-11T10:00:00Z"
    },
    {
      "id": "2",
      "title": "Meeting Reminder",
      "body": "Team sync at 8 PM",
      "type": "scheduled",
      "notified": false,
      "time": "2025-01-11T20:00:00Z",
      "timestamp": "2025-01-11T10:30:00Z"
    },
    {
      "id": "0325",
      "title": "Test",
      "body": "Welcome ",
      "type": "local",
      "time": null,
      "notified": false,
      "timestamp": "2025-07-11T19:13:53.415Z"
    },
    {
      "id": "1d4f",
      "title": "Hello",
      "body": "Rohit",
      "type": "local",
      "time": null,
      "notified": true,
      "timestamp": "2025-07-11T19:14:56.484Z"
    }
  ]
};

// Create router with in-memory database
const router = jsonServer.router(db);

// Enable CORS and other middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Add custom middleware for enhanced logging
server.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Custom route for sending notifications (POST /send-notification)
server.post('/send-notification', (req, res) => {
  console.log('📤 Send notification request received');
  
  const notifications = router.db.get('notifications');

  const newNotification = {
    id: Date.now().toString(),
    title: req.body.title || 'New Notification',
    body: req.body.body || 'You have a new message.',
    type: req.body.type || 'local',
    notified: true,
    time: req.body.time || null,
    timestamp: new Date().toISOString(),
  };

  notifications.push(newNotification).write();
  console.log('✅ Notification saved to database:', newNotification);

  res.status(201).json({
    success: true,
    message: 'Notification received and saved',
    notification: newNotification,
  });
});

// Custom route for getting latest notification (GET /notifications/latest)
server.get('/notifications/latest', (req, res) => {
  console.log('🔍 Latest notification requested');
  
  const notifications = router.db.get('notifications').value();
  
  if (notifications.length === 0) {
    console.log('⚠️ No notifications found');
    res.status(404).json({ 
      success: false, 
      message: 'No notifications found' 
    });
    return;
  }

  const latestNotification = notifications[notifications.length - 1];
  console.log('📋 Latest notification:', latestNotification);
  res.status(200).json(latestNotification);
});

// Custom route to update notification status (PATCH /notifications/:id)
server.patch('/notifications/:id', (req, res) => {
  const notificationId = req.params.id;
  console.log(`🔄 Update notification ${notificationId} requested`);
  
  const notifications = router.db.get('notifications');
  const notification = notifications.find({ id: notificationId });

  if (notification.value()) {
    notification.assign(req.body).write();
    console.log(`✅ Notification ${notificationId} updated:`, req.body);
    res.status(200).json({ 
      success: true, 
      message: `Notification ${notificationId} updated successfully`,
      notification: notification.value()
    });
  } else {
    console.warn(`❌ Notification ${notificationId} not found`);
    res.status(404).json({ 
      success: false, 
      message: 'Notification not found' 
    });
  }
});

// Use default json-server routes for other requests
server.use(router);

// Export for Vercel
module.exports = server;