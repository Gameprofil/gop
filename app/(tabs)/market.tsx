import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, MapPin, Calendar, DollarSign, Star, Heart, X, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Player {
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
  isWatched: boolean;
}

export default function MarketScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [watchedPlayers, setWatchedPlayers] = useState<Player[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showWatchedModal, setShowWatchedModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtry
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    minPrice: '',
    maxPrice: '',
    country: '',
    club: ''
  });

  const positions = [
    { id: 'all', label: 'Wszystkie', short: 'ALL' },
    { id: 'gk', label: 'Bramkarz', short: 'GK' },
    { id: 'def', label: 'Obrońca', short: 'DEF' },
    { id: 'mid', label: 'Pomocnik', short: 'MID' },
    { id: 'att', label: 'Napastnik', short: 'ATT' },
  ];

  useEffect(() => {
    fetchPlayers();
    loadWatchedPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [searchQuery, selectedPosition, filters, players]);

  const fetchPlayers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/market/players', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
      } else {
        // Fallback do mock danych jeśli API nie działa
        setPlayers(mockPlayers);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers(mockPlayers);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchedPlayers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/market/watched', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWatchedPlayers(data.watchedPlayers || []);
      }
    } catch (error) {
      console.error('Error loading watched players:', error);
    }
  };

  const filterPlayers = () => {
    let filtered = [...players];

    // Wyszukiwanie po tekście
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(player => 
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(query) ||
        player.club.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query) ||
        player.country.toLowerCase().includes(query)
      );
    }

    // Filtr pozycji
    if (selectedPosition !== 'all') {
      filtered = filtered.filter(player => {
        const pos = player.position.toLowerCase();
        switch (selectedPosition) {
          case 'gk': return pos.includes('gk') || pos.includes('bramkarz');
          case 'def': return pos.includes('def') || pos.includes('obrońca') || pos.includes('cb') || pos.includes('lb') || pos.includes('rb');
          case 'mid': return pos.includes('mid') || pos.includes('pomocnik') || pos.includes('cm') || pos.includes('dm') || pos.includes('am');
          case 'att': return pos.includes('att') || pos.includes('napastnik') || pos.includes('st') || pos.includes('lw') || pos.includes('rw');
          default: return true;
        }
      });
    }

    // Dodatkowe filtry
    if (filters.minAge) {
      filtered = filtered.filter(player => player.age >= parseInt(filters.minAge));
    }
    if (filters.maxAge) {
      filtered = filtered.filter(player => player.age <= parseInt(filters.maxAge));
    }
    if (filters.country) {
      filtered = filtered.filter(player => 
        player.country.toLowerCase().includes(filters.country.toLowerCase())
      );
    }
    if (filters.club) {
      filtered = filtered.filter(player => 
        player.club.toLowerCase().includes(filters.club.toLowerCase())
      );
    }

    setFilteredPlayers(filtered);
  };

  const handlePlayerPress = (player: Player) => {
    // Przekieruj do profilu gracza
    router.push({
      pathname: '/player-detail',
      params: { playerId: player.id }
    });
  };

  const toggleWatchPlayer = async (player: Player) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const isCurrentlyWatched = watchedPlayers.some(p => p.id === player.id);
      
      const response = await fetch(`http://localhost:3001/api/market/watch/${player.id}`, {
        method: isCurrentlyWatched ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (isCurrentlyWatched) {
          setWatchedPlayers(prev => prev.filter(p => p.id !== player.id));
          Alert.alert('Sukces', 'Gracz usunięty z obserwowanych');
        } else {
          setWatchedPlayers(prev => [...prev, player]);
          Alert.alert('Sukces', 'Gracz dodany do obserwowanych');
        }
        
        // Aktualizuj status w liście graczy
        setPlayers(prev => prev.map(p => 
          p.id === player.id ? { ...p, isWatched: !isCurrentlyWatched } : p
        ));
      } else {
        Alert.alert('Błąd', 'Nie udało się zaktualizować obserwowanych');
      }
    } catch (error) {
      console.error('Error toggling watch:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas aktualizacji');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return '#00FF88';
    if (rating >= 75) return '#FFD700';
    if (rating >= 70) return '#FFA500';
    return '#888888';
  };

  const clearFilters = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      minPrice: '',
      maxPrice: '',
      country: '',
      club: ''
    });
    setSearchQuery('');
    setSelectedPosition('all');
  };

  // Mock data dla testów
  const mockPlayers: Player[] = [
    {
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
      isWatched: false,
    },
    {
      id: '2',
      firstName: 'Michał',
      lastName: 'Nowak',
      position: 'ST',
      age: 19,
      club: 'Cracovia',
      country: 'Polska',
      price: '1.8M €',
      rating: 75,
      image: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      isWatched: false,
    },
    {
      id: '3',
      firstName: 'Adam',
      lastName: 'Zieliński',
      position: 'CB',
      age: 25,
      club: 'Wisła Kraków',
      country: 'Polska',
      price: '3.2M €',
      rating: 80,
      image: 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      isWatched: false,
    },
    {
      id: '4',
      firstName: 'Jakub',
      lastName: 'Wójcik',
      position: 'GK',
      age: 28,
      club: 'Jagiellonia',
      country: 'Polska',
      price: '1.5M €',
      rating: 82,
      image: 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      isWatched: false,
    },
  ];

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RYNEK TRANSFEROWY</Text>
          <TouchableOpacity 
            style={styles.watchedButton}
            onPress={() => setShowWatchedModal(true)}
          >
            <Bookmark size={24} color="#FFFFFF" />
            {watchedPlayers.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{watchedPlayers.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#888888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj graczy, klubów, pozycji..."
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Position Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.positionFilters}
        >
          {positions.map((position) => (
            <TouchableOpacity
              key={position.id}
              style={[
                styles.positionChip,
                selectedPosition === position.id && styles.activePositionChip
              ]}
              onPress={() => setSelectedPosition(position.id)}
            >
              <Text
                style={[
                  styles.positionText,
                  selectedPosition === position.id && styles.activePositionText
                ]}
              >
                {position.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Advanced Filters Button */}
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={styles.filtersButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={16} color="#888888" />
            <Text style={styles.filtersButtonText}>Więcej filtrów</Text>
          </TouchableOpacity>
          
          {(searchQuery || selectedPosition !== 'all' || Object.values(filters).some(f => f)) && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Wyczyść</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          Znaleziono {filteredPlayers.length} graczy
        </Text>

        {/* Players Grid */}
        <View style={styles.playersGrid}>
          {filteredPlayers.map((player) => (
            <TouchableOpacity 
              key={player.id} 
              style={styles.playerCard}
              onPress={() => handlePlayerPress(player)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.cardGradient}
              >
                <View style={styles.playerImageContainer}>
                  <Image source={{ uri: player.image }} style={styles.playerImage} />
                  <View style={styles.ratingBadge}>
                    <Text style={[styles.ratingText, { color: getRatingColor(player.rating) }]}>
                      {player.rating}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {player.firstName} {player.lastName}
                  </Text>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                  <Text style={styles.playerClub}>{player.club}</Text>
                </View>

                <View style={styles.playerDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Wiek:</Text>
                    <Text style={styles.detailValue}>{player.age}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kraj:</Text>
                    <Text style={styles.detailValue}>{player.country}</Text>
                  </View>
                </View>

                <View style={styles.playerFooter}>
                  <Text style={styles.priceText}>{player.price}</Text>
                  <TouchableOpacity 
                    style={styles.watchButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleWatchPlayer(player);
                    }}
                  >
                    <Heart 
                      size={16} 
                      color={watchedPlayers.some(p => p.id === player.id) ? "#FF4444" : "#888888"}
                      fill={watchedPlayers.some(p => p.id === player.id) ? "#FF4444" : "transparent"}
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {filteredPlayers.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Search size={48} color="#666666" />
            <Text style={styles.emptyText}>Brak graczy spełniających kryteria</Text>
            <Text style={styles.emptySubtext}>Spróbuj zmienić filtry wyszukiwania</Text>
          </View>
        )}
      </ScrollView>

      {/* Advanced Filters Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtry zaawansowane</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Wiek</Text>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Od"
                  placeholderTextColor="#666666"
                  value={filters.minAge}
                  onChangeText={(text) => setFilters({...filters, minAge: text})}
                  keyboardType="numeric"
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Do"
                  placeholderTextColor="#666666"
                  value={filters.maxAge}
                  onChangeText={(text) => setFilters({...filters, maxAge: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Kraj</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="np. Polska"
                placeholderTextColor="#666666"
                value={filters.country}
                onChangeText={(text) => setFilters({...filters, country: text})}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Klub</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="np. Legia Warszawa"
                placeholderTextColor="#666666"
                value={filters.club}
                onChangeText={(text) => setFilters({...filters, club: text})}
              />
            </View>

            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersText}>Zastosuj filtry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Watched Players Modal */}
      <Modal visible={showWatchedModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Obserwowani gracze ({watchedPlayers.length})</Text>
              <TouchableOpacity onPress={() => setShowWatchedModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.watchedList}>
              {watchedPlayers.length > 0 ? (
                watchedPlayers.map((player) => (
                  <TouchableOpacity 
                    key={player.id} 
                    style={styles.watchedPlayerCard}
                    onPress={() => {
                      setShowWatchedModal(false);
                      handlePlayerPress(player);
                    }}
                  >
                    <Image source={{ uri: player.image }} style={styles.watchedPlayerImage} />
                    <View style={styles.watchedPlayerInfo}>
                      <Text style={styles.watchedPlayerName}>
                        {player.firstName} {player.lastName}
                      </Text>
                      <Text style={styles.watchedPlayerDetails}>
                        {player.position} • {player.club}
                      </Text>
                      <Text style={styles.watchedPlayerPrice}>{player.price}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeWatchButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleWatchPlayer(player);
                      }}
                    >
                      <X size={16} color="#FF4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyWatched}>
                  <Bookmark size={48} color="#666666" />
                  <Text style={styles.emptyWatchedText}>Brak obserwowanych graczy</Text>
                  <Text style={styles.emptyWatchedSubtext}>
                    Dodaj graczy do obserwowanych klikając ikonę serca
                  </Text>
                </View>
              )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  watchedButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
  positionFilters: {
    marginBottom: 16,
  },
  positionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  activePositionChip: {
    backgroundColor: '#FFFFFF',
  },
  positionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  activePositionText: {
    color: '#000000',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filtersButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 16,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playerCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  playerImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ratingBadge: {
    position: 'absolute',
    top: -4,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Oswald-Bold',
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  playerClub: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  playerDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  detailValue: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  playerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Oswald-SemiBold',
    color: '#00FF88',
  },
  watchButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  filterInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  rangeSeparator: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginHorizontal: 12,
  },
  applyFiltersButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  watchedList: {
    maxHeight: 400,
  },
  watchedPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  watchedPlayerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  watchedPlayerInfo: {
    flex: 1,
  },
  watchedPlayerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  watchedPlayerDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  watchedPlayerPrice: {
    fontSize: 12,
    fontFamily: 'Oswald-SemiBold',
    color: '#00FF88',
  },
  removeWatchButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWatched: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyWatchedText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyWatchedSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
});