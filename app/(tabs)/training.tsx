import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  Modal,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallpaper as SoccerBall, Calendar, Clock, Users, Plus, ChevronRight, Check, X, Clock3, Search, Filter, CreditCard as Edit, Trash2, FileText, Video } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Training {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  playersConfirmed: number;
  totalPlayers: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  hasConspect: boolean;
  hasVideo: boolean;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  position: string;
  status: 'present' | 'absent' | 'late' | 'unknown';
}

export default function TrainingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  const upcomingTrainings: Training[] = [
    {
      id: '1',
      date: '15.06.2024',
      time: '17:00',
      title: 'Trening taktyczny',
      location: 'Boisko główne',
      playersConfirmed: 18,
      totalPlayers: 22,
      status: 'upcoming',
      hasConspect: true,
      hasVideo: false
    },
    {
      id: '2',
      date: '17.06.2024',
      time: '16:30',
      title: 'Trening siłowy',
      location: 'Siłownia klubowa',
      playersConfirmed: 20,
      totalPlayers: 22,
      status: 'upcoming',
      hasConspect: true,
      hasVideo: false
    }
  ];

  const ongoingTrainings: Training[] = [
    {
      id: '3',
      date: '13.06.2024',
      time: '17:00',
      title: 'Trening kondycyjny',
      location: 'Boisko treningowe',
      playersConfirmed: 21,
      totalPlayers: 22,
      status: 'ongoing',
      hasConspect: true,
      hasVideo: false
    }
  ];

  const completedTrainings: Training[] = [
    {
      id: '4',
      date: '12.06.2024',
      time: '17:00',
      title: 'Trening techniczny',
      location: 'Boisko treningowe',
      playersConfirmed: 19,
      totalPlayers: 22,
      status: 'completed',
      hasConspect: true,
      hasVideo: true
    },
    {
      id: '5',
      date: '10.06.2024',
      time: '16:00',
      title: 'Trening taktyczny',
      location: 'Boisko główne',
      playersConfirmed: 20,
      totalPlayers: 22,
      status: 'completed',
      hasConspect: true,
      hasVideo: true
    }
  ];

  const players: Player[] = [
    { id: '1', name: 'Robert Lewandowski', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', position: 'Napastnik', status: 'present' },
    { id: '2', name: 'Piotr Zieliński', avatar: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', position: 'Pomocnik', status: 'present' },
    { id: '3', name: 'Wojciech Szczęsny', avatar: 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', position: 'Bramkarz', status: 'late' },
    { id: '4', name: 'Jan Bednarek', avatar: 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', position: 'Obrońca', status: 'absent' },
    { id: '5', name: 'Kamil Glik', avatar: 'https://images.pexels.com/photos/1222275/pexels-photo-1222275.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', position: 'Obrońca', status: 'unknown' }
  ];

  const handleTrainingPress = (training: Training) => {
    router.push(`/training-detail?id=${training.id}`);
  };

  const handleCreateTraining = () => {
    router.push('/create-training');
  };

  const handleAttendance = (training: Training) => {
    setSelectedTraining(training);
    setShowAttendanceModal(true);
  };

  const updatePlayerStatus = (playerId: string, status: 'present' | 'absent' | 'late') => {
    // In a real app, this would update the player's status in the database
    Alert.alert('Status zaktualizowany', `Status zawodnika został zmieniony na: ${status}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#00FF88';
      case 'absent': return '#FF4444';
      case 'late': return '#FFD700';
      default: return '#888888';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check size={16} color="#00FF88" />;
      case 'absent': return <X size={16} color="#FF4444" />;
      case 'late': return <Clock3 size={16} color="#FFD700" />;
      default: return <Check size={16} color="#888888" />;
    }
  };

  const renderTrainingCard = (training: Training) => (
    <View key={training.id} style={styles.trainingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <SoccerBall size={20} color={training.status === 'completed' ? '#888888' : '#00FF88'} />
          <Text style={styles.cardTitle}>{training.title}</Text>
        </View>
        <View style={styles.cardActions}>
          {training.hasConspect && (
            <TouchableOpacity style={styles.iconButton}>
              <FileText size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {training.hasVideo && (
            <TouchableOpacity style={styles.iconButton}>
              <Video size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#888888" />
          <Text style={styles.detailText}>{training.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color="#888888" />
          <Text style={styles.detailText}>{training.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Users size={16} color="#888888" />
          <Text style={styles.detailText}>
            {training.playersConfirmed}/{training.totalPlayers} zawodników
          </Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleTrainingPress(training)}
        >
          <Text style={styles.actionButtonText}>Szczegóły</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.attendanceButton]}
          onPress={() => handleAttendance(training)}
        >
          <Text style={styles.attendanceButtonText}>Obecność</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TRENINGI</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilter(!showFilter)}
            >
              <Filter size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleCreateTraining}
            >
              <Plus size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {showFilter && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#888888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Szukaj treningów..."
                placeholderTextColor="#888888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'upcoming' && styles.activeTab
            ]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText
            ]}>
              Nadchodzące
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'ongoing' && styles.activeTab
            ]}
            onPress={() => setActiveTab('ongoing')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'ongoing' && styles.activeTabText
            ]}>
              W trakcie
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'completed' && styles.activeTab
            ]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText
            ]}>
              Zakończone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Training List */}
        <View style={styles.trainingList}>
          {activeTab === 'upcoming' && upcomingTrainings.map(training => renderTrainingCard(training))}
          {activeTab === 'ongoing' && ongoingTrainings.map(training => renderTrainingCard(training))}
          {activeTab === 'completed' && completedTrainings.map(training => renderTrainingCard(training))}
          
          {activeTab === 'upcoming' && upcomingTrainings.length === 0 && (
            <View style={styles.emptyState}>
              <SoccerBall size={48} color="#666666" />
              <Text style={styles.emptyText}>Brak nadchodzących treningów</Text>
            </View>
          )}
          
          {activeTab === 'ongoing' && ongoingTrainings.length === 0 && (
            <View style={styles.emptyState}>
              <SoccerBall size={48} color="#666666" />
              <Text style={styles.emptyText}>Brak trwających treningów</Text>
            </View>
          )}
          
          {activeTab === 'completed' && completedTrainings.length === 0 && (
            <View style={styles.emptyState}>
              <SoccerBall size={48} color="#666666" />
              <Text style={styles.emptyText}>Brak zakończonych treningów</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Attendance Modal */}
      <Modal
        visible={showAttendanceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lista obecności</Text>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {selectedTraining && (
              <View style={styles.trainingInfo}>
                <Text style={styles.trainingTitle}>{selectedTraining.title}</Text>
                <View style={styles.trainingDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#888888" />
                    <Text style={styles.detailText}>{selectedTraining.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#888888" />
                    <Text style={styles.detailText}>{selectedTraining.time}</Text>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.attendanceStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>18</Text>
                <Text style={styles.statLabel}>Obecnych</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Nieobecnych</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>1</Text>
                <Text style={styles.statLabel}>Spóźnionych</Text>
              </View>
            </View>
            
            <ScrollView style={styles.playersList}>
              {players.map(player => (
                <View key={player.id} style={styles.playerItem}>
                  <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerPosition}>{player.position}</Text>
                  </View>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity 
                      style={[
                        styles.statusButton, 
                        player.status === 'present' && styles.activeStatusButton
                      ]}
                      onPress={() => updatePlayerStatus(player.id, 'present')}
                    >
                      <Check size={16} color={player.status === 'present' ? '#FFFFFF' : '#00FF88'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.statusButton, 
                        player.status === 'absent' && styles.absentButton
                      ]}
                      onPress={() => updatePlayerStatus(player.id, 'absent')}
                    >
                      <X size={16} color={player.status === 'absent' ? '#FFFFFF' : '#FF4444'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.statusButton, 
                        player.status === 'late' && styles.lateButton
                      ]}
                      onPress={() => updatePlayerStatus(player.id, 'late')}
                    >
                      <Clock3 size={16} color={player.status === 'late' ? '#FFFFFF' : '#FFD700'} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                Alert.alert('Zapisano', 'Lista obecności została zaktualizowana');
                setShowAttendanceModal(false);
              }}
            >
              <Text style={styles.saveButtonText}>Zapisz obecność</Text>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  activeTabText: {
    color: '#000000',
  },
  trainingList: {
    marginBottom: 32,
  },
  trainingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 6,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  attendanceButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  attendanceButtonText: {
    color: '#00FF88',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 16,
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
  trainingInfo: {
    marginBottom: 20,
  },
  trainingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  trainingDetails: {
    flexDirection: 'row',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  playersList: {
    maxHeight: 300,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  activeStatusButton: {
    backgroundColor: '#00FF88',
  },
  absentButton: {
    backgroundColor: '#FF4444',
  },
  lateButton: {
    backgroundColor: '#FFD700',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
});