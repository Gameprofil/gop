import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Modal, 
  Alert,
  TextInput,
  Linking,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Bell, Shield, Globe, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Volume2, Smartphone, Check, X, Bot, Mail, Phone, CreditCard as Edit, Save } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/i18n';
import * as Notifications from 'expo-notifications';

// Konfiguracja powiadomień
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileType: string;
  avatar_url?: string;
}

interface NotificationSettings {
  newMessage: boolean;
  followers: boolean;
  marketActivity: boolean;
  postReactions: boolean;
  matchUpdates: boolean;
  clubNews: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  
  // States
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newMessage: true,
    followers: true,
    marketActivity: true,
    postReactions: true,
    matchUpdates: false,
    clubNews: false,
  });
  
  // App settings
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Modals
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Edit form
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    fetchUserData();
    fetchNotificationSettings();
    requestNotificationPermissions();
  }, []);

  // Żądanie uprawnień do powiadomień
  const requestNotificationPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Powiadomienia',
          'Aby otrzymywać powiadomienia, włącz je w ustawieniach urządzenia'
        );
      }
    }
  };

  // Pobieranie danych użytkownika
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setEditForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pobieranie ustawień powiadomień
  const fetchNotificationSettings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/auth/notification-settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.settings || notificationSettings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  // Zapisywanie danych użytkownika
  const saveUserData = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
        setEditing(false);
        Alert.alert('Sukces', 'Dane zostały zaktualizowane');
      } else {
        Alert.alert('Błąd', 'Nie udało się zaktualizować danych');
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas zapisywania');
    } finally {
      setSaving(false);
    }
  };

  // Aktualizacja ustawień powiadomień
  const updateNotificationSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);

    try {
      const token = await AsyncStorage.getItem('token');
      await fetch('http://localhost:3001/api/auth/notification-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  // Wysyłanie testowego powiadomienia
  const sendTestNotification = async () => {
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test powiadomienia 🔔",
          body: "To jest testowe powiadomienie z aplikacji Game Profil",
          data: { type: 'test' },
        },
        trigger: { seconds: 1 },
      });
    }
  };

  // Kontakt
  const handleContact = (type: 'email' | 'phone') => {
    if (type === 'email') {
      Linking.openURL('mailto:support@gameprofil.com');
    } else {
      Linking.openURL('tel:+48123456789');
    }
  };

  // Wylogowanie
  const handleLogout = async () => {
    Alert.alert(
      'Wylogowanie',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  // Zmiana języka
  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setShowLanguageModal(false);
      Alert.alert(
        t('settings.languageChanged'),
        t('settings.restartRequired'),
        [{ text: t('common.confirm') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(t('common.error'), t('errors.unknownError'));
    }
  };

  // Nazwa języka
  const getCurrentLanguageName = () => {
    const language = availableLanguages.find(lang => lang.code === currentLanguage);
    return language ? language.nativeName : 'Polski';
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Ładowanie ustawień...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DANE UŻYTKOWNIKA</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => editing ? saveUserData() : setEditing(true)}
              disabled={saving}
            >
              {editing ? (
                <Save size={20} color="#00FF88" />
              ) : (
                <Edit size={20} color="#888888" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <User size={32} color="#FFFFFF" />
            </View>
            
            <View style={styles.userInfo}>
              {editing ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.firstName}
                    onChangeText={(text) => setEditForm({...editForm, firstName: text})}
                    placeholder="Imię"
                    placeholderTextColor="#666666"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={editForm.lastName}
                    onChangeText={(text) => setEditForm({...editForm, lastName: text})}
                    placeholder="Nazwisko"
                    placeholderTextColor="#666666"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm({...editForm, phone: text})}
                    placeholder="Telefon"
                    placeholderTextColor="#666666"
                    keyboardType="phone-pad"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.userName}>
                    {userData?.firstName} {userData?.lastName}
                  </Text>
                  <Text style={styles.userEmail}>{userData?.email}</Text>
                  <Text style={styles.userPhone}>{userData?.phone || 'Brak telefonu'}</Text>
                  <Text style={styles.userType}>{userData?.profileType}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>POWIADOMIENIA</Text>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={sendTestNotification}
            >
              <Text style={styles.testButtonText}>Test</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowNotificationModal(true)}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Bell size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Ustawienia powiadomień</Text>
            </View>
            <ChevronRight size={20} color="#888888" />
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APLIKACJA</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Moon size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Tryb ciemny</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={darkMode ? '#FFFFFF' : '#888888'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Volume2 size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Dźwięki</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#888888'}
            />
          </View>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Globe size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Język</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{getCurrentLanguageName()}</Text>
              <ChevronRight size={20} color="#888888" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WSPARCIE</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/ai-agent')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Bot size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Agent AI</Text>
            </View>
            <ChevronRight size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleContact('email')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Mail size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Kontakt email</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>support@gameprofil.com</Text>
              <ChevronRight size={20} color="#888888" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleContact('phone')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Phone size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Kontakt telefoniczny</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>+48 123 456 789</Text>
              <ChevronRight size={20} color="#888888" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <HelpCircle size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Pomoc i FAQ</Text>
            </View>
            <ChevronRight size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Shield size={20} color="#888888" />
              </View>
              <Text style={styles.settingLabel}>Polityka Prywatności</Text>
            </View>
            <ChevronRight size={20} color="#888888" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>GAME PROFIL v1.0.0</Text>
          <Text style={styles.appDescription}>
            Platforma skautingowa dla piłkarzy
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['rgba(255, 68, 68, 0.1)', 'rgba(255, 68, 68, 0.05)']}
            style={styles.logoutGradient}
          >
            <LogOut size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Wyloguj się</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz język</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languageList}>
              {availableLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    currentLanguage === language.code && styles.selectedLanguageItem
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{language.nativeName}</Text>
                    <Text style={styles.languageEnglishName}>{language.name}</Text>
                  </View>
                  {currentLanguage === language.code && (
                    <Check size={20} color="#00FF88" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal visible={showNotificationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ustawienia powiadomień</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationList}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Nowe wiadomości</Text>
                  <Text style={styles.notificationDesc}>Powiadomienia o nowych wiadomościach prywatnych</Text>
                </View>
                <Switch
                  value={notificationSettings.newMessage}
                  onValueChange={(value) => updateNotificationSetting('newMessage', value)}
                  trackColor={{ false: '#333333', true: '#00FF88' }}
                  thumbColor={notificationSettings.newMessage ? '#FFFFFF' : '#888888'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Nowi obserwujący</Text>
                  <Text style={styles.notificationDesc}>Gdy ktoś zacznie Cię obserwować</Text>
                </View>
                <Switch
                  value={notificationSettings.followers}
                  onValueChange={(value) => updateNotificationSetting('followers', value)}
                  trackColor={{ false: '#333333', true: '#00FF88' }}
                  thumbColor={notificationSettings.followers ? '#FFFFFF' : '#888888'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Aktywność na rynku</Text>
                  <Text style={styles.notificationDesc}>Zmiany cen obserwowanych graczy</Text>
                </View>
                <Switch
                  value={notificationSettings.marketActivity}
                  onValueChange={(value) => updateNotificationSetting('marketActivity', value)}
                  trackColor={{ false: '#333333', true: '#00FF88' }}
                  thumbColor={notificationSettings.marketActivity ? '#FFFFFF' : '#888888'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Reakcje na posty</Text>
                  <Text style={styles.notificationDesc}>Polubienia i komentarze do Twoich postów</Text>
                </View>
                <Switch
                  value={notificationSettings.postReactions}
                  onValueChange={(value) => updateNotificationSetting('postReactions', value)}
                  trackColor={{ false: '#333333', true: '#00FF88' }}
                  thumbColor={notificationSettings.postReactions ? '#FFFFFF' : '#888888'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Aktualizacje meczów</Text>
                  <Text style={styles.notificationDesc}>Wyniki i wydarzenia z obserwowanych meczów</Text>
                </View>
                <Switch
                  value={notificationSettings.matchUpdates}
                  onValueChange={(value) => updateNotificationSetting('matchUpdates', value)}
                  trackColor={{ false: '#333333', true: '#00FF88' }}
                  thumbColor={notificationSettings.matchUpdates ? '#FFFFFF' : '#888888'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Wiadomości klubowe</Text>
                  <Text style={styles.notificationDesc}>Ogłoszenia i aktualności z Twojego klubu</Text>
                </View>
                <Switch
                  value={notificationSettings.clubNews}
                  onValueChange={(value) => updateNotificationSetting('clubNews', value)}
                  trackColor={{ false: '#333333', true: '#00FF88' }}
                  thumbColor={notificationSettings.clubNews ? '#FFFFFF' : '#888888'}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
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
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    letterSpacing: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  testButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#00FF88',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 4,
  },
  userType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#00FF88',
  },
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginRight: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appVersion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'center',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  languageEnglishName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  notificationList: {
    maxHeight: 500,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    lineHeight: 20,
  },
});