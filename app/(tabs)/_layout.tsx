import { Tabs } from 'expo-router';
import { Users, Calendar, User, Settings as SettingsIcon, Bell, Chrome as Home, Wallpaper as SoccerBall, MessageCircle } from 'lucide-react-native';
import { t } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null; // Or loading spinner
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter-SemiBold',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} strokeWidth={2} />
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Treningi",
          tabBarIcon: ({ size, color }) => <SoccerBall size={size} color={color} strokeWidth={2} />
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Kalendarz",
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} strokeWidth={2} />
        }}
      />
      <Tabs.Screen
        name="team-chat"
        options={{
          title: "Czat",
          tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} strokeWidth={2} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Powiadomienia",
          tabBarIcon: ({ size, color }) => <Bell size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}