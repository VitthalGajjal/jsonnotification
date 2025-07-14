import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.isConfigured = false;
    this.configure();
    this.createChannels();
  }

  configure() {
    try {
      console.log('🔧 NotificationService.configure() - Starting...');
      
      PushNotification.configure({
        // Called when token is generated
        onRegister: function(token) {
          console.log('📋 Push notification token received:', token);
        },

        // Called when a remote notification is received
        onNotification: function(notification) {
          console.log('📨 Notification received:', notification);
          console.log('📨 Notification title:', notification.title);
          console.log('📨 Notification message:', notification.message);
          console.log('📨 User interaction:', notification.userInteraction);
          
          // Handle notification tap
          if (notification.userInteraction) {
            console.log('👆 User tapped notification');
            // Handle navigation or other actions here
          }
        },

        // Called when remote notification opens the app
        onAction: function(notification) {
          console.log('🎯 Notification action triggered:', notification.action);
          console.log('🎯 Notification data:', notification);
        },

        // Called when the user fails to register for remote notifications
        onRegistrationError: function(err) {
          console.error('❌ Push notification registration error:', err);
        },

        // IOS ONLY - permissions
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },

        // Should the initial notification be popped automatically
        popInitialNotification: true,

        // Should request permissions on iOS
        requestPermissions: Platform.OS === 'ios',
      });

      this.isConfigured = true;
      console.log('✅ NotificationService configured successfully');
    } catch (error) {
      console.error('❌ Error configuring NotificationService:', error);
    }
  }

  createChannels() {
    // Only create channels for Android
    if (Platform.OS === 'android') {
      try {
        console.log('🤖 Creating Android notification channels...');
        
        // Create default channel
        PushNotification.createChannel(
          {
            channelId: 'default-channel',
            channelName: 'Default Notifications',
            channelDescription: 'Default notification channel for general notifications',
            playSound: true,
            soundName: 'default',
            importance: 4, // IMPORTANCE_HIGH
            vibrate: true,
          },
          (created) => {
            console.log(`📢 Default channel created: ${created}`);
          }
        );

        // Create high priority channel
        PushNotification.createChannel(
          {
            channelId: 'high-priority-channel',
            channelName: 'High Priority Notifications',
            channelDescription: 'High priority notifications for important alerts',
            playSound: true,
            soundName: 'default',
            importance: 5, // IMPORTANCE_MAX
            vibrate: true,
          },
          (created) => {
            console.log(`🚨 High priority channel created: ${created}`);
          }
        );

        console.log('✅ Android notification channels setup completed');
      } catch (error) {
        console.error('❌ Error creating notification channels:', error);
      }
    } else {
      console.log('🍎 iOS detected - notification channels not needed');
    }
  }

  // Show local notification immediately
  showLocalNotification(title, body, channelId = 'default-channel') {
    if (!this.isConfigured) {
      console.error('❌ NotificationService not configured');
      return;
    }

    try {
      console.log('🔔 NotificationService.showLocalNotification() - Starting...');
      console.log('📝 Title:', title);
      console.log('📝 Body:', body);
      console.log('📝 Channel ID:', channelId);
      
      const notificationConfig = {
        title: title || 'Notification',
        message: body || 'You have a new notification',
        playSound: true,
        soundName: 'default',
        vibrate: true,
        vibration: 300,
        priority: 'high',
        visibility: 'public',
        importance: 'high',
        autoCancel: true,
        largeIcon: 'ic_launcher', // Android only
        smallIcon: 'ic_notification', // Android only
        number: 10, // Badge count
      };

      // Add channelId only for Android
      if (Platform.OS === 'android') {
        notificationConfig.channelId = channelId;
      }

      console.log('📦 Notification config:', JSON.stringify(notificationConfig, null, 2));
      
      PushNotification.localNotification(notificationConfig);
      console.log('✅ Local notification sent successfully');
      
    } catch (error) {
      console.error('❌ Error showing local notification:', error);
    }
  }

  // Show scheduled notification
  scheduleNotification(title, body, date, channelId = 'default-channel') {
    if (!this.isConfigured) {
      console.error('❌ NotificationService not configured');
      return;
    }

    try {
      console.log('⏰ NotificationService.scheduleNotification() - Starting...');
      console.log('📝 Title:', title);
      console.log('📝 Body:', body);
      console.log('📝 Scheduled date:', date);
      console.log('📝 Channel ID:', channelId);
      
      // Parse date if it's a string
      let scheduledDate;
      if (typeof date === 'string') {
        scheduledDate = new Date(date);
      } else {
        scheduledDate = date;
      }
      
      console.log('📅 Parsed scheduled date:', scheduledDate);
      console.log('📅 Current date:', new Date());
      
      // Check if the scheduled date is in the future
      if (scheduledDate <= new Date()) {
        console.error('❌ Scheduled date must be in the future');
        throw new Error('Scheduled date must be in the future');
      }
      
      const notificationConfig = {
        title: title || 'Scheduled Notification',
        message: body || 'This is a scheduled notification',
        date: scheduledDate,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        vibration: 300,
        priority: 'high',
        visibility: 'public',
        importance: 'high',
        autoCancel: true,
        repeatType: 'time', // Don't repeat
        number: 10, // Badge count
      };

      // Add channelId only for Android
      if (Platform.OS === 'android') {
        notificationConfig.channelId = channelId;
      }

      console.log('📦 Scheduled notification config:', JSON.stringify(notificationConfig, null, 2));
      
      PushNotification.localNotificationSchedule(notificationConfig);
      console.log('✅ Scheduled notification set successfully');
      
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      throw error;
    }
  }

  // Request permissions (mainly for iOS)
  requestPermissions() {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔐 NotificationService.requestPermissions() - Starting...');
        
        if (Platform.OS === 'android') {
          console.log('🤖 Android: Permissions granted by default');
          resolve({
            alert: true,
            badge: true,
            sound: true,
          });
        } else {
          console.log('🍎 iOS: Requesting notification permissions...');
          PushNotification.requestPermissions()
            .then(permissions => {
              console.log('✅ iOS permissions granted:', permissions);
              resolve(permissions);
            })
            .catch(error => {
              console.error('❌ iOS permission request failed:', error);
              reject(error);
            });
        }
      } catch (error) {
        console.error('❌ Error requesting permissions:', error);
        reject(error);
      }
    });
  }

  // Test notification functionality
  testNotification() {
    console.log('🧪 NotificationService.testNotification() - Starting...');
    const testTitle = 'Test Notification';
    const testBody = 'This is a test notification to verify the system is working!';
    
    this.showLocalNotification(testTitle, testBody, 'high-priority-channel');
    console.log('✅ Test notification sent');
  }

  // Set badge number (iOS only)
  setApplicationIconBadgeNumber(badgeCount) {
    try {
      if (Platform.OS === 'ios') {
        PushNotification.setApplicationIconBadgeNumber(badgeCount);
        console.log(`📱 Badge count set to: ${badgeCount}`);
      } else {
        console.log('🤖 Android: Badge count not supported natively');
      }
    } catch (error) {
      console.error('❌ Error setting badge number:', error);
    }
  }

  // Cancel all notifications
  cancelAllNotifications() {
    try {
      console.log('🚫 Canceling all notifications...');
      PushNotification.cancelAllLocalNotifications();
      console.log('✅ All notifications canceled');
    } catch (error) {
      console.error('❌ Error canceling notifications:', error);
    }
  }
}

export default new NotificationService();