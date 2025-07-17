import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, MessageCircle, User, Bell, Share, ShoppingCart, Eye, AtSign, Ticket, Filter, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Konfiguracja powiadomień
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'market' | 'registration' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data: {
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
    targetId?: string;
    targetType?: string;
  };
}

interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  mentions: boolean;
  market: boolean;
  system: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    mentions: true,
    market: true,
    system: true
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (activeFilter) {
      setFilteredNotifications(notifications.filter(n => n.type === activeFilter));
    } else {
      setFilteredNotifications(notifications);
    }
  }, [notifications, activeFilter]);

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Powiadomienia',
          'Aby otrzymywać powiadomienia, włącz je w ustawieniach urządzenia'
        );
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Błąd', 'Musisz być zalogowany, aby zobaczyć powiadomienia');
        router.back();
        return;
      }

      const response = await fetch('https://game-p.onrender.com/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else {
        // Mock data for development
        setNotifications([
          {
            id: '1',
            type: 'like',
            title: 'Nowe polubienie',
            message: 'Robert Lewandowski polubił Twój post',
            timestamp: '2 godz. temu',
            isRead: false,
            data: {
              senderId: '1',
              senderName: 'Robert Lewandowski',
              senderAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              targetId: 'post-123',
              targetType: 'post'
            }
          },
          {
            id: '2',
            type: 'comment',
            title: 'Nowy komentarz',
            message: 'Piotr Zieliński skomentował Twój post: "Świetny mecz!"',
            timestamp: '3 godz. temu',
            isRead: true,
            data: {
              senderId: '2',
              senderName: 'Piotr Zieliński',
              senderAvatar: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              targetId: 'post-123',
              targetType: 'post'
            }
          },
          {
            id: '3',
            type: 'follow',
            title: 'Nowy obserwujący',
            message: 'Wojciech Szczęsny zaczął Cię obserwować',
            timestamp: '1 dzień temu',
            isRead: false,
            data: {
              senderId: '3',
              senderName: 'Wojciech Szczęsny',
              senderAvatar: 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              targetId: 'user-123',
              targetType: 'user'
            }
          },
          {
            id: '4',
            type: 'message',
            title: 'Nowa wiadomość',
            message: 'Michał Nowak: Cześć, jak się masz?',
            timestamp: '5 godz. temu',
            isRead: true,
            data: {
              senderId: '4',
              senderName: 'Michał Nowak',
              senderAvatar: 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              targetId: 'conversation-123',
              targetType: 'conversation'
            }
          },
          {
            id: '5',
            type: 'mention',
            title: 'Wzmianka',
            message: 'Jakub Wójcik wspomniał o Tobie w komentarzu',
            timestamp: '2 dni temu',
            isRead: true,
            data: {
              senderId: '5',
              senderName: 'Jakub Wójcik',
              senderAvatar: 'https://images.pexels.com/photos/1222275/pexels-photo-1222275.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              targetId: 'comment-123',
              targetType: 'comment'
            }
          },
          {
            id: '6',
            type: 'market',
            title: 'Aktywność na rynku',
            message: 'Twój obserwowany gracz zmienił cenę: Robert Lewandowski',
            timestamp: '3 dni temu',
            isRead: false,
            data: {
              targetId: 'player-123',
              targetType: 'player'
            }
          },
          {
            id: '7',
            type: 'registration',
            title: 'Kod rejestracyjny',
            message: 'Twój kod rejestracyjny: GAME2024',
            timestamp: '1 tydzień temu',
            isRead: true,
            data: {
              targetType: 'registration'
            }
          },
          {
            id: '8',
            type: 'system',
            title: 'Aktualizacja systemu',
            message: 'Nowa wersja aplikacji jest dostępna. Zaktualizuj teraz!',
            timestamp: '2 tygodnie temu',
            isRead: true,
            data: {
              targetType: 'system'
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać powiadomień');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('https://game-p.onrender.com/api/notifications/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      await fetch(`https://game-p.onrender.com/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      await fetch('https://game-p.onrender.com/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      Alert.alert('Sukces', 'Wszystkie powiadomienia oznaczone jako przeczytane');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Błąd', 'Nie udało się oznaczyć powiadomień jako przeczytane');
    }
  };

  const updateNotificationSetting = async (type: keyof NotificationSettings, value: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const newSettings = { ...notificationSettings, [type]: value };
      setNotificationSettings(newSettings);

      await fetch('https://game-p.onrender.com/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Błąd', 'Nie udało się zaktualizować ustawień powiadomień');
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        router.push({
          pathname: '/post-detail',
          params: { postId: notification.data.targetId }
        });
        break;
      case 'follow':
        router.push({
          pathname: '/player-detail',
          params: { playerId: notification.data.senderId }
        });
        break;
      case 'message':
        router.push({
          pathname: '/messages',
          params: { conversationId: notification.data.targetId }
        });
        break;
      case 'mention':
        router.push({
          pathname: '/post-detail',
          params: { postId: notification.data.targetId }
        });
        break;
      case 'market':
        router.push({
          pathname: '/player-detail',
          params: { playerId: notification.data.targetId }
        });
        break;
      case 'registration':
      case 'system':
        // Just mark as read, no navigation
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={24} color="#FF4444" />;
      case 'comment': return <MessageCircle size={24} color="#00FF88" />;
      case 'follow': return <User size={24} color="#3B82F6" />;
      case 'message': return <MessageCircle size={24} color="#FFFFFF" />;
      case 'mention': return <AtSign size={24} color="#F59E0B" />;
      case 'market': return <ShoppingCart size={24} color="#8B5CF6" />;
      case 'registration': return <Ticket size={24} color="#EC4899" />;
      case 'system': return <Bell size={24} color="#FFFFFF" />;
      default: return <Bell size={24} color="#FFFFFF" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'rgba(255, 68, 68, 0.2)';
      case 'comment': return 'rgba(0, 255, 136, 0.2)';
      case 'follow': return 'rgba(59, 130, 246, 0.2)';
      case 'message': return 'rgba(255, 255, 255, 0.1)';
      case 'mention': return 'rgba(245, 158, 11, 0.2)';
      case 'market': return 'rgba(139, 92, 246, 0.2)';
      case 'registration': return 'rgba(236, 72, 153, 0.2)';
      case 'system': return 'rgba(255, 255, 255, 0.1)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const filters = [
    { id: null, label: 'Wszystkie', icon: Bell },
    { id: 'like', label: 'Polubienia', icon: Heart },
    { id: 'comment', label: 'Komentarze', icon: MessageCircle },
    { id: 'follow', label: 'Obserwujący', icon: User },
    { id: 'message', label: 'Wiadomości', icon: MessageCircle },
    { id: 'mention', label: 'Wzmianki', icon: AtSign },
    { id: 'market', label: 'Rynek', icon: ShoppingCart },
    { id: 'system', label: 'System', icon: Bell }
  ];

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Ładowanie powiadomień...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>POWIADOMIENIA</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Filter size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.readAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.readAllText}>Przeczytane</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <TouchableOpacity
              key={filter.id || 'all'}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.activeFilterChip
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <IconComponent 
                size={16} 
                color={activeFilter === filter.id ? '#000000' : '#888888'} 
              />
              <Text style={[
                styles.filterText,
                activeFilter === filter.id && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Notifications List */}
      {showSettings ? (
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Ustawienia powiadomień</Text>
          <Text style={styles.settingsSubtitle}>Wybierz, które powiadomienia chcesz otrzymywać</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Heart size={20} color="#FF4444" />
              <Text style={styles.settingLabel}>Polubienia</Text>
            </View>
            <Switch
              value={notificationSettings.likes}
              onValueChange={(value) => updateNotificationSetting('likes', value)}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={notificationSettings.likes ? '#FFFFFF' : '#888888'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MessageCircle size={20} color="#00FF88" />
              <Text style={styles.settingLabel}>Komentarze</Text>
            </View>
            <Switch
              value={notificationSettings.comments}
              onValueChange={(value) => updateNotificationSetting('comments', value)}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={notificationSettings.comments ? '#FFFFFF' : '#888888'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <User size={20} color="#3B82F6" />
              <Text style={styles.settingLabel}>Nowi obserwujący</Text>
            </View>
            <Switch
              value={notificationSettings.follows}
              onValueChange={(value) => updateNotificationSetting('follows', value)}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={notificationSettings.follows ? '#FFFFFF' : '#888888'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.settingLabel}>Wiadomości prywatne</Text>
            </View>
            <Switch
              value={notificationSettings.messages}
              onValueChange={(value) => updateNotificationSetting('messages', value)}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={notificationSettings.messages ? '#FFFFFF' : '#888888'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AtSign size={20} color="#F59E0B" />
              <Text style={styles.settingLabel}>Wzmianki</Text>
            </View>
            <Switch
              value={notificationSettings.mentions}
              onValueChange={(value) => updateNotificationSetting('mentions', value)}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={notificationSettings.mentions ? '#FFFFFF' : '#888888'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ShoppingCart size={20} color="#8B5CF6" />
              <Text style={styles.settingLabel}>Aktywność na rynku</Text>
            </View>
            <Switch
              value={notificationSettings.market}
              onValueChange={(value) => updateNotificationSetting('market', value)}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={notificationSettings.market ? '#FFFFFF' : '#888888'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#FFFFFF" />
              <Text style={styles.settingLabel}>Powiadomienia systemowe</Text>
            </View>
            <Switch
              value={notificationSettings.system}
              onValueChange={(value) => updateNotificationSetting('system', value)}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={notificationSettings.system ? '#FFFFFF' : '#888888'}
            />
          </View>
        </View>
      ) : (
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.isRead && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View 
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type) }
                  ]}
                >
                  {getNotificationIcon(notification.type)}
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.timestamp}</Text>
                </View>
                
                {!notification.isRead && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Bell size={48} color="#666666" />
              <Text style={styles.emptyText}>Brak powiadomień</Text>
              <Text style={styles.emptySubtext}>
                Tutaj pojawią się Twoje powiadomienia o aktywnościach
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  readAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readAllText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  activeFilterChip: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginLeft: 6,
  },
  activeFilterText: {
    color: '#000000',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#00FF88',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF88',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  settingsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});