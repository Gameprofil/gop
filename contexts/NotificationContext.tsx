import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Konfiguracja powiadomień
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  mentions: boolean;
  market: boolean;
  system: boolean;
}

interface NotificationContextType {
  notificationCount: number;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotificationCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    mentions: true,
    market: true,
    system: true,
  });

  useEffect(() => {
    registerForPushNotifications();
    loadNotificationSettings();
    refreshNotificationCount();
  }, []);

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'web') return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Only for native platforms
      if (Platform.OS !== 'web') {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo push token:', token);
        
        // Save token to backend
        const authToken = await AsyncStorage.getItem('token');
        if (authToken) {
          await fetch('https://game-p.onrender.com/api/notifications/register-device', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pushToken: token }),
          });
        }
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settingsString = await AsyncStorage.getItem('notificationSettings');
      if (settingsString) {
        const settings = JSON.parse(settingsString);
        setNotificationSettings(settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    try {
      const newSettings = { ...notificationSettings, ...settings };
      setNotificationSettings(newSettings);
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      
      // Update on backend
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetch('https://game-p.onrender.com/api/notifications/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ settings: newSettings }),
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const sendLocalNotification = async (title: string, body: string, data: any = {}) => {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetch('https://game-p.onrender.com/api/notifications/read-all', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotificationCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch('https://game-p.onrender.com/api/notifications/count', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.count);
        } else {
          // Mock data
          setNotificationCount(3);
        }
      }
    } catch (error) {
      console.error('Error refreshing notification count:', error);
    }
  };

  const value: NotificationContextType = {
    notificationCount,
    notificationSettings,
    updateNotificationSettings,
    sendLocalNotification,
    markAllAsRead,
    refreshNotificationCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};