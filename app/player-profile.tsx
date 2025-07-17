import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, Save, User, Plus, Trash2, CreditCard as Edit, X, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  country: string;
  age: string;
  height: string;
  position: string;
  profileType: string;
}

interface PlayerStats {
  minutes: number;
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  saves: number;
}

interface ClubHistory {
  id: string;
  clubName: string;
  startDate: string;
  endDate?: string;
  position: string;
  achievements?: string;
}

interface RelatedPlayer {
  id: string;
  name: string;
  position: string;
  club: string;
  photo: string;
}

interface CoachReview {
  id: string;
  coachName: string;
  coachPhoto: string;
  rating: number;
  comment: string;
  date: string;
  clubName: string;
}

export default function PlayerProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Player data state
  const [playerData, setPlayerData] = useState<PlayerData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    profilePhoto: '',
    country: '',
    age: '',
    height: '',
    position: '',
    profileType: 'zawodnik'
  });

  // Stats state
  const [stats, setStats] = useState<PlayerStats>({
    minutes: 0,
    matches: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    saves: 0
  });

  // Other sections state
  const [clubHistory, setClubHistory] = useState<ClubHistory[]>([]);
  const [relatedPlayers, setRelatedPlayers] = useState<RelatedPlayer[]>([]);
  const [coachReviews, setCoachReviews] = useState<CoachReview[]>([]);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubHistory | null>(null);

  // Form states
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    country: '',
    age: '',
    height: '',
    position: ''
  });

  const [clubForm, setClubForm] = useState({
    clubName: '',
    startDate: '',
    endDate: '',
    position: '',
    achievements: ''
  });

  const [playerForm, setPlayerForm] = useState({
    name: '',
    position: '',
    club: ''
  });

  useEffect(() => {
    loadPlayerProfile();
  }, []);

  const loadPlayerProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Błąd', 'Brak autoryzacji');
        router.back();
        return;
      }

      const response = await fetch('http://localhost:3001/api/player/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlayerData(data.player);
        setStats(data.stats);
        setClubHistory(data.clubHistory || []);
        setRelatedPlayers(data.relatedPlayers || []);
        setCoachReviews(data.coachReviews || []);
        
        // Initialize edit form
        setEditForm({
          firstName: data.player.firstName,
          lastName: data.player.lastName,
          country: data.player.country,
          age: data.player.age,
          height: data.player.height,
          position: data.player.position
        });
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać profilu');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Błąd', 'Problem z połączeniem');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const formData = new FormData();
        formData.append('photo', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);

        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/player/upload-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setPlayerData(prev => ({ ...prev, profilePhoto: data.photoUrl }));
          Alert.alert('Sukces', 'Zdjęcie zostało zaktualizowane');
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Błąd', 'Nie udało się przesłać zdjęcia');
    }
  };

  const saveBasicData = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/player/basic-data', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setPlayerData(prev => ({ ...prev, ...editForm }));
        setShowEditModal(false);
        Alert.alert('Sukces', 'Dane zostały zaktualizowane');
      } else {
        Alert.alert('Błąd', 'Nie udało się zapisać danych');
      }
    } catch (error) {
      console.error('Error saving basic data:', error);
      Alert.alert('Błąd', 'Problem z połączeniem');
    } finally {
      setSaving(false);
    }
  };

  const saveStats = async (field: keyof PlayerStats, value: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const numValue = parseInt(value) || 0;
      
      const response = await fetch('http://localhost:3001/api/player/stats', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: numValue }),
      });

      if (response.ok) {
        setStats(prev => ({ ...prev, [field]: numValue }));
      }
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  const saveClub = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const method = editingClub ? 'PUT' : 'POST';
      const url = editingClub 
        ? `http://localhost:3001/api/player/club-history/${editingClub.id}`
        : 'http://localhost:3001/api/player/club-history';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clubForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingClub) {
          setClubHistory(prev => prev.map(club => 
            club.id === editingClub.id ? data.club : club
          ));
        } else {
          setClubHistory(prev => [...prev, data.club]);
        }
        setShowClubModal(false);
        setEditingClub(null);
        setClubForm({ clubName: '', startDate: '', endDate: '', position: '', achievements: '' });
        Alert.alert('Sukces', editingClub ? 'Klub zaktualizowany' : 'Klub dodany');
      }
    } catch (error) {
      console.error('Error saving club:', error);
      Alert.alert('Błąd', 'Problem z zapisaniem klubu');
    }
  };

  const deleteClub = async (clubId: string) => {
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
              const response = await fetch(`http://localhost:3001/api/player/club-history/${clubId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setClubHistory(prev => prev.filter(club => club.id !== clubId));
                Alert.alert('Sukces', 'Klub usunięty');
              }
            } catch (error) {
              console.error('Error deleting club:', error);
              Alert.alert('Błąd', 'Problem z usunięciem klubu');
            }
          }
        }
      ]
    );
  };

  const addRelatedPlayer = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/player/related-players', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerForm),
      });

      if (response.ok) {
        const data = await response.json();
        setRelatedPlayers(prev => [...prev, data.player]);
        setShowPlayerModal(false);
        setPlayerForm({ name: '', position: '', club: '' });
        Alert.alert('Sukces', 'Gracz dodany');
      }
    } catch (error) {
      console.error('Error adding player:', error);
      Alert.alert('Błąd', 'Problem z dodaniem gracza');
    }
  };

  const removeRelatedPlayer = async (playerId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/player/related-players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRelatedPlayers(prev => prev.filter(player => player.id !== playerId));
        Alert.alert('Sukces', 'Gracz usunięty');
      }
    } catch (error) {
      console.error('Error removing player:', error);
      Alert.alert('Błąd', 'Problem z usunięciem gracza');
    }
  };

  const openEditClubModal = (club?: ClubHistory) => {
    if (club) {
      setEditingClub(club);
      setClubForm({
        clubName: club.clubName,
        startDate: club.startDate,
        endDate: club.endDate || '',
        position: club.position,
        achievements: club.achievements || ''
      });
    } else {
      setEditingClub(null);
      setClubForm({ clubName: '', startDate: '', endDate: '', position: '', achievements: '' });
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
          <Text style={styles.headerTitle}>PROFIL ZAWODNIKA</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Basic Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PODSTAWOWE DANE</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Edit size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoUpload}>
              {playerData.profilePhoto ? (
                <Image source={{ uri: playerData.profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.defaultPhoto}>
                  <User size={48} color="#888888" />
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Camera size={20} color="#000000" />
              </View>
            </TouchableOpacity>

            <View style={styles.basicInfo}>
              <Text style={styles.playerName}>
                {playerData.firstName} {playerData.lastName}
              </Text>
              <Text style={styles.playerEmail}>{playerData.email}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kraj:</Text>
                <Text style={styles.infoValue}>{playerData.country || 'Nie podano'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Wiek:</Text>
                <Text style={styles.infoValue}>{playerData.age || 'Nie podano'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Wzrost:</Text>
                <Text style={styles.infoValue}>{playerData.height || 'Nie podano'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pozycja:</Text>
                <Text style={styles.infoValue}>{playerData.position || 'Nie podano'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATYSTYKI</Text>
          <View style={styles.statsGrid}>
            {Object.entries(stats).map(([key, value]) => (
              <View key={key} style={styles.statItem}>
                <Text style={styles.statLabel}>
                  {key === 'minutes' ? 'Minuty' :
                   key === 'matches' ? 'Mecze' :
                   key === 'goals' ? 'Gole' :
                   key === 'assists' ? 'Asysty' :
                   key === 'yellowCards' ? 'Żółte kartki' :
                   key === 'redCards' ? 'Czerwone kartki' :
                   key === 'cleanSheets' ? 'Czyste konta' :
                   key === 'saves' ? 'Obrony' : key}
                </Text>
                <TextInput
                  style={styles.statInput}
                  value={value.toString()}
                  onChangeText={(text) => saveStats(key as keyof PlayerStats, text)}
                  keyboardType="numeric"
                  onBlur={() => {}} // Auto-save on blur
                />
              </View>
            ))}
          </View>
        </View>

        {/* Club History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HISTORIA KLUBOWA</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openEditClubModal()}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {clubHistory.length > 0 ? (
            clubHistory.map((club) => (
              <View key={club.id} style={styles.clubCard}>
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.clubName}</Text>
                  <Text style={styles.clubPeriod}>
                    {club.startDate} - {club.endDate || 'obecnie'}
                  </Text>
                  <Text style={styles.clubPosition}>{club.position}</Text>
                  {club.achievements && (
                    <Text style={styles.clubAchievements}>{club.achievements}</Text>
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
                    onPress={() => deleteClub(club.id)}
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

        {/* Related Players Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>POWIĄZANI GRACZE</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowPlayerModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {relatedPlayers.length > 0 ? (
            relatedPlayers.map((player) => (
              <View key={player.id} style={styles.playerCard}>
                <Image 
                  source={{ uri: player.photo || 'https://via.placeholder.com/50' }} 
                  style={styles.playerPhoto} 
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerCardName}>{player.name}</Text>
                  <Text style={styles.playerCardPosition}>{player.position}</Text>
                  <Text style={styles.playerCardClub}>{player.club}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeRelatedPlayer(player.id)}
                >
                  <Trash2 size={16} color="#FF4444" />
                </TouchableOpacity>
              </View>
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
                  <Image 
                    source={{ uri: review.coachPhoto || 'https://via.placeholder.com/40' }} 
                    style={styles.coachPhoto} 
                  />
                  <View style={styles.reviewInfo}>
                    <Text style={styles.coachName}>{review.coachName}</Text>
                    <Text style={styles.clubName}>{review.clubName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
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
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak opinii od trenerów</Text>
          )}
        </View>
      </ScrollView>

      {/* Edit Basic Data Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edytuj dane podstawowe</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Imię"
              placeholderTextColor="#666666"
              value={editForm.firstName}
              onChangeText={(text) => setEditForm({...editForm, firstName: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nazwisko"
              placeholderTextColor="#666666"
              value={editForm.lastName}
              onChangeText={(text) => setEditForm({...editForm, lastName: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Kraj"
              placeholderTextColor="#666666"
              value={editForm.country}
              onChangeText={(text) => setEditForm({...editForm, country: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Wiek"
              placeholderTextColor="#666666"
              value={editForm.age}
              onChangeText={(text) => setEditForm({...editForm, age: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Wzrost (np. 180 cm)"
              placeholderTextColor="#666666"
              value={editForm.height}
              onChangeText={(text) => setEditForm({...editForm, height: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Pozycja"
              placeholderTextColor="#666666"
              value={editForm.position}
              onChangeText={(text) => setEditForm({...editForm, position: text})}
            />
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveBasicData}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Zapisywanie...' : 'Zapisz'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              value={clubForm.clubName}
              onChangeText={(text) => setClubForm({...clubForm, clubName: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Data rozpoczęcia (YYYY-MM-DD)"
              placeholderTextColor="#666666"
              value={clubForm.startDate}
              onChangeText={(text) => setClubForm({...clubForm, startDate: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Data zakończenia (YYYY-MM-DD)"
              placeholderTextColor="#666666"
              value={clubForm.endDate}
              onChangeText={(text) => setClubForm({...clubForm, endDate: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Pozycja"
              placeholderTextColor="#666666"
              value={clubForm.position}
              onChangeText={(text) => setClubForm({...clubForm, position: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Osiągnięcia (opcjonalne)"
              placeholderTextColor="#666666"
              value={clubForm.achievements}
              onChangeText={(text) => setClubForm({...clubForm, achievements: text})}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={saveClub}>
              <Text style={styles.saveButtonText}>Zapisz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Related Player Modal */}
      <Modal visible={showPlayerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj powiązanego gracza</Text>
              <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Imię i nazwisko"
              placeholderTextColor="#666666"
              value={playerForm.name}
              onChangeText={(text) => setPlayerForm({...playerForm, name: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Pozycja"
              placeholderTextColor="#666666"
              value={playerForm.position}
              onChangeText={(text) => setPlayerForm({...playerForm, position: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Klub"
              placeholderTextColor="#666666"
              value={playerForm.club}
              onChangeText={(text) => setPlayerForm({...playerForm, club: text})}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={addRelatedPlayer}>
              <Text style={styles.saveButtonText}>Dodaj gracza</Text>
            </TouchableOpacity>
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
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  placeholder: {
    width: 44,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  photoContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  defaultPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  basicInfo: {
    alignItems: 'center',
  },
  playerName: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  playerEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginBottom: 8,
    textAlign: 'center',
  },
  statInput: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 60,
    backgroundColor: 'transparent',
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
    marginBottom: 2,
  },
  clubAchievements: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#00FF88',
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
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  playerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerCardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  playerCardPosition: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  playerCardClub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coachPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    lineHeight: 20,
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
});