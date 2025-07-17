import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  Modal,
  TextInput,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, Users, Video, MessageCircle, Star, LogOut, CreditCard as Edit, Plus, Trash2, Play, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_type?: string;
  club?: string;
  position?: string;
  height?: string;
  avatar_url?: string;
  created_at?: string;
}

interface ClubHistory {
  id: string;
  club_name: string;
  start_date: string;
  end_date?: string;
  position?: string;
}

interface MatchVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  duration: string;
  views: number;
  upload_date: string;
}

interface RelatedPlayer {
  id: string;
  name: string;
  position: string;
  club: string;
  avatar_url?: string;
}

interface CoachReview {
  id: string;
  coach_name: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [clubHistory, setClubHistory] = useState<ClubHistory[]>([]);
  const [matchVideos, setMatchVideos] = useState<MatchVideo[]>([]);
  const [relatedPlayers, setRelatedPlayers] = useState<RelatedPlayer[]>([]);
  const [coachReviews, setCoachReviews] = useState<CoachReview[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showClubModal, setShowClubModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MatchVideo | null>(null);
  const [editingClub, setEditingClub] = useState<ClubHistory | null>(null);
  
  // Form states
  const [clubForm, setClubForm] = useState({
    club_name: '',
    start_date: '',
    end_date: '',
    position: ''
  });
  
  const [videoForm, setVideoForm] = useState({
    title: '',
    video_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchAllProfileData();
  }, []);

  // Fetch all profile data from API
  const fetchAllProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Brak tokena autoryzacji. Zaloguj się ponownie.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch user profile
      const profileResponse = await fetch('https://game-p.onrender.com/api/auth/profile', {
        method: 'GET',
        headers,
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserData(profileData);
        
        // Fetch additional profile data
        await Promise.all([
          fetchClubHistory(headers),
          fetchMatchVideos(headers),
          fetchRelatedPlayers(headers),
          fetchCoachReviews(headers)
        ]);
      } else {
        const errorData = await profileResponse.json();
        setError(errorData.error || 'Nie udało się pobrać profilu');
        
        if (profileResponse.status === 401) {
          await AsyncStorage.removeItem('token');
          router.replace('/(tabs)/login');
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Wystąpił błąd podczas pobierania profilu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch club history from API
  const fetchClubHistory = async (headers: any) => {
    try {
      const response = await fetch('https://game-p.onrender.com/api/profile/club-history', {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setClubHistory(data);
      }
    } catch (error) {
      console.error('Club history fetch error:', error);
    }
  };

  // Fetch match videos from API
  const fetchMatchVideos = async (headers: any) => {
    try {
      const response = await fetch('https://game-p.onrender.com/api/profile/match-videos', {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatchVideos(data);
      }
    } catch (error) {
      console.error('Match videos fetch error:', error);
    }
  };

  // Fetch related players from API
  const fetchRelatedPlayers = async (headers: any) => {
    try {
      const response = await fetch('https://game-p.onrender.com/api/profile/related-players', {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setRelatedPlayers(data);
      }
    } catch (error) {
      console.error('Related players fetch error:', error);
    }
  };

  // Fetch coach reviews from API
  const fetchCoachReviews = async (headers: any) => {
    try {
      const response = await fetch('https://game-p.onrender.com/api/profile/coach-reviews', {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setCoachReviews(data);
      }
    } catch (error) {
      console.error('Coach reviews fetch error:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert('Sukces', 'Wylogowano pomyślnie');
      router.replace('/(tabs)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas wylogowywania');
    }
  };

  // Handle edit profile navigation
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  // Handle club history operations
  const handleSaveClub = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const method = editingClub ? 'PUT' : 'POST';
      const url = editingClub 
        ? `https://game-p.onrender.com/api/profile/club-history/${editingClub.id}`
        : 'https://game-p.onrender.com/api/profile/club-history';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clubForm),
      });

      if (response.ok) {
        Alert.alert('Sukces', editingClub ? 'Klub zaktualizowany' : 'Klub dodany');
        setShowClubModal(false);
        setEditingClub(null);
        setClubForm({ club_name: '', start_date: '', end_date: '', position: '' });
        
        // Refresh club history
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        await fetchClubHistory(headers);
      } else {
        Alert.alert('Błąd', 'Nie udało się zapisać klubu');
      }
    } catch (error) {
      console.error('Save club error:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas zapisywania');
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    Alert.alert(
      'Potwierdź usunięcie',
      'Czy na pewno chcesz usunąć ten klub z historii?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`https://game-p.onrender.com/api/profile/club-history/${clubId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Sukces', 'Klub usunięty');
                const headers = {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                };
                await fetchClubHistory(headers);
              } else {
                Alert.alert('Błąd', 'Nie udało się usunąć klubu');
              }
            } catch (error) {
              console.error('Delete club error:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania');
            }
          }
        }
      ]
    );
  };

  // Handle video operations
  const handleSaveVideo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://game-p.onrender.com/api/profile/match-videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoForm),
      });

      if (response.ok) {
        Alert.alert('Sukces', 'Film dodany');
        setShowVideoModal(false);
        setVideoForm({ title: '', video_url: '', thumbnail_url: '' });
        
        // Refresh videos
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        await fetchMatchVideos(headers);
      } else {
        Alert.alert('Błąd', 'Nie udało się dodać filmu');
      }
    } catch (error) {
      console.error('Save video error:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas zapisywania');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    Alert.alert(
      'Potwierdź usunięcie',
      'Czy na pewno chcesz usunąć ten film?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`https://game-p.onrender.com/api/profile/match-videos/${videoId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Sukces', 'Film usunięty');
                const headers = {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                };
                await fetchMatchVideos(headers);
              } else {
                Alert.alert('Błąd', 'Nie udało się usunąć filmu');
              }
            } catch (error) {
              console.error('Delete video error:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania');
            }
          }
        }
      ]
    );
  };

  const openEditClubModal = (club?: ClubHistory) => {
    if (club) {
      setEditingClub(club);
      setClubForm({
        club_name: club.club_name,
        start_date: club.start_date,
        end_date: club.end_date || '',
        position: club.position || ''
      });
    } else {
      setEditingClub(null);
      setClubForm({ club_name: '', start_date: '', end_date: '', position: '' });
    }
    setShowClubModal(true);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Ładowanie profilu...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAllProfileData}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!userData) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Brak danych profilu</Text>
        </View>
      </LinearGradient>
    );
  }

  const displayName = userData.first_name && userData.last_name 
    ? `${userData.first_name} ${userData.last_name}` 
    : userData.email.split('@')[0];

  const avatarUrl = userData.avatar_url || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1';

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.messageButton}>
            <MessageCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#FF4444" />
          </TouchableOpacity>
        </View>

        {/* User Data Section */}
        <View style={styles.userDataSection}>
          <Text style={styles.sectionTitle}>DANE UŻYTKOWNIKA</Text>
          
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleEditProfile}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <View style={styles.editAvatarOverlay}>
                <Edit size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userRole}>{userData.profile_type || 'Użytkownik'}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Edit size={20} color="#000000" />
            <Text style={styles.editProfileButtonText}>Edytuj profil</Text>
          </TouchableOpacity>
        </View>

        {/* Club History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HISTORIA KLUBOWA</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => openEditClubModal()}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {clubHistory.length > 0 ? (
            clubHistory.map((club) => (
              <View key={club.id} style={styles.clubCard}>
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.club_name}</Text>
                  <Text style={styles.clubPeriod}>
                    {club.start_date} - {club.end_date || 'obecnie'}
                  </Text>
                  {club.position && (
                    <Text style={styles.clubPosition}>{club.position}</Text>
                  )}
                </View>
                <View style={styles.clubActions}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => openEditClubModal(club)}
                  >
                    <Edit size={16} color="#888888" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => handleDeleteClub(club.id)}
                  >
                    <Trash2 size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak historii klubowej</Text>
          )}
        </View>

        {/* Match Videos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FILMY MECZOWE</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowVideoModal(true)}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {matchVideos.length > 0 ? (
            matchVideos.map((video) => (
              <View key={video.id} style={styles.videoCard}>
                <TouchableOpacity 
                  style={styles.videoThumbnail}
                  onPress={() => {
                    setSelectedVideo(video);
                    setShowVideoPlayer(true);
                  }}
                >
                  {video.thumbnail_url ? (
                    <Image source={{ uri: video.thumbnail_url }} style={styles.thumbnailImage} />
                  ) : (
                    <View style={styles.defaultThumbnail}>
                      <Video size={32} color="#FFFFFF" />
                    </View>
                  )}
                  <View style={styles.playOverlay}>
                    <Play size={24} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoDetails}>
                    {video.duration} • {video.views} wyświetleń
                  </Text>
                  <Text style={styles.videoDate}>
                    {new Date(video.upload_date).toLocaleDateString('pl-PL')}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteVideoButton} 
                  onPress={() => handleDeleteVideo(video.id)}
                >
                  <Trash2 size={16} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak filmów meczowych</Text>
          )}
        </View>

        {/* Related Players Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>POWIĄZANI GRACZE</Text>
          {relatedPlayers.length > 0 ? (
            relatedPlayers.map((player) => (
              <TouchableOpacity key={player.id} style={styles.playerCard}>
                <Image 
                  source={{ uri: player.avatar_url || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }} 
                  style={styles.playerAvatar} 
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                  <Text style={styles.playerClub}>{player.club}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak powiązanych graczy</Text>
          )}
        </View>

        {/* Coach Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OPINIE TRENERÓW</Text>
          {coachReviews.length > 0 ? (
            coachReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewCoach}>{review.coach_name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString('pl-PL')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak opinii trenerów</Text>
          )}
        </View>
      </ScrollView>

      {/* Club Modal */}
      <Modal visible={showClubModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClub ? 'Edytuj klub' : 'Dodaj klub'}
              </Text>
              <TouchableOpacity onPress={() => setShowClubModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nazwa klubu"
              placeholderTextColor="#666666"
              value={clubForm.club_name}
              onChangeText={(text) => setClubForm({...clubForm, club_name: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Data rozpoczęcia (YYYY-MM-DD)"
              placeholderTextColor="#666666"
              value={clubForm.start_date}
              onChangeText={(text) => setClubForm({...clubForm, start_date: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Data zakończenia (YYYY-MM-DD)"
              placeholderTextColor="#666666"
              value={clubForm.end_date}
              onChangeText={(text) => setClubForm({...clubForm, end_date: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Pozycja"
              placeholderTextColor="#666666"
              value={clubForm.position}
              onChangeText={(text) => setClubForm({...clubForm, position: text})}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveClub}>
              <Text style={styles.saveButtonText}>Zapisz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal visible={showVideoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj film</Text>
              <TouchableOpacity onPress={() => setShowVideoModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Tytuł filmu"
              placeholderTextColor="#666666"
              value={videoForm.title}
              onChangeText={(text) => setVideoForm({...videoForm, title: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="URL filmu"
              placeholderTextColor="#666666"
              value={videoForm.video_url}
              onChangeText={(text) => setVideoForm({...videoForm, video_url: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="URL miniaturki (opcjonalne)"
              placeholderTextColor="#666666"
              value={videoForm.thumbnail_url}
              onChangeText={(text) => setVideoForm({...videoForm, thumbnail_url: text})}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveVideo}>
              <Text style={styles.saveButtonText}>Dodaj film</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Video Player Modal */}
      <Modal visible={showVideoPlayer} transparent animationType="fade">
        <View style={styles.videoPlayerOverlay}>
          <TouchableOpacity 
            style={styles.closeVideoButton} 
            onPress={() => setShowVideoPlayer(false)}
          >
            <X size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedVideo && (
            <View style={styles.videoPlayerContainer}>
              <Text style={styles.videoPlayerTitle}>{selectedVideo.title}</Text>
              {/* Here you would implement actual video player */}
              <View style={styles.videoPlaceholder}>
                <Play size={64} color="#FFFFFF" />
                <Text style={styles.videoPlaceholderText}>
                  Video Player Placeholder
                </Text>
                <Text style={styles.videoUrl}>{selectedVideo.video_url}</Text>
              </View>
            </View>
          )}
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDataSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#00FF88',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginLeft: 8,
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clubActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  videoThumbnail: {
    position: 'relative',
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  defaultThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  videoDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  deleteVideoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  playerClub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewCoach: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFD700',
    marginLeft: 4,
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
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
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
    width: width * 0.9,
    maxHeight: height * 0.8,
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
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  videoPlayerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeVideoButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  videoPlayerContainer: {
    width: width * 0.9,
    alignItems: 'center',
  },
  videoPlayerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 16,
  },
  videoUrl: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginTop: 8,
    textAlign: 'center',
  },
});