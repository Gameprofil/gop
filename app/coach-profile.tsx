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
import { ArrowLeft, Camera, Save, User, Plus, Trash2, CreditCard as Edit, X, Star, Award, Calendar, MapPin, Flag, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

interface CoachData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  country: string;
  age: string;
  licenseType: string;
  preferredFormation: string;
  profileType: string;
}

interface CoachStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  pointsPerMatch: number;
  developedPlayers: number;
}

interface ClubHistory {
  id: string;
  clubName: string;
  role: string;
  country: string;
  startDate: string;
  endDate?: string;
  matches: number;
  pointsPerMatch: number;
  playersInvolved: number;
  achievements?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  clubName: string;
}

interface PlayerReview {
  id: string;
  playerName: string;
  playerPhoto: string;
  rating: number;
  comment: string;
  date: string;
  clubName: string;
}

export default function CoachProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Coach data state
  const [coachData, setCoachData] = useState<CoachData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    profilePhoto: '',
    country: '',
    age: '',
    licenseType: '',
    preferredFormation: '',
    profileType: 'trener'
  });

  // Stats state
  const [stats, setStats] = useState<CoachStats>({
    totalMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    pointsPerMatch: 0,
    developedPlayers: 0
  });

  // Other sections state
  const [clubHistory, setClubHistory] = useState<ClubHistory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [playerReviews, setPlayerReviews] = useState<PlayerReview[]>([]);

  // Modal states
  const [showClubModal, setShowClubModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubHistory | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showFormationModal, setShowFormationModal] = useState(false);

  // Form states
  const [clubForm, setClubForm] = useState({
    clubName: '',
    role: '',
    country: '',
    startDate: '',
    endDate: '',
    matches: '',
    pointsPerMatch: '',
    playersInvolved: '',
    achievements: ''
  });

  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    year: '',
    clubName: ''
  });

  // License and formation options
  const licenseOptions = ['UEFA Pro', 'UEFA A', 'UEFA B', 'UEFA C', 'Grassroots', 'Inna'];
  const formationOptions = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2', '4-1-4-1'];

  useEffect(() => {
    loadCoachProfile();
  }, []);

  const loadCoachProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Błąd', 'Brak autoryzacji');
        router.back();
        return;
      }

      const response = await fetch('http://localhost:3001/api/coach/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCoachData(data.coach);
        setStats(data.stats);
        setClubHistory(data.clubHistory || []);
        setAchievements(data.achievements || []);
        setPlayerReviews(data.playerReviews || []);
      } else {
        // Mock data for development
        setCoachData({
          id: '1',
          firstName: 'Michał',
          lastName: 'Probierz',
          email: 'michal.probierz@example.com',
          profilePhoto: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
          country: 'Polska',
          age: '51',
          licenseType: 'UEFA Pro',
          preferredFormation: '3-5-2',
          profileType: 'trener'
        });
        
        setStats({
          totalMatches: 324,
          wins: 156,
          draws: 84,
          losses: 84,
          pointsPerMatch: 1.7,
          developedPlayers: 42
        });
        
        setClubHistory([
          {
            id: '1',
            clubName: 'Reprezentacja Polski',
            role: 'Trener główny',
            country: 'Polska',
            startDate: '2023-09-20',
            matches: 8,
            pointsPerMatch: 1.5,
            playersInvolved: 28
          },
          {
            id: '2',
            clubName: 'Cracovia',
            role: 'Trener główny',
            country: 'Polska',
            startDate: '2020-01-01',
            endDate: '2023-09-19',
            matches: 126,
            pointsPerMatch: 1.6,
            playersInvolved: 48,
            achievements: 'Puchar Polski 2020'
          },
          {
            id: '3',
            clubName: 'Jagiellonia Białystok',
            role: 'Trener główny',
            country: 'Polska',
            startDate: '2017-06-01',
            endDate: '2019-12-31',
            matches: 92,
            pointsPerMatch: 1.8,
            playersInvolved: 36
          }
        ]);
        
        setAchievements([
          {
            id: '1',
            title: 'Puchar Polski',
            description: 'Zdobycie Pucharu Polski w sezonie 2019/2020',
            year: '2020',
            clubName: 'Cracovia'
          },
          {
            id: '2',
            title: 'Wicemistrzostwo Polski',
            description: 'Drugie miejsce w Ekstraklasie',
            year: '2018',
            clubName: 'Jagiellonia Białystok'
          }
        ]);
        
        setPlayerReviews([
          {
            id: '1',
            playerName: 'Robert Lewandowski',
            playerPhoto: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            rating: 5,
            comment: 'Świetny trener taktyczny, bardzo dobrze przygotowuje zespół do meczów. Zawsze ma plan na przeciwnika.',
            date: '2024-01-15',
            clubName: 'Reprezentacja Polski'
          },
          {
            id: '2',
            playerName: 'Piotr Zieliński',
            playerPhoto: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            rating: 4,
            comment: 'Dobry kontakt z zawodnikami, potrafi zmotywować zespół. Czasem zbyt emocjonalny przy linii.',
            date: '2023-12-10',
            clubName: 'Reprezentacja Polski'
          }
        ]);
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
        const response = await fetch('http://localhost:3001/api/coach/upload-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setCoachData(prev => ({ ...prev, profilePhoto: data.photoUrl }));
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
      const response = await fetch('http://localhost:3001/api/coach/basic-data', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coachData),
      });

      if (response.ok) {
        setIsEditing(false);
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

  const saveClub = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const method = editingClub ? 'PUT' : 'POST';
      const url = editingClub 
        ? `http://localhost:3001/api/coach/club-history/${editingClub.id}`
        : 'http://localhost:3001/api/coach/club-history';

      const clubData = {
        ...clubForm,
        matches: parseInt(clubForm.matches) || 0,
        pointsPerMatch: parseFloat(clubForm.pointsPerMatch) || 0,
        playersInvolved: parseInt(clubForm.playersInvolved) || 0
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clubData),
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
        setClubForm({
          clubName: '',
          role: '',
          country: '',
          startDate: '',
          endDate: '',
          matches: '',
          pointsPerMatch: '',
          playersInvolved: '',
          achievements: ''
        });
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
              const response = await fetch(`http://localhost:3001/api/coach/club-history/${clubId}`, {
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

  const saveAchievement = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const method = editingAchievement ? 'PUT' : 'POST';
      const url = editingAchievement 
        ? `http://localhost:3001/api/coach/achievements/${editingAchievement.id}`
        : 'http://localhost:3001/api/coach/achievements';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingAchievement) {
          setAchievements(prev => prev.map(achievement => 
            achievement.id === editingAchievement.id ? data.achievement : achievement
          ));
        } else {
          setAchievements(prev => [...prev, data.achievement]);
        }
        setShowAchievementModal(false);
        setEditingAchievement(null);
        setAchievementForm({
          title: '',
          description: '',
          year: '',
          clubName: ''
        });
        Alert.alert('Sukces', editingAchievement ? 'Sukces zaktualizowany' : 'Sukces dodany');
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      Alert.alert('Błąd', 'Problem z zapisaniem sukcesu');
    }
  };

  const deleteAchievement = async (achievementId: string) => {
    Alert.alert(
      'Potwierdź usunięcie',
      'Czy na pewno chcesz usunąć ten sukces?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`http://localhost:3001/api/coach/achievements/${achievementId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setAchievements(prev => prev.filter(achievement => achievement.id !== achievementId));
                Alert.alert('Sukces', 'Sukces usunięty');
              }
            } catch (error) {
              console.error('Error deleting achievement:', error);
              Alert.alert('Błąd', 'Problem z usunięciem sukcesu');
            }
          }
        }
      ]
    );
  };

  const handleReportReview = (reviewId: string) => {
    Alert.alert(
      'Zgłoś opinię',
      'Czy chcesz zgłosić tę opinię jako nieodpowiednią?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Zgłoś',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`http://localhost:3001/api/coach/report-review/${reviewId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Sukces', 'Opinia została zgłoszona do moderacji');
              }
            } catch (error) {
              console.error('Error reporting review:', error);
              Alert.alert('Błąd', 'Problem ze zgłoszeniem opinii');
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
        clubName: club.clubName,
        role: club.role,
        country: club.country,
        startDate: club.startDate,
        endDate: club.endDate || '',
        matches: club.matches.toString(),
        pointsPerMatch: club.pointsPerMatch.toString(),
        playersInvolved: club.playersInvolved.toString(),
        achievements: club.achievements || ''
      });
    } else {
      setEditingClub(null);
      setClubForm({
        clubName: '',
        role: '',
        country: '',
        startDate: '',
        endDate: '',
        matches: '',
        pointsPerMatch: '',
        playersInvolved: '',
        achievements: ''
      });
    }
    setShowClubModal(true);
  };

  const openEditAchievementModal = (achievement?: Achievement) => {
    if (achievement) {
      setEditingAchievement(achievement);
      setAchievementForm({
        title: achievement.title,
        description: achievement.description,
        year: achievement.year,
        clubName: achievement.clubName
      });
    } else {
      setEditingAchievement(null);
      setAchievementForm({
        title: '',
        description: '',
        year: '',
        clubName: ''
      });
    }
    setShowAchievementModal(true);
  };

  const handleLicenseSelect = (license: string) => {
    setCoachData(prev => ({ ...prev, licenseType: license }));
    setShowLicenseModal(false);
  };

  const handleFormationSelect = (formation: string) => {
    setCoachData(prev => ({ ...prev, preferredFormation: formation }));
    setShowFormationModal(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Ładowanie profilu trenera...</Text>
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
          <Text style={styles.headerTitle}>PROFIL TRENERA</Text>
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Edit size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveBasicData}
              disabled={saving}
            >
              <Save size={24} color="#00FF88" />
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Data Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoUpload}>
              {coachData.profilePhoto ? (
                <Image source={{ uri: coachData.profilePhoto }} style={styles.profilePhoto} />
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
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={coachData.firstName}
                    onChangeText={(text) => setCoachData(prev => ({ ...prev, firstName: text }))}
                    placeholder="Imię"
                    placeholderTextColor="#666666"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={coachData.lastName}
                    onChangeText={(text) => setCoachData(prev => ({ ...prev, lastName: text }))}
                    placeholder="Nazwisko"
                    placeholderTextColor="#666666"
                  />
                </>
              ) : (
                <Text style={styles.coachName}>
                  {coachData.firstName} {coachData.lastName}
                </Text>
              )}
              
              <View style={styles.infoRow}>
                <Flag size={16} color="#888888" />
                {isEditing ? (
                  <TextInput
                    style={styles.editInputInline}
                    value={coachData.country}
                    onChangeText={(text) => setCoachData(prev => ({ ...prev, country: text }))}
                    placeholder="Kraj"
                    placeholderTextColor="#666666"
                  />
                ) : (
                  <Text style={styles.infoValue}>{coachData.country || 'Nie podano'}</Text>
                )}
              </View>
              
              <View style={styles.infoRow}>
                <Calendar size={16} color="#888888" />
                {isEditing ? (
                  <TextInput
                    style={styles.editInputInline}
                    value={coachData.age}
                    onChangeText={(text) => setCoachData(prev => ({ ...prev, age: text }))}
                    placeholder="Wiek"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.infoValue}>{coachData.age ? `${coachData.age} lat` : 'Nie podano'}</Text>
                )}
              </View>
              
              <View style={styles.infoRow}>
                <Award size={16} color="#888888" />
                {isEditing ? (
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={() => setShowLicenseModal(true)}
                  >
                    <Text style={styles.selectButtonText}>
                      {coachData.licenseType || 'Wybierz licencję'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoValue}>{coachData.licenseType || 'Nie podano'}</Text>
                )}
              </View>
              
              <View style={styles.infoRow}>
                <Users size={16} color="#888888" />
                {isEditing ? (
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={() => setShowFormationModal(true)}
                  >
                    <Text style={styles.selectButtonText}>
                      {coachData.preferredFormation || 'Wybierz formację'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoValue}>{coachData.preferredFormation || 'Nie podano'}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATYSTYKI TRENERSKIE</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMatches}</Text>
              <Text style={styles.statLabel}>Mecze</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Wygrane</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.draws}</Text>
              <Text style={styles.statLabel}>Remisy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.losses}</Text>
              <Text style={styles.statLabel}>Porażki</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.pointsPerMatch.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Pkt/mecz</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.developedPlayers}</Text>
              <Text style={styles.statLabel}>Wychowankowie</Text>
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SUKCESY ZESPOŁOWE</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openEditAchievementModal()}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementHeader}>
                  <View style={styles.achievementTitleContainer}>
                    <Award size={20} color="#FFD700" />
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  </View>
                  <Text style={styles.achievementYear}>{achievement.year}</Text>
                </View>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <Text style={styles.achievementClub}>{achievement.clubName}</Text>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openEditAchievementModal(achievement)}
                  >
                    <Edit size={16} color="#888888" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => deleteAchievement(achievement.id)}
                  >
                    <Trash2 size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak sukcesów zespołowych</Text>
          )}
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
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Klub</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Funkcja</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Okres</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Mecze</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Pkt/M</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Akcje</Text>
          </View>
          
          {clubHistory.length > 0 ? (
            clubHistory.map((club) => (
              <View key={club.id} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 2 }]}>
                  <Text style={styles.clubName}>{club.clubName}</Text>
                  <Text style={styles.clubCountry}>{club.country}</Text>
                </View>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{club.role}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {club.startDate.split('-')[0]}-{club.endDate ? club.endDate.split('-')[0] : 'teraz'}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>{club.matches}</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>{club.pointsPerMatch}</Text>
                <View style={[styles.tableCell, { flex: 0.8 }]}>
                  <View style={styles.rowActions}>
                    <TouchableOpacity 
                      style={styles.smallActionButton}
                      onPress={() => openEditClubModal(club)}
                    >
                      <Edit size={14} color="#888888" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.smallActionButton}
                      onPress={() => deleteClub(club.id)}
                    >
                      <Trash2 size={14} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak historii klubowej</Text>
          )}
        </View>

        {/* Player Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OPINIE OD ZAWODNIKÓW</Text>
          
          {playerReviews.length > 0 ? (
            playerReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.playerPhoto }} style={styles.reviewerPhoto} />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.playerName}</Text>
                    <Text style={styles.reviewerClub}>{review.clubName}</Text>
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
                <TouchableOpacity 
                  style={styles.reportButton}
                  onPress={() => handleReportReview(review.id)}
                >
                  <Text style={styles.reportButtonText}>Zgłoś opinię</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Brak opinii od zawodników</Text>
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
            
            <ScrollView style={styles.modalScrollView}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nazwa klubu"
                placeholderTextColor="#666666"
                value={clubForm.clubName}
                onChangeText={(text) => setClubForm({...clubForm, clubName: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Funkcja (np. Trener główny, Asystent)"
                placeholderTextColor="#666666"
                value={clubForm.role}
                onChangeText={(text) => setClubForm({...clubForm, role: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Kraj"
                placeholderTextColor="#666666"
                value={clubForm.country}
                onChangeText={(text) => setClubForm({...clubForm, country: text})}
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
                placeholder="Data zakończenia (YYYY-MM-DD, opcjonalnie)"
                placeholderTextColor="#666666"
                value={clubForm.endDate}
                onChangeText={(text) => setClubForm({...clubForm, endDate: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Liczba meczów"
                placeholderTextColor="#666666"
                value={clubForm.matches}
                onChangeText={(text) => setClubForm({...clubForm, matches: text})}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Punkty na mecz (np. 1.8)"
                placeholderTextColor="#666666"
                value={clubForm.pointsPerMatch}
                onChangeText={(text) => setClubForm({...clubForm, pointsPerMatch: text})}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Liczba zaangażowanych zawodników"
                placeholderTextColor="#666666"
                value={clubForm.playersInvolved}
                onChangeText={(text) => setClubForm({...clubForm, playersInvolved: text})}
                keyboardType="numeric"
              />
              
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Sukcesy (opcjonalnie)"
                placeholderTextColor="#666666"
                value={clubForm.achievements}
                onChangeText={(text) => setClubForm({...clubForm, achievements: text})}
                multiline
                numberOfLines={3}
              />
            </ScrollView>
            
            <TouchableOpacity style={styles.modalButton} onPress={saveClub}>
              <Text style={styles.modalButtonText}>Zapisz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Achievement Modal */}
      <Modal visible={showAchievementModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAchievement ? 'Edytuj sukces' : 'Dodaj sukces'}
              </Text>
              <TouchableOpacity onPress={() => setShowAchievementModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Tytuł (np. Mistrzostwo, Puchar)"
              placeholderTextColor="#666666"
              value={achievementForm.title}
              onChangeText={(text) => setAchievementForm({...achievementForm, title: text})}
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Opis sukcesu"
              placeholderTextColor="#666666"
              value={achievementForm.description}
              onChangeText={(text) => setAchievementForm({...achievementForm, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Rok (np. 2023)"
              placeholderTextColor="#666666"
              value={achievementForm.year}
              onChangeText={(text) => setAchievementForm({...achievementForm, year: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nazwa klubu"
              placeholderTextColor="#666666"
              value={achievementForm.clubName}
              onChangeText={(text) => setAchievementForm({...achievementForm, clubName: text})}
            />
            
            <TouchableOpacity style={styles.modalButton} onPress={saveAchievement}>
              <Text style={styles.modalButtonText}>Zapisz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* License Modal */}
      <Modal visible={showLicenseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz licencję</Text>
              <TouchableOpacity onPress={() => setShowLicenseModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {licenseOptions.map((license) => (
                <TouchableOpacity
                  key={license}
                  style={[
                    styles.optionItem,
                    coachData.licenseType === license && styles.selectedOption
                  ]}
                  onPress={() => handleLicenseSelect(license)}
                >
                  <Text style={styles.optionText}>{license}</Text>
                  {coachData.licenseType === license && (
                    <Award size={20} color="#00FF88" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Formation Modal */}
      <Modal visible={showFormationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz formację</Text>
              <TouchableOpacity onPress={() => setShowFormationModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {formationOptions.map((formation) => (
                <TouchableOpacity
                  key={formation}
                  style={[
                    styles.optionItem,
                    coachData.preferredFormation === formation && styles.selectedOption
                  ]}
                  onPress={() => handleFormationSelect(formation)}
                >
                  <Text style={styles.optionText}>{formation}</Text>
                  {coachData.preferredFormation === formation && (
                    <Users size={20} color="#00FF88" />
                  )}
                </TouchableOpacity>
              ))}
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
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  profileHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 20,
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
    flex: 1,
  },
  coachName: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  editInputInline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  selectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    flex: 1,
  },
  selectButtonText: {
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
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  achievementYear: {
    fontSize: 14,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFD700',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#AAAAAA',
    marginBottom: 8,
  },
  achievementClub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  clubName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  clubCountry: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  smallActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  reviewerClub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
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
    color: '#DDDDDD',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportButton: {
    alignSelf: 'flex-end',
  },
  reportButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textDecorationLine: 'underline',
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
  modalScrollView: {
    maxHeight: height * 0.5,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
});