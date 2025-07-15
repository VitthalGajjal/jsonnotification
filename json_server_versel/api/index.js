const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

// Create server
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Path to database file
const dbPath = path.join(__dirname, 'db.json');

// Ensure db.json exists
if (!fs.existsSync(dbPath)) {
  const initialData = {
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
      }
    ]
  };
  
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  console.log('📄 Created db.json file');
}

// Create router with file-based database
const router = jsonServer.router(dbPath);

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
  
  const db = router.db;
  const notifications = db.get('notifications');

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
  
  const db = router.db;
  const notifications = db.get('notifications').value();
  
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
  
  const db = router.db;
  const notifications = db.get('notifications');
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

// Custom route to delete a notification (DELETE /notifications/:id)
server.delete('/notifications/:id', (req, res) => {
  const notificationId = req.params.id;
  console.log(`🗑️ Delete notification ${notificationId} requested`);
  
  const db = router.db;
  const notifications = db.get('notifications');
  const notification = notifications.find({ id: notificationId });

  if (notification.value()) {
    notifications.remove({ id: notificationId }).write();
    console.log(`✅ Notification ${notificationId} deleted`);
    res.status(200).json({ 
      success: true, 
      message: `Notification ${notificationId} deleted successfully`
    });
  } else {
    console.warn(`❌ Notification ${notificationId} not found`);
    res.status(404).json({ 
      success: false, 
      message: 'Notification not found' 
    });
  }
});

// Custom route to get notification statistics
server.get('/notifications/stats', (req, res) => {
  console.log('📊 Notification statistics requested');
  
  const db = router.db;
  const notifications = db.get('notifications').value();
  
  const stats = {
    total: notifications.length,
    notified: notifications.filter(n => n.notified).length,
    unnotified: notifications.filter(n => !n.notified).length,
    byType: {
      local: notifications.filter(n => n.type === 'local').length,
      scheduled: notifications.filter(n => n.type === 'scheduled').length
    }
  };

  console.log('📈 Statistics:', stats);
  res.status(200).json(stats);
});

// Use default json-server routes for other requests
server.use(router);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 JSON Server is running on http://${HOST}:${PORT}`);
  console.log(`📚 Resources available at:`);
  console.log(`   GET    /notifications          - Get all notifications`);
  console.log(`   GET    /notifications/:id      - Get notification by ID`);
  console.log(`   GET    /notifications/latest   - Get latest notification`);
  console.log(`   GET    /notifications/stats    - Get notification statistics`);
  console.log(`   POST   /notifications          - Create new notification`);
  console.log(`   POST   /send-notification      - Send and save notification`);
  console.log(`   PATCH  /notifications/:id      - Update notification`);
  console.log(`   DELETE /notifications/:id      - Delete notification`);
  console.log(`📄 Database file: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});