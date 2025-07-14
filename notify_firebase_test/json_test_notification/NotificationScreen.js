
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import JsonService from './JsonService';
import NotificationService from './NotificationService';

const NotificationScreen = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('local');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not tested');
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    console.log('🎯 NotificationScreen mounted');
    testConnection();
    requestNotificationPermissions();
  }, []);

  const testConnection = async () => {
    console.log('🔍 Testing JSON server connection...');
    try {
      const isConnected = await JsonService.testConnection();
      setConnectionStatus(isConnected ? 'Connected ✅' : 'Failed ❌');
      console.log('🔗 Connection status:', isConnected ? 'Connected' : 'Failed');
    } catch (error) {
      console.error('❌ Connection test error:', error);
      setConnectionStatus('Error ❌');
    }
  };

  const requestNotificationPermissions = async () => {
    console.log('🔐 Requesting notification permissions...');
    try {
      const permissions = await NotificationService.requestPermissions();
      console.log('✅ Permissions granted:', permissions);
    } catch (error) {
      console.error('❌ Permission request failed:', error);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`📝 Input change - ${field}:`, value);
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'body':
        setBody(value);
        break;
      case 'type':
        setType(value);
        break;
      default:
        console.warn('⚠️ Unknown field:', field);
    }
  };

  const handleDateTimeChange = (event, selectedDate) => {
    console.log('📅 Date/Time picker event:', event?.type, 'Mode:', datePickerMode);
    
    // Handle dismissal properly
    if (event?.type === 'dismissed') {
      console.log('❌ Date/Time picker dismissed');
      setShowDatePicker(false);
      setShowTimePicker(false);
      return;
    }

    if (event?.type === 'set' && selectedDate) {
      console.log('📅 Selected date/time:', selectedDate, 'Mode:', datePickerMode);
      
      if (datePickerMode === 'date') {
        setScheduledDate(selectedDate);
        console.log('📅 Date set:', selectedDate);
      } else if (datePickerMode === 'time') {
        setScheduledTime(selectedDate);
        console.log('⏰ Time set:', selectedDate);
      }
    }
    
    // Close the picker
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const showDatePickerModal = () => {
    console.log('📅 Opening date picker');
    try {
      setDatePickerMode('date');
      setShowDatePicker(true);
    } catch (error) {
      console.error('❌ Error opening date picker:', error);
      Alert.alert('Error', 'Could not open date picker');
    }
  };

  const showTimePickerModal = () => {
    console.log('⏰ Opening time picker');
    try {
      setDatePickerMode('time');
      setShowTimePicker(true);
    } catch (error) {
      console.error('❌ Error opening time picker:', error);
      Alert.alert('Error', 'Could not open time picker');
    }
  };

  const getCombinedDateTime = () => {
    // Combine the selected date and time
    const combined = new Date(scheduledDate);
    combined.setHours(scheduledTime.getHours());
    combined.setMinutes(scheduledTime.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const validateForm = () => {
    console.log('✅ Validating form...');
    console.log('📝 Title:', title);
    console.log('📝 Body:', body);
    console.log('📝 Type:', type);
    console.log('📝 Scheduled date:', scheduledDate);
    console.log('📝 Scheduled time:', scheduledTime);
    
    if (!title.trim()) {
      console.log('❌ Title is required');
      Alert.alert('Validation Error', 'Please enter a title');
      return false;
    }
    
    if (!body.trim()) {
      console.log('❌ Body is required');
      Alert.alert('Validation Error', 'Please enter a body message');
      return false;
    }
    
    if (type === 'scheduled') {
      const combinedDateTime = getCombinedDateTime();
      console.log('📅 Combined date/time:', combinedDateTime);
      
      if (combinedDateTime <= new Date()) {
        console.log('❌ Scheduled time must be in the future');
        Alert.alert('Validation Error', 'Scheduled date and time must be in the future');
        return false;
      }
    }
    
    console.log('✅ Form validation passed');
    return true;
  };

  const handleSubmit = async () => {
    console.log('📤 Form submission started');
    console.log('📝 Form data:', { title, body, type, scheduledDate, scheduledTime });
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('📡 Sending notification to JSON server...');
      
      // Prepare data for server
      const combinedDateTime = getCombinedDateTime();
      const timeISO = type === 'scheduled' ? combinedDateTime.toISOString() : null;
      console.log('📅 Combined DateTime ISO:', timeISO);
      
      // Send to JSON server
      const response = await JsonService.sendNotification(title, body, type, timeISO);
      console.log('✅ Server response:', response);
      
      // Handle notification based on type
      if (type === 'local') {
        console.log('🔔 Showing local notification immediately');
        NotificationService.showLocalNotification(title, body, 'high-priority-channel');
      } else if (type === 'scheduled') {
        console.log('⏰ Scheduling notification for:', combinedDateTime);
        NotificationService.scheduleNotification(title, body, combinedDateTime, 'high-priority-channel');
      }
      
      // Reset form
      console.log('🔄 Resetting form');
      setTitle('');
      setBody('');
      setType('local');
      setScheduledDate(new Date());
      setScheduledTime(new Date());
      
      console.log('🎉 Notification submitted successfully');
      Alert.alert('Success', 'Notification submitted successfully!');
      
    } catch (error) {
      console.error('❌ Error submitting notification:', error);
      Alert.alert('Error', `Failed to submit notification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    console.log('📤 Manual send notification triggered');
    
    try {
      setLoading(true);
      console.log('📥 Fetching latest notification from server...');
      
      const notification = await JsonService.getLatestNotification();
      
      if (!notification) {
        console.log('⚠️ No notifications found');
        Alert.alert('No Notifications', 'No notifications found on server');
        return;
      }
      
      console.log('📋 Latest notification:', notification);
      setLatestNotification(notification);
      
      // Check if notification should be sent
      if (notification.type === 'local' && notification.notified === true) {
        console.log('🔔 Sending local notification');
        NotificationService.showLocalNotification(
          notification.title,
          notification.body,
          'high-priority-channel'
        );
        
        // Update server to mark as notified
        await JsonService.updateNotification(notification.id, { notified: false });
        console.log('✅ Notification status updated on server');
        
      } else if (notification.type === 'scheduled' && notification.notified === true) {
        console.log('⏰ Scheduling notification');
        
        if (!notification.time) {
          console.error('❌ No scheduled time found');
          Alert.alert('Error', 'No scheduled time found for this notification');
          return;
        }
        
        const scheduledDate = new Date(notification.time);
        console.log('📅 Parsed scheduled date:', scheduledDate);
        
        if (scheduledDate <= new Date()) {
          console.log('⚠️ Scheduled time is in the past, showing immediately');
          NotificationService.showLocalNotification(
            notification.title,
            notification.body,
            'high-priority-channel'
          );
        } else {
          console.log('⏰ Scheduling for future time');
          NotificationService.scheduleNotification(
            notification.title,
            notification.body,
            scheduledDate,
            'high-priority-channel'
          );
        }
        
        // Update server to mark as notified
        await JsonService.updateNotification(notification.id, { notified: false });
        console.log('✅ Notification scheduled and status updated');
        
      } else {
        console.log('⚠️ Notification already processed or invalid');
        Alert.alert('Info', 'Notification already processed or invalid');
      }
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      Alert.alert('Error', `Failed to send notification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = () => {
    console.log('🧪 Sending test notification');
    try {
      NotificationService.testNotification();
      Alert.alert('Test Sent', 'Test notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderScheduledTimeInput = () => {
    if (type !== 'scheduled') return null;

    const combinedDateTime = getCombinedDateTime();

    return (
      <View style={styles.scheduledTimeContainer}>
        <Text style={styles.label}>Scheduled Date & Time:</Text>
        
        {/* Date Picker Button */}
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={showDatePickerModal}
        >
          <Text style={styles.dateTimeText}>
            Date: {scheduledDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {/* Time Picker Button */}
        <TouchableOpacity
          style={[styles.dateTimeButton, { marginTop: 10 }]}
          onPress={showTimePickerModal}
        >
          <Text style={styles.dateTimeText}>
            Time: {scheduledTime.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>

        {/* Combined DateTime Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Scheduled for:</Text>
          <Text style={styles.previewText}>
            {combinedDateTime.toLocaleString()}
          </Text>
          <Text style={styles.previewSubText}>
            {combinedDateTime > new Date() ? '✅ Valid future time' : '❌ Must be in the future'}
          </Text>
        </View>
        
        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            is24Hour={false}
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={handleDateTimeChange}
            minimumDate={new Date()}
            onError={(error) => {
              console.error('❌ DatePicker error:', error);
              setShowDatePicker(false);
            }}
          />
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={handleDateTimeChange}
            onError={(error) => {
              console.error('❌ TimePicker error:', error);
              setShowTimePicker(false);
            }}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification System</Text>
        <Text style={styles.subtitle}>React Native CLI Notification using JSON Server</Text>
        <Text style={styles.connectionStatus}>
          Server Status: {connectionStatus}
        </Text>
        <TouchableOpacity style={styles.testConnectionButton} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Create Notification</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter notification title"
            value={title}
            onChangeText={(text) => handleInputChange('title', text)}
            maxLength={100}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Body:</Text>
          <TextInput
            style={[styles.input, styles.bodyInput]}
            placeholder="Enter notification body"
            value={body}
            onChangeText={(text) => handleInputChange('body', text)}
            multiline
            maxLength={500}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => handleInputChange('type', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Local (Instant)" value="local" />
              <Picker.Item label="Scheduled (Delayed)" value="scheduled" />
            </Picker>
          </View>
        </View>

        {renderScheduledTimeInput()}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.sendButton]}
          onPress={handleSendNotification}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Send Notification'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.testButton]}
          onPress={handleTestNotification}
        >
          <Text style={styles.buttonText}>Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={() => setTestModalVisible(true)}
        >
          <Text style={styles.buttonText}>Show Debug Info</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Debug Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={testModalVisible}
        onRequestClose={() => setTestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔍 Debug Information</Text>
            
            <ScrollView style={styles.debugScroll}>
              <Text style={styles.debugText}>
                <Text style={styles.debugLabel}>Server URL:</Text> {JsonService.getBaseUrl()}
              </Text>
              <Text style={styles.debugText}>
                <Text style={styles.debugLabel}>Connection Status:</Text> {connectionStatus}
              </Text>
              <Text style={styles.debugText}>
                <Text style={styles.debugLabel}>Platform:</Text> {Platform.OS}
              </Text>
              <Text style={styles.debugText}>
                <Text style={styles.debugLabel}>Scheduled Date:</Text> {scheduledDate.toLocaleString()}
              </Text>
              <Text style={styles.debugText}>
                <Text style={styles.debugLabel}>Scheduled Time:</Text> {scheduledTime.toLocaleString()}
              </Text>
              <Text style={styles.debugText}>
                <Text style={styles.debugLabel}>Combined DateTime:</Text> {getCombinedDateTime().toLocaleString()}
              </Text>
              
              {latestNotification && (
                <>
                  <Text style={styles.debugSection}>Latest Notification:</Text>
                  <Text style={styles.debugText}>
                    {JSON.stringify(latestNotification, null, 2)}
                  </Text>
                </>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTestModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  connectionStatus: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  testConnectionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  bodyInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  scheduledTimeContainer: {
    marginBottom: 15,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#34C759',
  },
  testButton: {
    backgroundColor: '#FF9500',
  },
  infoButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  debugScroll: {
    maxHeight: 400,
  },
  debugText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  debugLabel: {
    fontWeight: 'bold',
  },
  debugSection: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  previewContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  previewText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 3,
  },
  previewSubText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
});

export default NotificationScreen;