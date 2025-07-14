import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import NotificationService from './NotificationService';

const NotificationScreen = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const permissions = await NotificationService.requestPermissions();
      setPermissionGranted(permissions.alert);
    } catch (error) {
      console.log('Permission error:', error);
    }
  };

  const showSimpleNotification = () => {
    NotificationService.localNotification(
      'Test Notification',
      'This is a simple test notification!',
      'weather-alerts'
    );
  };

  const showWeatherAlert = () => {
    NotificationService.localNotification(
      'High Temperature Alert',
      'High temperatures reaching 38°C. Stay hydrated!',
      'weather-alerts'
    );
  };

  const showDailyForecast = () => {
    NotificationService.localNotification(
      "Tomorrow's Weather Forecast",
      'Partly cloudy with temperatures between 22°C and 28°C.',
      'daily-forecast'
    );
  };

  const scheduleNotification = () => {
    const scheduleTime = new Date();
    scheduleTime.setSeconds(scheduleTime.getSeconds() + 5); // 5 seconds from now

    NotificationService.scheduledNotification(
      'Scheduled Notification',
      'This notification was scheduled 5 seconds ago!',
      scheduleTime,
      'daily-forecast'
    );

    Alert.alert(
      'Scheduled!',
      'A notification has been scheduled for 5 seconds from now.'
    );
  };

  const testWeatherNotifications = () => {
    // Mock weather data for testing
    const mockWeatherData = {
      daily: {
        time: ['2024-01-01', '2024-01-02', '2024-01-03'],
        weathercode: [1, 63, 3],
        temperature_2m_max: [28, 32, 38], // 38°C will trigger high temp alert
        temperature_2m_min: [18, 22, 25],
        precipitation_sum: [0, 25, 5], // 25mm will trigger heavy rain alert
      },
      hourly: {
        windspeed_10m: [15, 25, 55, 30], // 55km/h will trigger high wind alert
      },
    };

    // Import and use the weather notification setup
    import('./WeatherNotification').then(module => {
      module.setupWeatherNotifications(mockWeatherData);
    });

    Alert.alert(
      'Weather Notifications Setup',
      'Weather notifications have been configured with test data. You should see alerts for high temperature, heavy rain, and high wind.'
    );
  };

  const clearAllNotifications = () => {
    NotificationService.cancelAllNotifications();
    Alert.alert('Cleared', 'All notifications have been cleared.');
  };

  const ButtonComponent = ({ title, onPress, style = {} }) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Test Screen</Text>
        <Text style={styles.subtitle}>
          Permission Status: {permissionGranted ? '✅ Granted' : '❌ Not Granted'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Notifications</Text>
        
        <ButtonComponent
          title="Show Simple Notification"
          onPress={showSimpleNotification}
        />
        
        <ButtonComponent
          title="Show Weather Alert"
          onPress={showWeatherAlert}
          style={styles.alertButton}
        />
        
        <ButtonComponent
          title="Show Daily Forecast"
          onPress={showDailyForecast}
          style={styles.forecastButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
        
        <ButtonComponent
          title="Schedule Notification (5s)"
          onPress={scheduleNotification}
          style={styles.scheduleButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather System Test</Text>
        
        <ButtonComponent
          title="Test Weather Notifications"
          onPress={testWeatherNotifications}
          style={styles.weatherButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        
        <ButtonComponent
          title="Request Permissions"
          onPress={checkPermissions}
          style={styles.permissionButton}
        />
        
        <ButtonComponent
          title="Clear All Notifications"
          onPress={clearAllNotifications}
          style={styles.clearButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Platform: {Platform.OS}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  alertButton: {
    backgroundColor: '#ff6b6b',
  },
  forecastButton: {
    backgroundColor: '#4ecdc4',
  },
  scheduleButton: {
    backgroundColor: '#45b7d1',
  },
  weatherButton: {
    backgroundColor: '#96ceb4',
  },
  permissionButton: {
    backgroundColor: '#feca57',
  },
  clearButton: {
    backgroundColor: '#ff9ff3',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationScreen;