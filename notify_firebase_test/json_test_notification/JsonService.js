// Replace YOUR_IP_ADDRESS with your actual IP address
// Find your IP: Windows (ipconfig) | Mac/Linux (ifconfig)
const BASE_URL = 'http://192.168.253.18:3000'; // UPDATE THIS WITH YOUR IP

class JsonService {
  
  /**
   * Get the base URL for debugging
   */
  static getBaseUrl() {
    return BASE_URL;
  }

  /**
   * Test connection to JSON server
   */
  static async testConnection() {
    console.log('🔗 JsonService.testConnection() - Starting...');
    try {
      console.log('🌐 Testing connection to:', `${BASE_URL}/notifications`);
      
      const response = await fetch(`${BASE_URL}/notifications`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Connection test successful:', data);
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Send notification to JSON server
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {string} type - Notification type ('local' or 'scheduled')
   * @param {string} time - Scheduled time (ISO string) for scheduled notifications
   */
  static async sendNotification(title, body, type = 'local', time = null) {
    console.log('📤 JsonService.sendNotification() - Starting...');
    console.log('📝 Title:', title);
    console.log('📝 Body:', body);
    console.log('📝 Type:', type);
    console.log('📝 Time:', time);
    
    const notificationData = {
      title: title,
      body: body,
      type: type,
      time: time,
      notified: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔄 Preparing to POST to:', `${BASE_URL}/notifications`);
    console.log('📦 Payload:', JSON.stringify(notificationData, null, 2));
    
    try {
      console.log('🌐 Making fetch request...');
      
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ JsonService.sendNotification() - Success!');
      console.log('📋 Response data:', JSON.stringify(data, null, 2));
      
      return data;
      
    } catch (error) {
      console.error('❌ JsonService.sendNotification() - Error occurred:');
      console.error('🔥 Error message:', error.message);
      console.error('🔥 Error stack:', error.stack);
      throw error;
    }
  }
  
  /**
   * Get the latest notification from JSON server
   */
  static async getLatestNotification() {
    console.log('📥 JsonService.getLatestNotification() - Starting...');
    console.log('🔄 Preparing to GET from:', `${BASE_URL}/notifications`);
    
    try {
      console.log('🌐 Making fetch request...');
      
      const response = await fetch(`${BASE_URL}/notifications?_sort=id&_order=desc&_limit=1`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ No notifications found');
          return null;
        }
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const notifications = await response.json();
      const latestNotification = notifications.length > 0 ? notifications[0] : null;
      console.log('✅ JsonService.getLatestNotification() - Success!');
      console.log('🎯 Latest notification:', JSON.stringify(latestNotification, null, 2));
      
      return latestNotification;
      
    } catch (error) {
      console.error('❌ JsonService.getLatestNotification() - Error occurred:');
      console.error('🔥 Error message:', error.message);
      console.error('🔥 Error stack:', error.stack);
      throw error;
    }
  }
  
  /**
   * Get all notifications from JSON server
   */
  static async getAllNotifications() {
    console.log('📥 JsonService.getAllNotifications() - Starting...');
    console.log('🔄 Preparing to GET from:', `${BASE_URL}/notifications`);
    
    try {
      console.log('🌐 Making fetch request...');
      
      const response = await fetch(`${BASE_URL}/notifications`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const notifications = await response.json();
      console.log('✅ JsonService.getAllNotifications() - Success!');
      console.log('📋 Total notifications:', notifications.length);
      
      return notifications;
      
    } catch (error) {
      console.error('❌ JsonService.getAllNotifications() - Error occurred:');
      console.error('🔥 Error message:', error.message);
      console.error('🔥 Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Update notification status (e.g., mark as notified)
   */
  static async updateNotification(notificationId, updates) {
    console.log(`🔄 JsonService.updateNotification() - Starting for ID: ${notificationId}`);
    console.log('📝 Updates:', JSON.stringify(updates, null, 2));
    
    try {
      console.log('🌐 Making PATCH request...');
      
      const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ JsonService.updateNotification() - Success!');
      console.log('📋 Updated notification:', JSON.stringify(data, null, 2));
      
      return data;
      
    } catch (error) {
      console.error('❌ JsonService.updateNotification() - Error occurred:');
      console.error('🔥 Error message:', error.message);
      console.error('🔥 Error stack:', error.stack);
      throw error;
    }
  }
}

export default JsonService;