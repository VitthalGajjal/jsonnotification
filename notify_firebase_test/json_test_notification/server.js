const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

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

// Health check endpoint
server.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'JSON Server is running correctly' 
  });
});

// Custom route for sending notifications (POST /send-notification)
server.post('/send-notification', (req, res) => {
  console.log('📤 Send notification request received');
  
  const db = router.db;
  const notifications = db.get('notifications');

  const newNotification = {
    id: Date.now(),
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
  const notificationId = parseInt(req.params.id, 10);
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

// Use default json-server routes for other requests
server.use(router);

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 JSON Server is running!');
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://0.0.0.0:${PORT}`);
  console.log(`📱 Android Emulator: http://10.0.2.2:${PORT}`);
  console.log(`📱 Physical Device: http://[YOUR_IP]:${PORT}`);
  console.log('');
  console.log('🔧 Available endpoints:');
  console.log('  GET    /health');
  console.log('  GET    /notifications');
  console.log('  GET    /notifications/latest');
  console.log('  POST   /send-notification');
  console.log('  PATCH  /notifications/:id');
  console.log('  DELETE /notifications/:id');
  console.log('');
  console.log('💡 To get your IP address:');
  console.log('  - Windows: ipconfig');
  console.log('  - Mac/Linux: ifconfig');
  console.log('  - Update JsonService.js with your IP address');
});