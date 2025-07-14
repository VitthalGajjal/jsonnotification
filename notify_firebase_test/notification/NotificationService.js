import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.createChannels();
  }

  configure = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  createChannels = () => {
    PushNotification.createChannel(
      {
        channelId: 'weather-alerts',
        channelName: 'Weather Alerts',
        channelDescription: 'Weather forecasts and alerts',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      created => console.log(`Channel 'weather-alerts' created: ${created}`),
    );
    PushNotification.createChannel(
      {
        channelId: 'daily-forecast',
        channelName: 'Daily Forecast',
        channelDescription: 'Daily weather forecasts',
        playSound: true,
        soundName: 'default',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      created => console.log(`Channel 'daily-forecast' created: ${created}`),
    );
  };

  localNotification = (
    title,
    message,
    channelId = 'weather-alerts',
  ) => {
    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: Importance.HIGH,
      vibrate: true,
    });
  };

  scheduledNotification = (
    title,
    message,
    date,
    channelId = 'daily-forecast',
    repeatType = 'day',
  ) => {
    PushNotification.localNotificationSchedule({
      channelId,
      title,
      message,
      date,
      allowWhileIdle: true,
      repeatType,
    });
  };

  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  cancelScheduledNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  requestPermissions = async () => {
    return PushNotification.requestPermissions();
  };
}

export default new NotificationService();