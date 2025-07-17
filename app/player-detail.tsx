import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Share, MapPin, Calendar, Trophy, Star } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlayerDetail {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  age: number;
  club: string;
  country: string;
  price: string;
  rating: number;
  image: string;
  height: string;
  stats: {
    minutes: number;
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
  clubHistory: Array<{
    id: string;
    clubName: string;
    startDate: string;
    endDate?: string;
    position: string;
  }>;
  coachReviews: Array<{
    id: string;
    coachName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export default function PlayerDetailScreen() {
  const router = useRouter();
  const { playerId } = useLocalSearchParams();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    fetchPlayerDetail();
    checkIfWatched();
  }, [playerId]);

  const fetchPlayerDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/market/player/${playerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlayer(data.player);
      } else {
        // Mock data dla testów
        setPlayer(mockPlayerDetail);
      }
    } catch (error) {
      console.error('Error fetching player detail:', error);
      setPlayer(mockPlayerDetail);
    } finally {
      setLoading(false);
    }
  };

  const checkIfWatched = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/market/is-watched/${playerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsWatched(data.isWatched);
      }
    } catch (error) {
      console.error('Error checking watch status:', error);
    }
  };

  const toggleWatch = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/market/watch/${playerId}`, {
        method: isWatched ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsWatched(!isWatched);
        Alert.alert(
          'Sukces', 
          isWatched ? 'Gracz usunięty z obserwowanych' : 'Gracz dodany do obserwowanych'
        );
      } else {
        Alert.alert('Błąd', 'Nie udało się zaktualizować obserwowanych');
      }
    } catch (error) {
      console.error('Error toggling watch:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas aktualizacji');
    }
  };

  const handleShare = () => {
    Alert.alert('Udostępnij', `Udostępnij profil gracza ${player?.firstName} ${player?.lastName}`);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return '#00FF88';
    if (rating >= 75) return '#FFD700';
    if (rating >= 70) return '#FFA500';
    return '#888888';
  };

  // Mock data
  const mockPlayerDetail: PlayerDetail = {
    id: '1',
    firstName: 'Piotr',
    lastName: 'Kowalski',
    position: 'CM',
    age: 22,
    club: 'Legia Warszawa',
    country: 'Polska',
    price: '2.5M €',
    rating: 78,
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
    height: '180 cm',
    stats: {
      minutes: 1890,
      matches: 25,
      goals: 8,
      assists: 12,
      yellowCards: 3,
      redCards: 0,
    },
    clubHistory: [
      {
        id: '1',
        clubName: 'Legia Warszawa',
        startDate: '2022-07-01',
        position: 'CM',
      },
      {
        id: '2',
        clubName: 'Wisła Kraków',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        position: 'CAM',
      },
    ],
    coachReviews: [
      {
        id: '1',
        coachName: 'Jan Kowalski',
        rating: 4,
        comment: 'Bardzo utalentowany gracz z dobrą wizją gry.',
        date: '2024-01-15',
      },
      {
        id: '2',
        coachName: 'Michał Nowak',
        rating: 5,
        comment: 'Profesjonalne podejście i świetne umiejętności techniczne.',
        date: '2023-12-10',
      },
    ],
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Ładowanie profilu gracza...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!player) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nie znaleziono gracza</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFIL GRACZA</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <View style={styles.playerImageContainer}>
            <Image source={{ uri: player.image }} style={styles.playerImage} />
            <View style={styles.ratingBadge}>
              <Text style={[styles.ratingText, { color: getRatingColor(player.rating) }]}>
                {player.rating}
              </Text>
            </View>
          </View>

          <View style={styles.playerDetails}>
            <Text style={styles.playerName}>
              {player.firstName} {player.lastName}
            </Text>
            <Text style={styles.playerPosition}>{player.position}</Text>
            <Text style={styles.playerClub}>{player.club}</Text>
            
            <View style={styles.playerMeta}>
              <View style={styles.metaItem}>
                <Calendar size={16} color="#888888" />
                <Text style={styles.metaText}>{player.age} lat</Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={16} color="#888888" />
                <Text style={styles.metaText}>{player.country}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.heightText}>{player.height}</Text>
              </View>
            </View>

            <Text style={styles.priceText}>{player.price}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.watchButton, isWatched && styles.watchedButton]}
            onPress={toggleWatch}
          >
            <Heart 
              size={20} 
              color={isWatched ? "#FFFFFF" : "#888888"}
              fill={isWatched ? "#FFFFFF" : "transparent"}
            />
            <Text style={[styles.watchButtonText, isWatched && styles.watchedButtonText]}>
              {isWatched ? 'Obserwowany' : 'Obserwuj'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATYSTYKI</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.matches}</Text>
              <Text style={styles.statLabel}>Mecze</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.minutes}</Text>
              <Text style={styles.statLabel}>Minuty</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.goals}</Text>
              <Text style={styles.statLabel}>Gole</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.assists}</Text>
              <Text style={styles.statLabel}>Asysty</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.yellowCards}</Text>
              <Text style={styles.statLabel}>Żółte kartki</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.redCards}</Text>
              <Text style={styles.statLabel}>Czerwone kartki</Text>
            </View>
          </View>
        </View>

        {/* Club History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HISTORIA KLUBOWA</Text>
          {player.clubHistory.map((club) => (
            <View key={club.id} style={styles.clubCard}>
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.clubName}</Text>
                <Text style={styles.clubPeriod}>
                  {club.startDate} - {club.endDate || 'obecnie'}
                </Text>
                <Text style={styles.clubPosition}>{club.position}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Coach Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OPINIE TRENERÓW</Text>
          {player.coachReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.coachName}>{review.coachName}</Text>
                <View style={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      color={i < review.rating ? "#FFD700" : "#333333"}
                      fill={i < review.rating ? "#FFD700" : "transparent"}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
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
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  playerImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  playerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratingBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
  },
  playerDetails: {
    alignItems: 'center',
  },
  playerName: {
    fontSize: 28,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginBottom: 4,
  },
  playerClub: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 4,
  },
  heightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  priceText: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#00FF88',
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  watchedButton: {
    backgroundColor: '#FF4444',
    borderColor: '#FF4444',
  },
  watchButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginLeft: 8,
  },
  watchedButtonText: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'center',
  },
  clubCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  clubPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  clubPosition: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coachName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  ratingStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});