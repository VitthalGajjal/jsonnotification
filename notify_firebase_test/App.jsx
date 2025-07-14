// import React, { useEffect, useState } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
//   TouchableOpacity,
//   Alert,
//   TextInput,
//   Clipboard,
//   Platform,
// } from 'react-native';

// import NotificationService from './service/NotificationService';

// const colors = {
//   primary: '#007bff',
//   secondary: '#6c757d',
//   success: '#28a745',
//   danger: '#dc3545',
//   warning: '#ffc107',
//   info: '#17a2b8',
//   light: '#f8f9fa',
//   dark: '#343a40',
//   white: '#ffffff',
//   black: '#000000',
//   lighter: '#f3f3f3',
//   darker: '#1c1c1c',
//   weather: '#4CAF50',
//   weatherAlert: '#FF9800',
// };

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';
//   const [fcmToken, setFcmToken] = useState('');
//   const [topicName, setTopicName] = useState('test-topic');
//   const [hasPermission, setHasPermission] = useState(false);
//   const [permissionDetails, setPermissionDetails] = useState(null);
//   const [isInitializing, setIsInitializing] = useState(true);
//   const [detailedPermissions, setDetailedPermissions] = useState(null);

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? colors.darker : colors.lighter,
//   };

//   const initializeNotifications = async () => {
//     try {
//       console.log('🚀 Initializing notifications in App...');
//       setIsInitializing(true);
      
//       // Give the service time to initialize (it auto-initializes)
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Check permissions
//       const permission = await NotificationService.checkPermission();
//       setHasPermission(permission);
      
//       // Get detailed permission info
//       const details = await NotificationService.checkNotificationSettings();
//       setPermissionDetails(details);
      
//       // Get detailed push permissions
//       const pushPermissions = await NotificationService.checkDetailedPermissions();
//       setDetailedPermissions(pushPermissions);
      
//       // Get FCM token if permissions are granted
//       if (permission) {
//         const token = await NotificationService.getFCMToken();
//         if (token) {
//           setFcmToken(token);
//           console.log('✅ FCM Token loaded in App');
//         }
        
//         // Subscribe to general topic
//         await NotificationService.subscribeToTopic('general');
//         // Subscribe to weather topic
//         await NotificationService.subscribeToTopic('weather');
//       } else {
//         console.log('⚠️ No permission, requesting...');
//         await handleRequestPermission();
//       }
      
//     } catch (error) {
//       console.error('❌ Error initializing notifications:', error);
//       Alert.alert('Error', 'Failed to initialize notifications');
//     } finally {
//       setIsInitializing(false);
//     }
//   };

//   useEffect(() => {
//     initializeNotifications();
    
//     // Set up notification opened callback
//     NotificationService.setNotificationOpenedCallback((notification) => {
//       console.log('Notification opened in App:', notification);
//       Alert.alert(
//         'Notification Opened',
//         `You opened: ${notification.title || 'Unknown notification'}`,
//         [{ text: 'OK' }]
//       );
//     });
//   }, []);

//   const handleRequestPermission = async () => {
//     try {
//       console.log('🔐 Requesting permissions...');
      
//       // Try the force permission request first
//       const granted = await NotificationService.forcePermissionRequest();
      
//       if (granted) {
//         Alert.alert('Success', 'Notification permissions granted!');
//         // Refresh the app state
//         await initializeNotifications();
//       } else {
//         Alert.alert(
//           'Permission Required',
//           'Notification permissions are required for this app to work properly. Please enable them in your device settings.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Try Again', onPress: handleRequestPermission }
//           ]
//         );
//       }
//     } catch (error) {
//       console.error('❌ Error requesting permission:', error);
//       Alert.alert('Error', 'Failed to request notification permissions');
//     }
//   };

//   const handleGetToken = async () => {
//     try {
//       const token = await NotificationService.getFCMToken();
//       if (token) {
//         setFcmToken(token);
//         Alert.alert('FCM Token', `Token copied to clipboard!\n\n${token.substring(0, 50)}...`);
//         Clipboard.setString(token);
//       } else {
//         Alert.alert('Error', 'Unable to get FCM token. Check if permissions are granted.');
//       }
//     } catch (error) {
//       console.error('❌ Error getting token:', error);
//       Alert.alert('Error', 'Failed to get FCM token');
//     }
//   };

//   const handleCopyToken = () => {
//     if (fcmToken) {
//       Clipboard.setString(fcmToken);
//       Alert.alert('Success', 'FCM Token copied to clipboard');
//     } else {
//       Alert.alert('Error', 'No token available to copy');
//     }
//   };

//   const handleSubscribeToTopic = async () => {
//     if (!topicName.trim()) {
//       Alert.alert('Error', 'Please enter a topic name');
//       return;
//     }
    
//     try {
//       const success = await NotificationService.subscribeToTopic(topicName);
//       if (success) {
//         Alert.alert('Success', `Subscribed to topic: ${topicName}`);
//       } else {
//         Alert.alert('Error', 'Failed to subscribe to topic');
//       }
//     } catch (error) {
//       console.error('❌ Error subscribing to topic:', error);
//       Alert.alert('Error', 'Failed to subscribe to topic');
//     }
//   };

//   const handleUnsubscribeFromTopic = async () => {
//     if (!topicName.trim()) {
//       Alert.alert('Error', 'Please enter a topic name');
//       return;
//     }
    
//     try {
//       const success = await NotificationService.unsubscribeFromTopic(topicName);
//       if (success) {
//         Alert.alert('Success', `Unsubscribed from topic: ${topicName}`);
//       } else {
//         Alert.alert('Error', 'Failed to unsubscribe from topic');
//       }
//     } catch (error) {
//       console.error('❌ Error unsubscribing from topic:', error);
//       Alert.alert('Error', 'Failed to unsubscribe from topic');
//     }
//   };

//   const handleCheckPermission = async () => {
//     try {
//       const permission = await NotificationService.checkPermission();
//       const details = await NotificationService.checkNotificationSettings();
//       const pushPermissions = await NotificationService.checkDetailedPermissions();
      
//       setHasPermission(permission);
//       setPermissionDetails(details);
//       setDetailedPermissions(pushPermissions);
      
//       const message = permission 
//         ? 'Notifications are enabled ✅' 
//         : 'Notifications are disabled ❌';
      
//       Alert.alert('Permission Status', message);
//     } catch (error) {
//       console.error('❌ Error checking permission:', error);
//       Alert.alert('Error', 'Failed to check permission');
//     }
//   };

//   const handleDeleteToken = async () => {
//     try {
//       const success = await NotificationService.deleteToken();
//       if (success) {
//         setFcmToken('');
//         Alert.alert('Success', 'FCM token deleted');
//       } else {
//         Alert.alert('Error', 'Failed to delete FCM token');
//       }
//     } catch (error) {
//       console.error('❌ Error deleting token:', error);
//       Alert.alert('Error', 'Failed to delete FCM token');
//     }
//   };

//   const handleTestNotification = async () => {
//     try {
//       console.log('🧪 === TEST NOTIFICATION BUTTON PRESSED ===');
      
//       // Show loading state
//       Alert.alert('Testing...', 'Preparing test notification...');
      
//       // Check if we have permission first
//       if (!hasPermission) {
//         const shouldRequest = await new Promise(resolve => {
//           Alert.alert(
//             'Permission Required',
//             'Notification permissions are required to show test notifications. Request permission now?',
//             [
//               { text: 'Cancel', onPress: () => resolve(false) },
//               { text: 'Yes', onPress: () => resolve(true) }
//             ]
//           );
//         });
        
//         if (shouldRequest) {
//           await handleRequestPermission();
//           return;
//         } else {
//           return;
//         }
//       }
      
//       // Show the test notification
//       const success = await NotificationService.showTestNotification();
      
//       if (success) {
//         Alert.alert(
//           'Test Notification Sent! 🧪',
//           'Check your notification panel. You should see test notifications appear shortly including:\n\n• Regular test notification\n• Weather alert test\n• Daily forecast test\n\nIf no notifications appear, check the console logs for troubleshooting information.',
//           [
//             { text: 'Check Console', onPress: () => console.log('📋 Check Metro console for detailed logs') },
//             { text: 'OK', style: 'default' }
//           ]
//         );
//       } else {
//         Alert.alert('Error', 'Failed to show test notification');
//       }
      
//     } catch (error) {
//       console.error('❌ Error showing test notification:', error);
//       Alert.alert('Error', `Failed to show test notification: ${error.message}`);
//     }
//   };

//   const handleTestWeatherAlert = async () => {
//     try {
//       if (!hasPermission) {
//         Alert.alert('Error', 'Notification permissions required');
//         return;
//       }

//       NotificationService.showWeatherAlert(
//         '🌦️ Weather Alert',
//         'Severe thunderstorm warning! Heavy rain expected in the next 2 hours.',
//         'high'
//       );
      
//       Alert.alert('Weather Alert Sent!', 'Check your notification panel for the weather alert.');
//     } catch (error) {
//       console.error('❌ Error showing weather alert:', error);
//       Alert.alert('Error', 'Failed to show weather alert');
//     }
//   };

//   const handleTestDailyForecast = async () => {
//     try {
//       if (!hasPermission) {
//         Alert.alert('Error', 'Notification permissions required');
//         return;
//       }

//       NotificationService.showDailyForecast(
//         '☀️ Daily Forecast',
//         'Today: Sunny with highs of 28°C. Tomorrow: Partly cloudy, 25°C. Light winds throughout the week.'
//       );
      
//       Alert.alert('Daily Forecast Sent!', 'Check your notification panel for the daily forecast.');
//     } catch (error) {
//       console.error('❌ Error showing daily forecast:', error);
//       Alert.alert('Error', 'Failed to show daily forecast');
//     }
//   };

//   const handleClearNotifications = () => {
//     NotificationService.clearAllNotifications();
//     Alert.alert('Success', 'All notifications cleared');
//   };

//   const handleCancelScheduledNotifications = () => {
//     NotificationService.cancelScheduledNotifications();
//     Alert.alert('Success', 'All scheduled notifications cancelled');
//   };

//   const getPermissionStatusText = () => {
//     if (isInitializing) return '🔄 Initializing...';
//     if (!hasPermission) return '❌ Denied';
//     return '✅ Granted';
//   };

//   const getPermissionStatusColor = () => {
//     if (isInitializing) return colors.info;
//     if (!hasPermission) return colors.danger;
//     return colors.success;
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}
//         contentContainerStyle={styles.container}>
        
//         <View style={styles.header}>
//           <Text style={styles.title}>FCM Notification Test</Text>
//           <Text style={[styles.subtitle, { color: getPermissionStatusColor() }]}>
//             Permission: {getPermissionStatusText()}
//           </Text>
//           <Text style={styles.platformInfo}>
//             Platform: {Platform.OS} {Platform.Version}
//           </Text>
//         </View>

//         {/* Permission Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>🔐 Permissions</Text>
          
//           {!hasPermission && (
//             <TouchableOpacity
//               style={[styles.button, styles.permissionButton]}
//               onPress={handleRequestPermission}>
//               <Text style={styles.buttonText}>Request Permissions</Text>
//             </TouchableOpacity>
//           )}
          
//           <TouchableOpacity
//             style={[styles.button, styles.checkButton]}
//             onPress={handleCheckPermission}>
//             <Text style={styles.buttonText}>Check Permissions</Text>
//           </TouchableOpacity>
          
//           {permissionDetails && (
//             <View style={styles.permissionDetails}>
//               <Text style={styles.detailsTitle}>Permission Details:</Text>
//               <Text style={styles.detailsText}>
//                 FCM: {permissionDetails.fcmPermission || 'Unknown'}{'\n'}
//                 Device Registered: {permissionDetails.isRegistered ? 'Yes' : 'No'}{'\n'}
//                 Push Alert: {permissionDetails.pushPermissions?.alert ? 'Yes' : 'No'}{'\n'}
//                 Push Sound: {permissionDetails.pushPermissions?.sound ? 'Yes' : 'No'}{'\n'}
//                 Push Badge: {permissionDetails.pushPermissions?.badge ? 'Yes' : 'No'}
//               </Text>
//             </View>
//           )}

//           {detailedPermissions && (
//             <View style={styles.permissionDetails}>
//               <Text style={styles.detailsTitle}>Detailed Push Permissions:</Text>
//               <Text style={styles.detailsText}>
//                 Alert: {detailedPermissions.alert ? 'Yes' : 'No'}{'\n'}
//                 Sound: {detailedPermissions.sound ? 'Yes' : 'No'}{'\n'}
//                 Badge: {detailedPermissions.badge ? 'Yes' : 'No'}{'\n'}
//                 Critical Alert: {detailedPermissions.criticalAlert ? 'Yes' : 'No'}{'\n'}
//                 Car Play: {detailedPermissions.carPlay ? 'Yes' : 'No'}
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Test Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>🧪 Test Notifications</Text>
          
//           <TouchableOpacity
//             style={[styles.button, styles.testButton]}
//             onPress={handleTestNotification}>
//             <Text style={styles.buttonText}>Show All Test Notifications</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={[styles.button, styles.clearButton]}
//             onPress={handleClearNotifications}>
//             <Text style={styles.buttonText}>Clear All Notifications</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.button, styles.cancelButton]}
//             onPress={handleCancelScheduledNotifications}>
//             <Text style={styles.buttonText}>Cancel Scheduled Notifications</Text>
//           </TouchableOpacity>
          
//           <Text style={styles.testDescription}>
//             The test notification will appear in your notification panel if permissions are granted and the service is configured correctly.
//           </Text>
//         </View>

//         {/* Weather Notifications Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>🌤️ Weather Notifications</Text>
          
//           <TouchableOpacity
//             style={[styles.button, styles.weatherAlertButton]}
//             onPress={handleTestWeatherAlert}>
//             <Text style={styles.buttonText}>Test Weather Alert</Text>
//           </TouchableOpacity>
          
          
          
//           <Text style={styles.testDescription}>
//             Weather notifications use dedicated channels for better organization and different priority levels.
//           </Text>
//         </View>

//         {/* FCM Token Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>🔑 FCM Token</Text>
          
//           <View style={styles.tokenContainer}>
//             <Text style={styles.token} numberOfLines={3}>
//               {fcmToken || 'No token available'}
//             </Text>
//             <View style={styles.tokenButtons}>
//               <TouchableOpacity style={styles.button} onPress={handleGetToken}>
//                 <Text style={styles.buttonText}>Get Token</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.button, styles.copyButton]}
//                 onPress={handleCopyToken}
//                 disabled={!fcmToken}>
//                 <Text style={styles.buttonText}>Copy</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Topic Management Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>📡 Topic Management</Text>
          
//           <TextInput
//             style={styles.input}
//             placeholder="Enter topic name"
//             value={topicName}
//             onChangeText={setTopicName}
//             placeholderTextColor={isDarkMode ? colors.light : colors.dark}
//           />
          
//           <View style={styles.topicButtons}>
//             <TouchableOpacity
//               style={[styles.button, styles.subscribeButton]}
//               onPress={handleSubscribeToTopic}>
//               <Text style={styles.buttonText}>Subscribe</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.unsubscribeButton]}
//               onPress={handleUnsubscribeFromTopic}>
//               <Text style={styles.buttonText}>Unsubscribe</Text>
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.testDescription}>
//             You're automatically subscribed to 'general' and 'weather' topics. Use this to test other topics.
//           </Text>
//         </View>

//         {/* Actions Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>⚙️ Actions</Text>
          
//           <TouchableOpacity
//             style={[styles.button, styles.deleteButton]}
//             onPress={handleDeleteToken}>
//             <Text style={styles.buttonText}>Delete Token</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Instructions Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>📋 How to Test</Text>
//           <Text style={styles.instruction}>
//             1. First, click "Show All Test Notifications" to verify local notifications work{'\n'}
//             2. Test weather-specific notifications separately{'\n'}
//             3. Copy the FCM token above{'\n'}
//             4. Use Firebase Console or a testing tool{'\n'}
//             5. Send a test notification to this token{'\n'}
//             6. Or subscribe to topics like 'general' or 'weather' and send to those topics{'\n'}
//             7. Check console logs for debugging information{'\n'}
//             8. Tap notifications to see popup alerts
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 16,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: colors.primary,
//   },
//   subtitle: {
//     fontSize: 16,
//     marginTop: 8,
//     fontWeight: '600',
//   },
//   platformInfo: {
//     fontSize: 12,
//     color: colors.secondary,
//     marginTop: 4,
//   },
//   section: {
//     marginBottom: 24,
//     padding: 16,
//     backgroundColor: colors.white,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     color: colors.dark,
//   },
//   tokenContainer: {
//     marginBottom: 12,
//   },
//   token: {
//     fontSize: 12,
//     color: colors.dark,
//     backgroundColor: colors.lighter,
//     padding: 12,
//     borderRadius: 4,
//     marginBottom: 8,
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//   },
//   tokenButtons: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   button: {
//     backgroundColor: colors.primary,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: 'center',
//     flex: 1,
//     marginBottom: 8,
//   },
//   buttonText: {
//     color: colors.white,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   copyButton: {
//     backgroundColor: colors.info,
//   },
//   permissionButton: {
//     backgroundColor: colors.warning,
//   },
//   checkButton: {
//     backgroundColor: colors.info,
//   },
//   testButton: {
//     backgroundColor: '#9c27b0', // Purple color for test button
//   },
//   clearButton: {
//     backgroundColor: colors.secondary,
//   },
//   cancelButton: {
//     backgroundColor: '#795548', // Brown color for cancel button
//   },
//   weatherAlertButton: {
//     backgroundColor: colors.weatherAlert,
//   },
//   weatherForecastButton: {
//     backgroundColor: colors.weather,
//   },
//   subscribeButton: {
//     backgroundColor: colors.success,
//   },
//   unsubscribeButton: {
//     backgroundColor: colors.danger,
//   },
//   deleteButton: {
//     backgroundColor: colors.danger,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.light,
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 12,
//     fontSize: 16,
//     color: colors.dark,
//     backgroundColor: colors.white,
//   },
//   topicButtons: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   permissionDetails: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: colors.lighter,
//     borderRadius: 6,
//   },
//   detailsTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: colors.dark,
//     marginBottom: 8,
//   },
//   detailsText: {
//     fontSize: 12,
//     color: colors.secondary,
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//     lineHeight: 16,
//   },
//   testDescription: {
//     fontSize: 12,
//     color: colors.secondary,
//     fontStyle: 'italic',
//     lineHeight: 16,
//     marginTop: 8,
//   },
//   instruction: {
//     fontSize: 14,
//     color: colors.dark,
//     lineHeight: 20,
//   },
// });

// export default App;



// import React from 'react';
// import {
//   SafeAreaView,
//   StatusBar,
//   StyleSheet,
// } from 'react-native';
// import NotificationScreen from './json_test_notification/NotificationScreen';
// import ConnectionTest from './json_test_notification/ConnectionTest'; 

// const App = () => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <NotificationScreen />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
// });

// export default App;
/**
 * React Native CLI Notification App
 * 
 * @format
 */

import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';

import NotificationScreen from './json_test_notification/NotificationScreen';
import NotificationService from './json_test_notification/NotificationService';

const App = () => {
  useEffect(() => {
    console.log('🚀 App started');
    console.log('📱 Platform:', Platform.OS);
    console.log('🔔 Notification service initialized');
    
    // Test notification service initialization
    setTimeout(() => {
      console.log('🧪 Running delayed initialization test');
      testNotificationService();
    }, 2000);
  }, []);

  const testNotificationService = async () => {
    try {
      console.log('🔍 Testing notification service...');
      
      // Request permissions
      const permissions = await NotificationService.requestPermissions();
      console.log('✅ Permissions result:', permissions);
      
      if (permissions.alert) {
        console.log('🎉 Notification permissions granted');
      } else {
        console.warn('⚠️ Notification permissions not granted');
        Alert.alert(
          'Permissions Required',
          'This app needs notification permissions to work properly. Please enable them in your device settings.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Error testing notification service:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#007AFF"
        translucent={false}
      />
      <View style={styles.appContainer}>
        <NotificationScreen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  appContainer: {
    flex: 1,
  },
});

export default App;