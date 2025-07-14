

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import JsonService from './JsonService';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🧪 Test Result - ${test}: ${result} - ${details}`);
    setTestResults(prev => [...prev, { test, result, details, timestamp }]);
  };

  const testConnection = async () => {
    console.log('🔍 Starting connection test');
    setIsLoading(true);
    setStatus('Testing...');
    setTestResults([]);
    
    try {
      const baseUrl = JsonService.getBaseUrl();
      console.log(`🌐 Testing connection to: ${baseUrl}`);
      addTestResult('Base URL', 'INFO', baseUrl);
      
      // Test 1: Health check
      addTestResult('Health Check', 'TESTING', 'Checking server health...');
      const isConnected = await JsonService.testConnection();
      
      if (isConnected) {
        addTestResult('Health Check', 'PASS', 'Server is responding');
        console.log('✅ Server health check passed');
        
        // Test 2: Get notifications
        addTestResult('Get Notifications', 'TESTING', 'Fetching notifications...');
        try {
          const notifications = await JsonService.getNotifications();
          addTestResult('Get Notifications', 'PASS', `Found ${notifications.length} notifications`);
          console.log(`✅ Notifications test passed: ${notifications.length} items`);
        } catch (error) {
          addTestResult('Get Notifications', 'FAIL', error.message);
          console.error('❌ Notifications test failed:', error);
        }
        
        // Test 3: Get unread count
        addTestResult('Unread Count', 'TESTING', 'Getting unread count...');
        try {
          const count = await JsonService.getUnreadCount();
          addTestResult('Unread Count', 'PASS', `Unread count: ${count}`);
          console.log(`✅ Unread count test passed: ${count}`);
        } catch (error) {
          addTestResult('Unread Count', 'FAIL', error.message);
          console.error('❌ Unread count test failed:', error);
        }
        
        // Test 4: Send test notification
        addTestResult('Send Notification', 'TESTING', 'Sending test notification...');
        try {
          const result = await JsonService.sendNotification(
            'Connection Test',
            'This is a connection test notification',
            'test'
          );
          addTestResult('Send Notification', 'PASS', 'Notification sent successfully');
          console.log('✅ Send notification test passed:', result);
        } catch (error) {
          addTestResult('Send Notification', 'FAIL', error.message);
          console.error('❌ Send notification test failed:', error);
        }
        
        setStatus('✅ All tests completed - Server is working!');
        console.log('🎉 All connection tests completed successfully');
      } else {
        addTestResult('Health Check', 'FAIL', 'Server not responding');
        setStatus('❌ Connection failed - Server not accessible');
        console.error('❌ Server health check failed');
      }
    } catch (error) {
      addTestResult('Connection Test', 'ERROR', error.message);
      setStatus(`❌ Error: ${error.message}`);
      console.error('❌ Connection test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'PASS': return '#4CAF50';
      case 'FAIL': return '#f44336';
      case 'ERROR': return '#ff5722';
      case 'TESTING': return '#ff9800';
      case 'INFO': return '#2196F3';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Server Connection Test</Text>
        <Text style={styles.url}>URL: {JsonService.getBaseUrl()}</Text>
        <Text style={styles.status}>Status: {status}</Text>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Run Full Test'}
          </Text>
        </TouchableOpacity>
      </View>

      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={[styles.resultStatus, { color: getResultColor(result.result) }]}>
                  {result.result}
                </Text>
              </View>
              {result.details && (
                <Text style={styles.resultDetails}>{result.details}</Text>
              )}
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
          ))}
        </View>
      )}
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
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  url: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  status: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultTest: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  resultTime: {
    fontSize: 10,
    color: '#999',
  },
});

export default ConnectionTest;