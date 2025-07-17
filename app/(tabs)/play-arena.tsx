import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Users, Clock, Trophy, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Game {
  id: string;
  title: string;
  description: string;
  creator: string;
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  createdAt: string;
}

export default function PlayArenaScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    description: '',
    maxPlayers: 12, // 6 + 6 players
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/games', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleAddGame = async () => {
    if (!newGame.title.trim() || !newGame.description.trim()) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/add-game', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newGame.title,
          description: newGame.description,
          maxPlayers: newGame.maxPlayers,
        }),
      });

      if (response.ok) {
        Alert.alert('Sukces', 'Gra została dodana!');
        setShowAddModal(false);
        setNewGame({ title: '', description: '', maxPlayers: 12 });
        loadGames();
      } else {
        Alert.alert('Błąd', 'Nie udało się dodać gry');
      }
    } catch (error) {
      console.error('Error adding game:', error);
      Alert.alert('Błąd', 'Problem z połączeniem');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Sukces', 'Dołączyłeś do gry!');
        loadGames();
      } else {
        Alert.alert('Błąd', 'Nie udało się dołączyć do gry');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Błąd', 'Problem z połączeniem');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return '#FFD700';
      case 'active': return '#00FF88';
      case 'completed': return '#888888';
      default: return '#FFFFFF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Oczekuje';
      case 'active': return 'Aktywna';
      case 'completed': return 'Zakończona';
      default: return 'Nieznany';
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PLAY ARENA</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Challenge Board */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TABLICA WYZWAŃ</Text>
          
          {games.length > 0 ? (
            games.map((game) => (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(game.status) }]}>
                    <Text style={[styles.statusText, { color: game.status === 'waiting' ? '#000000' : '#FFFFFF' }]}>
                      {getStatusText(game.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.gameDescription}>{game.description}</Text>

                <View style={styles.gameInfo}>
                  <View style={styles.infoItem}>
                    <Users size={16} color="#888888" />
                    <Text style={styles.infoText}>
                      {game.players.length}/{game.maxPlayers} graczy
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Clock size={16} color="#888888" />
                    <Text style={styles.infoText}>{game.createdAt}</Text>
                  </View>
                </View>

                <View style={styles.gameFooter}>
                  <Text style={styles.creatorText}>Utworzone przez: {game.creator}</Text>
                  {game.status === 'waiting' && (
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => handleJoinGame(game.id)}
                    >
                      <Text style={styles.joinButtonText}>Dołącz</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Player Slots Visualization */}
                <View style={styles.slotsContainer}>
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamTitle}>Drużyna A</Text>
                    <View style={styles.playerSlots}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <View
                          key={`team-a-${index}`}
                          style={[
                            styles.playerSlot,
                            game.players[index] && styles.occupiedSlot
                          ]}
                        >
                          <Text style={styles.slotText}>
                            {game.players[index] ? game.players[index].substring(0, 2) : `${index + 1}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.teamContainer}>
                    <Text style={styles.teamTitle}>Drużyna B</Text>
                    <View style={styles.playerSlots}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <View
                          key={`team-b-${index}`}
                          style={[
                            styles.playerSlot,
                            game.players[index + 6] && styles.occupiedSlot
                          ]}
                        >
                          <Text style={styles.slotText}>
                            {game.players[index + 6] ? game.players[index + 6].substring(0, 2) : `${index + 7}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Trophy size={48} color="#666666" />
              <Text style={styles.emptyText}>Brak aktywnych gier</Text>
              <Text style={styles.emptySubtext}>Dodaj pierwszą grę i zacznij wyzwanie!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Game Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj nową grę</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Tytuł gry"
              placeholderTextColor="#666666"
              value={newGame.title}
              onChangeText={(text) => setNewGame({ ...newGame, title: text })}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Opis gry"
              placeholderTextColor="#666666"
              value={newGame.description}
              onChangeText={(text) => setNewGame({ ...newGame, description: text })}
              multiline
              numberOfLines={4}
            />

            <View style={styles.playersSelector}>
              <Text style={styles.selectorLabel}>Maksymalna liczba graczy:</Text>
              <View style={styles.selectorButtons}>
                {[12, 14, 16, 18, 20, 22].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.selectorButton,
                      newGame.maxPlayers === num && styles.selectedButton
                    ]}
                    onPress={() => setNewGame({ ...newGame, maxPlayers: num })}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      newGame.maxPlayers === num && styles.selectedButtonText
                    ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.addGameButton}
              onPress={handleAddGame}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.addGameButtonGradient}
              >
                <Text style={styles.addGameButtonText}>
                  {loading ? 'Dodawanie...' : 'Dodaj grę'}
                </Text>
              </LinearGradient>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  gameDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    lineHeight: 20,
    marginBottom: 16,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 8,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  joinButton: {
    backgroundColor: '#00FF88',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  teamTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  playerSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  playerSlot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  occupiedSlot: {
    backgroundColor: '#00FF88',
  },
  slotText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  playersSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: '#00FF88',
  },
  selectorButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  selectedButtonText: {
    color: '#000000',
  },
  addGameButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addGameButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGameButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
});