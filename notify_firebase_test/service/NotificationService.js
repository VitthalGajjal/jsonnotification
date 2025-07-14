import messaging from '@react-native-firebase/messaging';
import {Alert, Platform, PermissionsAndroid} from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationOpenedCallback = null;
    this.initializeService();
  }

  // Add method to set notification opened callback
  setNotificationOpenedCallback = (callback) => {
    this.notificationOpenedCallback = callback;
  };

  initializeService = async () => {
    try {
      console.log('=== INITIALIZING NOTIFICATION SERVICE ===');
      
      // First request permissions
      await this.requestAllPermissions();
      
      // Then configure push notifications
      this.configurePushNotification();
      
      // Register with FCM
      await this.registerAppWithFCM();
      
      // Create notification listeners
      this.createNotificationListeners();
      
      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  };

  // Request all necessary permissions
  requestAllPermissions = async () => {
    console.log('=== REQUESTING ALL PERMISSIONS ===');
    
    try {
      // For Android 13+ (API level 33+), request POST_NOTIFICATIONS permission
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs access to show notifications',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ POST_NOTIFICATIONS permission granted');
        } else {
          console.log('❌ POST_NOTIFICATIONS permission denied');
        }
      }

      // Request FCM permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ FCM Authorization granted:', authStatus);
      } else {
        console.log('❌ FCM Authorization denied');
      }

      // Request react-native-push-notification permissions
      const pushPermissions = await new Promise((resolve) => {
        PushNotification.requestPermissions((permissions) => {
          resolve(permissions);
        });
      });
      
      console.log('Push notification permissions:', pushPermissions);
      
      return enabled && pushPermissions;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  // Configure push notifications with proper error handling
  configurePushNotification = () => {
    console.log('=== CONFIGURING PUSH NOTIFICATIONS ===');
    
    PushNotification.configure({
      onRegister: function (token) {
        console.log('✅ Push notification token:', token);
      },

      onNotification: (notification) => {
        console.log('📱 NOTIFICATION RECEIVED:', notification);
        
        // Handle notification tap - THIS IS THE KEY FIX
        if (notification.userInteraction) {
          console.log('👆 User tapped notification');
          this.handleNotificationTap(notification);
        }
        
        // Call finish on iOS
        // if (notification.finish) {
        //   notification.finish(PushNotificationIOS.FetchResult.NoData);
        // }
      },

      onRegistrationError: function(err) {
        console.error('❌ Push notification registration error:', err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios', // Only request on iOS
    });

    // Create notification channels with better error handling
    this.createNotificationChannels();
  };

  // Enhanced notification channels including weather channels
  createNotificationChannels = () => {
    console.log('📢 Creating notification channels...');
    
    const channels = [
      {
        channelId: 'default-channel-id',
        channelName: 'Default Channel',
        channelDescription: 'Default notifications',
        importance: Importance.DEFAULT,
        playSound: true,
        soundName: 'default',
        vibrate: true,
      },
      {
        channelId: 'test-channel',
        channelName: 'Test Channel',
        channelDescription: 'Test notifications',
        importance: Importance.HIGH,
        playSound: true,
        soundName: 'default',
        vibrate: true,
      },
      {
        channelId: 'high-priority',
        channelName: 'High Priority',
        channelDescription: 'High priority notifications',
        importance: Importance.HIGH,
        playSound: true,
        soundName: 'default',
        vibrate: true,
      },
      // Weather-specific channels
      {
        channelId: 'weather-alerts',
        channelName: 'Weather Alerts',
        channelDescription: 'Weather forecasts and alerts',
        importance: Importance.HIGH,
        playSound: true,
        soundName: 'default',
        vibrate: true,
      },
      {
        channelId: 'daily-forecast',
        channelName: 'Daily Forecast',
        channelDescription: 'Daily weather forecasts',
        importance: Importance.DEFAULT,
        playSound: true,
        soundName: 'default',
        vibrate: true,
      }
    ];

    channels.forEach((channel) => {
      PushNotification.createChannel(
        channel,
        (created) => {
          console.log(`📢 Channel ${channel.channelId}: ${created ? '✅ Created' : '⚠️ Already exists'}`);
        }
      );
    });
  };

  // Register the device with FCM
  registerAppWithFCM = async () => {
    try {
      console.log('🔥 Registering with FCM...');
      
      // Check if device supports FCM
      const isSupported = await messaging().isDeviceRegisteredForRemoteMessages;
      console.log('FCM device registration status:', isSupported);
      
      if (!isSupported) {
        await messaging().registerDeviceForRemoteMessages();
        console.log('✅ Device registered for remote messages');
      }
      
      return true;
    } catch (error) {
      console.error('❌ FCM registration error:', error);
      return false;
    }
  };

  // Get FCM token with retry logic
  getFCMToken = async () => {
    try {
      console.log('🔑 Getting FCM token...');
      
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('✅ FCM Token received:', fcmToken.substring(0, 20) + '...');
        return fcmToken;
      } else {
        console.log('❌ No FCM token received');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  };

  // Request notification permission with detailed feedback
  requestUserPermission = async () => {
    try {
      console.log('🔐 Requesting user permission...');
      
      // First check current permission
      const currentAuthStatus = await messaging().hasPermission();
      console.log('Current auth status:', currentAuthStatus);
      
      if (currentAuthStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        console.log('✅ Permission already granted');
        return true;
      }
      
      // Request permission
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      });
      
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted:', authStatus);
        return true;
      } else {
        console.log('❌ Notification permission denied:', authStatus);
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  };

  // Create notification listeners
  createNotificationListeners = () => {
    console.log('👂 Creating notification listeners...');
    
    // App opened from background via notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📱 App opened from background:', remoteMessage?.notification);
      this.handleNotificationNavigation(remoteMessage);
    });

    // App opened from killed state via notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📱 App opened from killed state:', remoteMessage?.notification);
          this.handleNotificationNavigation(remoteMessage);
        }
      });

    // Foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('📱 Foreground message received:', remoteMessage?.notification);
      this.showForegroundNotification(remoteMessage);
    });

    // Background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📱 Background message handled:', remoteMessage?.notification);
    });

    console.log('✅ Notification listeners created');
  };

  // Handle notification tap with popup/alert
  handleNotificationTap = (notification) => {
    console.log('🔔 Handling notification tap:', notification);
    
    // Show popup/alert when notification is tapped
    const title = notification.title || 'Notification';
    const message = notification.message || notification.body || 'You have a new notification';
    
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Close',
          style: 'cancel',
        },
        {
          text: 'Open',
          onPress: () => {
            // Handle navigation or action
            this.handleNotificationAction(notification);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handle notification action
  handleNotificationAction = (notification) => {
    console.log('🎯 Handling notification action:', notification);
    
    // Call the callback if set
    if (this.notificationOpenedCallback) {
      this.notificationOpenedCallback(notification);
    }
    
    // Handle navigation based on notification data
    if (notification.data || notification.userInfo) {
      const data = notification.data || notification.userInfo;
      console.log('📱 Notification data:', data);
      
      if (data.screen) {
        console.log('🧭 Navigate to screen:', data.screen);
        // Add your navigation logic here
      }
    }
  };

  // Handle notification navigation
  handleNotificationNavigation = remoteMessage => {
    console.log('🧭 Handling notification navigation:', remoteMessage);
    
    // Show popup for FCM notifications too
    if (remoteMessage?.notification) {
      const title = remoteMessage.notification.title || 'Notification';
      const body = remoteMessage.notification.body || 'You have a new message';
      
      Alert.alert(
        title,
        body,
        [
          {
            text: 'Close',
            style: 'cancel',
          },
          {
            text: 'Open',
            onPress: () => {
              if (remoteMessage?.data?.screen) {
                console.log('🧭 Navigate to:', remoteMessage.data.screen);
                // Add your navigation logic here
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Show notification when app is in foreground
  showForegroundNotification = remoteMessage => {
    const title = remoteMessage?.notification?.title || 'Notification';
    const body = remoteMessage?.notification?.body || 'You have a new message';
    
    console.log('📱 Showing foreground notification:', title);
    
    PushNotification.localNotification({
      channelId: 'default-channel-id',
      title: title,
      message: body,
      playSound: true,
      soundName: 'default',
      priority: 'high',
      importance: 'high',
      vibrate: true,
      invokeApp: true,
      userInfo: remoteMessage?.data || {},
      // Add actions for better interaction
      actions: '["Open", "Close"]',
    });
  };

  // ========== WEATHER-SPECIFIC METHODS ==========

  // Weather-specific local notification method
  localNotification = (
    title,
    message,
    channelId = 'weather-alerts',
    additionalOptions = {}
  ) => {
    console.log('🌤️ Showing weather notification:', title);
    
    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: Importance.HIGH,
      vibrate: true,
      invokeApp: true,
      userInfo: {
        type: 'weather',
        ...additionalOptions.userInfo
      },
      ...additionalOptions,
    });
  };

  // Weather alert notification
  showWeatherAlert = (title, message, severity = 'normal') => {
    const channelId = severity === 'high' ? 'weather-alerts' : 'daily-forecast';
    const importance = severity === 'high' ? Importance.HIGH : Importance.DEFAULT;
    
    this.localNotification(
      title,
      message,
      channelId,
      {
        importance,
        priority: severity === 'high' ? 'high' : 'normal',
        userInfo: {
          type: 'weather_alert',
          severity
        }
      }
    );
  };

  // Daily forecast notification
  showDailyForecast = (title, message) => {
    this.localNotification(
      title,
      message,
      'daily-forecast',
      {
        importance: Importance.DEFAULT,
        priority: 'normal',
        userInfo: {
          type: 'daily_forecast'
        }
      }
    );
  };

  // ========== ENHANCED EXISTING METHODS ==========

  // Enhanced test notification method
  showTestNotification = async () => {
    console.log('🧪 === SHOWING TEST NOTIFICATION ===');
    
    try {
      // First check if service is initialized
      if (!this.isInitialized) {
        console.log('⚠️ Service not initialized, initializing now...');
        await this.initializeService();
      }
      
      // Check permissions
      const permissions = await this.checkDetailedPermissions();
      console.log('Current permissions:', permissions);
      
      if (!permissions.alert) {
        console.log('❌ Alert permission denied, requesting...');
        await this.requestAllPermissions();
      }
      
      // Show test notification
      console.log('📱 Showing test notification...');
      
      const testNotification = {
        channelId: 'test-channel',
        title: 'Test Notification 🧪',
        message: 'This is a test notification from your app! Tap to see popup.',
        playSound: true,
        soundName: 'default',
        priority: 'high',
        importance: 'high',
        vibrate: true,
        smallIcon: 'ic_notification',
        largeIcon: 'ic_launcher',
        color: '#007bff',
        id: Date.now(), // Unique ID
        invokeApp: true,
        userInfo: {
          screen: 'TestScreen',
          action: 'test_action'
        },
        // Add actions
        actions: '["Open", "Close"]',
      };
      
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: 'title',
        message: 'body',
        playSound: true,
        soundName: 'default',
        priority: 'high',
        importance: 'high',
        vibrate: true,
        invokeApp: true,
        // userInfo: remoteMessage?.data || {},
        // Add actions for better interaction
        actions: '["Open", "Close"]',
      });
      
      // Show weather test notification with delay
      setTimeout(() => {
        console.log('🌤️ Showing weather test notification...');
        this.showWeatherAlert(
          'Weather Test Alert 🌦️',
          'This is a test weather alert notification!'
        );
      }, 2000);
      
      // Show daily forecast test
      setTimeout(() => {
        console.log('☀️ Showing daily forecast test...');
        this.showDailyForecast(
          'Daily Forecast Test ☀️',
          'Today: Sunny, 25°C. Tomorrow: Partly cloudy, 22°C.'
        );
      }, 4000);
      
      console.log('✅ Test notifications triggered');
      return true;
      
    } catch (error) {
      console.error('❌ Error showing test notification:', error);
      throw error;
    }
  };

  // Check detailed permissions
  checkDetailedPermissions = async () => {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        console.log('📋 Detailed permissions check:', permissions);
        resolve(permissions);
      });
    });
  };

  // Subscribe to topic
  subscribeToTopic = async topic => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`✅ Subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
      return false;
    }
  };

  // Unsubscribe from topic
  unsubscribeFromTopic = async topic => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`✅ Unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      return false;
    }
  };

  // Check if app has notification permission
  checkPermission = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED;
      console.log('📋 Permission check:', enabled ? '✅ Enabled' : '❌ Disabled');
      return enabled;
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return false;
    }
  };

  // Delete FCM token
  deleteToken = async () => {
    try {
      await messaging().deleteToken();
      console.log('✅ FCM token deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting FCM token:', error);
      return false;
    }
  };

  // Enhanced clear notifications methods
  clearAllNotifications = () => {
    console.log('🗑️ Clearing all notifications');
    PushNotification.cancelAllLocalNotifications();
  };

  // Cancel all notifications (alias for compatibility)
  cancelAllNotifications = () => {
    this.clearAllNotifications();
  };

  // Cancel scheduled notifications
  cancelScheduledNotifications = () => {
    console.log('🗑️ Canceling scheduled notifications');
    PushNotification.cancelAllLocalNotifications();
  };

  // Clear specific notification
  clearNotification = (id) => {
    console.log('🗑️ Clearing notification:', id);
    PushNotification.cancelLocalNotifications({id: id});
  };

  // Request permissions (enhanced for compatibility)
  requestPermissions = async () => {
    return await this.requestAllPermissions();
  };

  // Comprehensive notification settings check
  checkNotificationSettings = async () => {
    console.log('🔍 === COMPREHENSIVE NOTIFICATION CHECK ===');
    
    try {
      // Check FCM permission
      const fcmPermission = await messaging().hasPermission();
      console.log('🔥 FCM Permission:', fcmPermission);
      
      // Check push notification permissions
      const pushPermissions = await this.checkDetailedPermissions();
      console.log('📱 Push Permissions:', pushPermissions);
      
      // Check if device is registered
      const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
      console.log('📱 Device Registered:', isRegistered);
      
      // Android specific checks
      if (Platform.OS === 'android') {
        console.log('🤖 Android Version:', Platform.Version);
        
        if (Platform.Version >= 33) {
          const permission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          console.log('📮 POST_NOTIFICATIONS permission:', permission);
        }
      }
      
      return {
        fcmPermission,
        pushPermissions,
        isRegistered,
      };
      
    } catch (error) {
      console.error('❌ Error checking notification settings:', error);
      return null;
    }
  };

  // Force permission request for Android 13+
  forcePermissionRequest = async () => {
    console.log('🔐 === FORCING PERMISSION REQUEST ===');
    
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Enable Notifications',
            message: 'This app needs notification permissions to keep you updated.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        console.log('Android permission result:', result);
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      // For older Android versions and iOS
      const pushPermissions = await new Promise((resolve) => {
        PushNotification.requestPermissions((permissions) => {
          resolve(permissions);
        });
      });
      
      console.log('Push permissions result:', pushPermissions);
      return pushPermissions.alert;
      
    } catch (error) {
      console.error('❌ Error forcing permission request:', error);
      return false;
    }
  };
}

export default new NotificationService();