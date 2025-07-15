const express = require('express');
const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Custom middleware for enhanced logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// --- Endpoint: Send Notification ---
app.post('/send-notification', (req, res) => {
  try {
    console.log('📤 Send notification request received');

    const { title, body, type, time } = req.body;

    const newNotification = {
      id: Date.now().toString(),
      title: title || 'New Notification',
      body: body || 'You have a new message.',
      type: type || 'local',
      notified: true, // Assuming sending means it's notified
      time: time || null,
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
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send notification' 
    });
  }
});

// --- Endpoint: Get Latest Notification ---
app.get('/notifications/latest', (req, res) => {
  try {
    console.log('🔍 Latest notification requested');

    const notifications = db.get('notifications').value();

    if (notifications.length === 0) {
      console.log('⚠️ No notifications found');
      return res.status(404).json({
        success: false,
        message: 'No notifications found'
      });
    }

    const latestNotification = notifications[notifications.length - 1];
    console.log('📋 Latest notification:', latestNotification);
    res.status(200).json(latestNotification);
  } catch (error) {
    console.error('Error getting latest notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get latest notification' 
    });
  }
});

// --- Endpoint: Get All Notifications ---
app.get('/notifications', (req, res) => {
  try {
    console.log('🔍 All notifications requested');

    const notifications = db.get('notifications').value();
    console.log(`📋 Found ${notifications.length} notifications`);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get notifications' 
    });
  }
});

// --- Endpoint: Update Notification Status ---
app.patch('/notifications/:id', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update notification' 
    });
  }
});

// --- Endpoint: Delete Notification ---
app.delete('/notifications/:id', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete notification' 
    });
  }
});

// --- Endpoint: Get Notification Statistics ---
app.get('/notifications/stats', (req, res) => {
  try {
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
    res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error getting notification statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get notification statistics' 
    });
  }
});

// --- Endpoint: Mark Notification as Read ---
app.patch('/notifications/:id/read', (req, res) => {
  try {
    const notificationId = req.params.id;
    console.log(`📖 Mark notification ${notificationId} as read`);

    const notification = db.get('notifications').find({ id: notificationId });

    if (notification.value()) {
      notification.assign({ notified: true }).write();
      console.log(`✅ Notification ${notificationId} marked as read`);
      res.status(200).json({
        success: true,
        message: `Notification ${notificationId} marked as read`,
        notification: notification.value()
      });
    } else {
      console.warn(`❌ Notification ${notificationId} not found`);
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark notification as read' 
    });
  }
});

// --- Endpoint: Clear All Notifications ---
app.delete('/notifications', (req, res) => {
  try {
    console.log('🗑️ Clear all notifications requested');

    const count = db.get('notifications').value().length;
    db.set('notifications', []).write();
    
    console.log(`✅ Cleared ${count} notifications`);
    res.status(200).json({
      success: true,
      message: `Cleared ${count} notifications`
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear notifications' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification service is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notification server running on http://localhost:${PORT}`);
});