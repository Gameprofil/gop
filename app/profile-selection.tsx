import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Users, Building, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProfileSelectionScreen() {
  const router = useRouter();

  const profileTypes = [
    {
      id: 'zawodnik',
      title: 'Zawodnik',
      subtitle: 'Player Profile',
      icon: User,
      route: '/player-profile',
    },
    {
      id: 'trener',
      title: 'Trener',
      subtitle: 'Coach Profile',
      icon: Users,
      route: '/coach-profile',
    },
    {
      id: 'druzyna',
      title: 'Drużyna',
      subtitle: 'Team Profile',
      icon: Building,
      route: '/(tabs)/profile',
    },
    {
      id: 'scout',
      title: 'Scout',
      subtitle: 'Scout Profile',
      icon: Search,
      route: '/(tabs)/profile',
    },
  ];

  const handleProfileTypeSelect = async (type: any) => {
    try {
      // Save selected profile type
      await AsyncStorage.setItem('profileType', type.id);
      
      // Navigate to appropriate screen
      router.replace(type.route);
    } catch (error) {
      console.error('Error saving profile type:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Wybierz swój profil</Text>
        <Text style={styles.subtitle}>Kim jesteś w świecie piłki nożnej?</Text>
      </View>

      <View style={styles.grid}>
        {profileTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <TouchableOpacity
              key={type.id}
              style={styles.card}
              onPress={() => handleProfileTypeSelect(type)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.cardGradient}
              >
                <IconComponent 
                  size={48} 
                  color="#FFFFFF" 
                  strokeWidth={1.5}
                />
                <Text style={styles.cardTitle}>{type.title}</Text>
                <Text style={styles.cardSubtitle}>{type.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 72) / 2,
    height: 180,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'center',
  },
});