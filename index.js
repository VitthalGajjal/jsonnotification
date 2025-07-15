const express = require('express');
const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cors = require('cors'); // Import cors middleware

// Create Express app
const app = express();

// Path to database file
const dbPath = path.join(__dirname, 'db.json');

// Ensure db.json exists with initial data if not present
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

// Initialize lowdb
const adapter = new FileSync(dbPath);
const db = low(adapter);

// Set default structure if db.json was just created or is empty
db.defaults({ notifications: [] }).write();

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Add custom middleware for enhanced logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Custom route for sending notifications (POST /send-notification)
app.post('/send-notification', (req, res) => {
  console.log('📤 Send notification request received');

  const newNotification = {
    id: Date.now().toString(),
    title: req.body.title || 'New Notification',
    body: req.body.body || 'You have a new message.',
    type: req.body.type || 'local',
    notified: true, // Assuming sending means it's notified
    time: req.body.time || null,
    timestamp: new Date().toISOString(),
  };

  db.get('notifications')
    .push(newNotification)
    .write();

  console.log('✅ Notification saved to database:', newNotification);

  res.status(201).json({
    success: true,
    message: 'Notification received and saved',
    notification: newNotification,
  });
});

// Custom route for getting latest notification (GET /notifications/latest)
app.get('/notifications/latest', (req, res) => {
  console.log('🔍 Latest notification requested');

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
app.patch('/notifications/:id', (req, res) => {
  const notificationId = req.params.id;
  console.log(`🔄 Update notification ${notificationId} requested`);

  const notification = db.get('notifications').find({ id: notificationId });

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
app.delete('/notifications/:id', (req, res) => {
  const notificationId = req.params.id;
  console.log(`🗑️ Delete notification ${notificationId} requested`);

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
app.get('/notifications/stats', (req, res) => {
  console.log('📊 Notification statistics requested');

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

// Add a catch-all route for any other requests to return a 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// Export the Express app instance for Vercel
module.exports = app;