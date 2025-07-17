import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, Clock, ChevronDown, Filter, Trophy, Target, Users, ChartBar as BarChart3, MessageCircle, Plus, Search, ChevronRight, Star, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MatchCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time: string;
  stadium: string;
  league: string;
  status: 'scheduled' | 'live' | 'finished';
  minute?: number;
  round?: number;
}

function MatchCard({ id, homeTeam, awayTeam, homeScore, awayScore, date, time, stadium, league, status, minute, round }: MatchCardProps) {
  const router = useRouter();

  const handleMatchPress = () => {
    router.push({
      pathname: '/match-detail',
      params: { matchId: id }
    });
  };

  const getStatusColor = () => {
    switch (status) {
      case 'live': return '#00FF88';
      case 'finished': return '#888888';
      default: return '#FFFFFF';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'live': return `${minute}'`;
      case 'finished': return 'Zakończony';
      default: return time;
    }
  };

  return (
    <TouchableOpacity style={styles.matchCard} onPress={handleMatchPress} activeOpacity={0.8}>
      <View style={styles.matchHeader}>
        <Text style={styles.leagueText}>{league}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status === 'live' ? '#00FF88' : 'rgba(255, 255, 255, 0.1)' }]}>
          <Text style={[styles.statusText, { color: status === 'live' ? '#000000' : getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {round && (
        <Text style={styles.roundText}>Kolejka {round}</Text>
      )}

      <View style={styles.matchContent}>
        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{homeTeam}</Text>
          <Text style={styles.teamName}>{awayTeam}</Text>
        </View>

        <View style={styles.scoreSection}>
          {status !== 'scheduled' ? (
            <>
              <Text style={styles.score}>{homeScore}</Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.score}>{awayScore}</Text>
            </>
          ) : (
            <Text style={styles.vsText}>vs</Text>
          )}
        </View>
      </View>

      <View style={styles.matchFooter}>
        <View style={styles.matchInfo}>
          <Calendar size={14} color="#666666" />
          <Text style={styles.matchInfoText}>{date}</Text>
        </View>
        <View style={styles.matchInfo}>
          <MapPin size={14} color="#666666" />
          <Text style={styles.matchInfoText}>{stadium}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RozgrywkiScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('mecze');
  const [selectedLeague, setSelectedLeague] = useState('Ekstraklasa');
  const [selectedSubLeague, setSelectedSubLeague] = useState('');
  const [selectedRound, setSelectedRound] = useState('Wszystkie');
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Liga structure
  const leagues = {
    'Ekstraklasa': {
      name: 'Ekstraklasa',
      subLeagues: [],
      level: 1
    },
    '1 Liga': {
      name: '1 Liga',
      subLeagues: [],
      level: 2
    },
    '2 Liga': {
      name: '2 Liga',
      subLeagues: ['Grupa Wschodnia', 'Grupa Zachodnia'],
      level: 3
    },
    '3 Liga': {
      name: '3 Liga',
      subLeagues: ['Grupa I', 'Grupa II', 'Grupa III', 'Grupa IV'],
      level: 4
    },
    'Klasa Okręgowa': {
      name: 'Klasa Okręgowa',
      subLeagues: ['Mazowiecka', 'Małopolska', 'Śląska', 'Wielkopolska'],
      level: 5
    }
  };

  const rounds = ['Wszystkie', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

  // Liga data
  const leagueTable = [
    { position: 1, team: 'Legia Warszawa', points: 67, matches: 30, wins: 21, draws: 4, losses: 5, goalsFor: 65, goalsAgainst: 28, goalDiff: 37 },
    { position: 2, team: 'Lech Poznań', points: 63, matches: 30, wins: 19, draws: 6, losses: 5, goalsFor: 58, goalsAgainst: 32, goalDiff: 26 },
    { position: 3, team: 'Cracovia', points: 58, matches: 30, wins: 17, draws: 7, losses: 6, goalsFor: 52, goalsAgainst: 35, goalDiff: 17 },
    { position: 4, team: 'Jagiellonia', points: 54, matches: 30, wins: 16, draws: 6, losses: 8, goalsFor: 48, goalsAgainst: 38, goalDiff: 10 },
    { position: 5, team: 'Wisła Kraków', points: 48, matches: 30, wins: 14, draws: 6, losses: 10, goalsFor: 45, goalsAgainst: 42, goalDiff: 3 },
    { position: 6, team: 'Pogoń Szczecin', points: 45, matches: 30, wins: 13, draws: 6, losses: 11, goalsFor: 41, goalsAgainst: 45, goalDiff: -4 },
    { position: 7, team: 'Raków Częstochowa', points: 42, matches: 30, wins: 12, draws: 6, losses: 12, goalsFor: 38, goalsAgainst: 48, goalDiff: -10 },
    { position: 8, team: 'Górnik Zabrze', points: 38, matches: 30, wins: 10, draws: 8, losses: 12, goalsFor: 35, goalsAgainst: 50, goalDiff: -15 },
  ];

  const topScorers = [
    { name: 'Robert Lewandowski', team: 'Legia Warszawa', goals: 24, matches: 28, assists: 8 },
    { name: 'Piotr Kowalski', team: 'Lech Poznań', goals: 19, matches: 30, assists: 12 },
    { name: 'Michał Nowak', team: 'Cracovia', goals: 17, matches: 29, assists: 6 },
    { name: 'Adam Zieliński', team: 'Jagiellonia', goals: 15, matches: 27, assists: 9 },
    { name: 'Jakub Wójcik', team: 'Wisła Kraków', goals: 13, matches: 26, assists: 4 },
  ];

  const topAssists = [
    { name: 'Piotr Kowalski', team: 'Lech Poznań', assists: 12, matches: 30, goals: 19 },
    { name: 'Adam Zieliński', team: 'Jagiellonia', assists: 9, matches: 27, goals: 15 },
    { name: 'Robert Lewandowski', team: 'Legia Warszawa', assists: 8, matches: 28, goals: 24 },
    { name: 'Michał Nowak', team: 'Cracovia', assists: 6, matches: 29, goals: 17 },
    { name: 'Tomasz Lewandowski', team: 'Pogoń Szczecin', assists: 5, matches: 25, goals: 8 },
  ];

  // Matches data grouped by rounds
  const matchesByRound = {
    '1': [
      {
        id: '1',
        homeTeam: 'Legia Warszawa',
        awayTeam: 'Lech Poznań',
        homeScore: 2,
        awayScore: 1,
        date: '15.03.2024',
        time: '18:00',
        stadium: 'Stadion Wojska Polskiego',
        league: 'Ekstraklasa',
        status: 'finished' as const,
        round: 1
      },
      {
        id: '2',
        homeTeam: 'Cracovia',
        awayTeam: 'Jagiellonia',
        homeScore: 1,
        awayScore: 1,
        date: '15.03.2024',
        time: '20:30',
        stadium: 'Stadion Cracovii',
        league: 'Ekstraklasa',
        status: 'finished' as const,
        round: 1
      }
    ],
    '2': [
      {
        id: '3',
        homeTeam: 'Wisła Kraków',
        awayTeam: 'Górnik Zabrze',
        homeScore: 3,
        awayScore: 0,
        date: '22.03.2024',
        time: '17:00',
        stadium: 'Stadion Wisły',
        league: 'Ekstraklasa',
        status: 'finished' as const,
        round: 2
      }
    ],
    'current': [
      {
        id: '4',
        homeTeam: 'Pogoń Szczecin',
        awayTeam: 'Raków Częstochowa',
        homeScore: 1,
        awayScore: 0,
        date: '29.03.2024',
        time: '19:30',
        stadium: 'Stadion Pogoni',
        league: 'Ekstraklasa',
        status: 'live' as const,
        minute: 67,
        round: 3
      }
    ],
    'upcoming': [
      {
        id: '5',
        homeTeam: 'Lech Poznań',
        awayTeam: 'Wisła Kraków',
        date: '05.04.2024',
        time: '18:00',
        stadium: 'Stadion Lecha',
        league: 'Ekstraklasa',
        status: 'scheduled' as const,
        round: 4
      }
    ]
  };

  const tabs = [
    { id: 'mecze', label: 'Mecze', icon: Calendar },
    { id: 'tabela', label: 'Tabela', icon: BarChart3 },
    { id: 'statystyki', label: 'Statystyki', icon: Target },
    { id: 'skladyarchiwum', label: 'Archiwum', icon: Users },
    { id: 'playarena', label: 'PlayArena', icon: Trophy },
  ];

  React.useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handleAddMatch = async () => {
    if (!isLoggedIn) {
      Alert.alert('Musisz być zalogowany, aby dodać mecz');
      return;
    }
    Alert.alert('Dodaj mecz', 'Funkcjonalność dodawania meczu');
  };

  const getMatchesForDisplay = () => {
    let allMatches: any[] = [];
    
    if (selectedRound === 'Wszystkie') {
      allMatches = [
        ...matchesByRound.current,
        ...matchesByRound.upcoming,
        ...matchesByRound['1'],
        ...matchesByRound['2']
      ];
    } else {
      allMatches = matchesByRound[selectedRound as keyof typeof matchesByRound] || [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allMatches = allMatches.filter(match => 
        match.homeTeam.toLowerCase().includes(query) ||
        match.awayTeam.toLowerCase().includes(query) ||
        match.stadium.toLowerCase().includes(query)
      );
    }

    return allMatches;
  };

  const LeagueSelector = () => (
    <TouchableOpacity 
      style={styles.leagueSelector}
      onPress={() => setShowLeagueModal(true)}
    >
      <View style={styles.leagueSelectorContent}>
        <Text style={styles.leagueSelectorText}>
          {selectedLeague}
          {selectedSubLeague && ` - ${selectedSubLeague}`}
        </Text>
        <ChevronDown size={16} color="#888888" />
      </View>
    </TouchableOpacity>
  );

  const RoundSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roundSelector}>
      {rounds.map((round) => (
        <TouchableOpacity
          key={round}
          style={[
            styles.roundChip,
            selectedRound === round && styles.activeRoundChip
          ]}
          onPress={() => setSelectedRound(round)}
        >
          <Text style={[
            styles.roundText,
            selectedRound === round && styles.activeRoundText
          ]}>
            {round === 'Wszystkie' ? 'Wszystkie' : `Kolejka ${round}`}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ROZGRYWKI</Text>
          <View style={styles.headerButtons}>
            {isLoggedIn && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddMatch}
              >
                <Plus size={20} color="#000000" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* League Selector */}
        <LeagueSelector />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#888888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj drużyn, meczów, stadionów..."
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <IconComponent 
                    size={18} 
                    color={activeTab === tab.id ? '#000000' : '#888888'} 
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.activeTabText
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'mecze' && (
          <>
            {/* Round Selector */}
            <RoundSelector />

            {/* Live Matches */}
            {matchesByRound.current.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MECZE NA ŻYWO</Text>
                {matchesByRound.current.map((match) => (
                  <MatchCard key={match.id} {...match} />
                ))}
              </View>
            )}

            {/* Upcoming Matches */}
            {matchesByRound.upcoming.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>NADCHODZĄCE MECZE</Text>
                {matchesByRound.upcoming.map((match) => (
                  <MatchCard key={match.id} {...match} />
                ))}
              </View>
            )}

            {/* All Matches or Filtered */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {selectedRound === 'Wszystkie' ? 'WSZYSTKIE MECZE' : `KOLEJKA ${selectedRound}`}
              </Text>
              {getMatchesForDisplay().map((match) => (
                <MatchCard key={match.id} {...match} />
              ))}
            </View>
          </>
        )}

        {activeTab === 'tabela' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TABELA LIGOWA - {selectedLeague.toUpperCase()}</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.4 }]}>#</Text>
              <Text style={[styles.tableHeaderText, { flex: 2.5 }]}>Drużyna</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.4 }]}>M</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.4 }]}>W</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.4 }]}>R</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.4 }]}>P</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>B+</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>B-</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>+/-</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>Pkt</Text>
            </View>

            {/* Table Rows */}
            {leagueTable.map((team) => (
              <TouchableOpacity key={team.position} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{team.position}</Text>
                <Text style={[styles.tableCell, styles.teamNameTable, { flex: 2.5 }]}>{team.team}</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{team.matches}</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{team.wins}</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{team.draws}</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{team.losses}</Text>
                <Text style={[styles.tableCell, { flex: 0.6 }]}>{team.goalsFor}</Text>
                <Text style={[styles.tableCell, { flex: 0.6 }]}>{team.goalsAgainst}</Text>
                <Text style={[styles.tableCell, { flex: 0.6, color: team.goalDiff >= 0 ? '#00FF88' : '#FF4444' }]}>
                  {team.goalDiff >= 0 ? '+' : ''}{team.goalDiff}
                </Text>
                <Text style={[styles.tableCell, styles.points, { flex: 0.6 }]}>{team.points}</Text>
              </TouchableOpacity>
            ))}

            {/* Legend */}
            <View style={styles.tableLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#00FF88' }]} />
                <Text style={styles.legendText}>Liga Mistrzów</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
                <Text style={styles.legendText}>Liga Europy</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF4444' }]} />
                <Text style={styles.legendText}>Spadek</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'statystyki' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STATYSTYKI - {selectedLeague.toUpperCase()}</Text>
            
            {/* Top Scorers */}
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>NAJLEPSI STRZELCY</Text>
              {topScorers.map((scorer, index) => (
                <TouchableOpacity key={index} style={styles.scorerCard}>
                  <View style={styles.scorerPosition}>
                    <Text style={styles.positionNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.scorerInfo}>
                    <Text style={styles.scorerName}>{scorer.name}</Text>
                    <Text style={styles.scorerTeam}>{scorer.team}</Text>
                    <Text style={styles.scorerMatches}>{scorer.matches} meczów</Text>
                  </View>
                  <View style={styles.scorerStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{scorer.goals}</Text>
                      <Text style={styles.statLabel}>goli</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{scorer.assists}</Text>
                      <Text style={styles.statLabel}>asyst</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Top Assists */}
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>NAJLEPSI ASYSTENCI</Text>
              {topAssists.map((player, index) => (
                <TouchableOpacity key={index} style={styles.scorerCard}>
                  <View style={styles.scorerPosition}>
                    <Text style={styles.positionNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.scorerInfo}>
                    <Text style={styles.scorerName}>{player.name}</Text>
                    <Text style={styles.scorerTeam}>{player.team}</Text>
                    <Text style={styles.scorerMatches}>{player.matches} meczów</Text>
                  </View>
                  <View style={styles.scorerStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{player.assists}</Text>
                      <Text style={styles.statLabel}>asyst</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{player.goals}</Text>
                      <Text style={styles.statLabel}>goli</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'skladyarchiwum' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARCHIWUM MECZÓW</Text>
            <View style={styles.emptyState}>
              <Users size={48} color="#666666" />
              <Text style={styles.emptyText}>Archiwum meczów</Text>
              <Text style={styles.emptySubtext}>
                Tutaj znajdziesz historię wszystkich meczów, składy drużyn i szczegółowe statystyki
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'playarena' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PLAY ARENA - WYZWANIA</Text>
            <View style={styles.emptyState}>
              <Trophy size={48} color="#666666" />
              <Text style={styles.emptyText}>Brak aktywnych gier</Text>
              <Text style={styles.emptySubtext}>Dodaj pierwszą grę i zacznij wyzwanie!</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* League Selection Modal */}
      <Modal visible={showLeagueModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz ligę</Text>
              <TouchableOpacity onPress={() => setShowLeagueModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.leagueList}>
              {Object.entries(leagues).map(([key, league]) => (
                <View key={key}>
                  <TouchableOpacity
                    style={[
                      styles.leagueItem,
                      selectedLeague === key && !selectedSubLeague && styles.selectedLeagueItem
                    ]}
                    onPress={() => {
                      setSelectedLeague(key);
                      setSelectedSubLeague('');
                      if (league.subLeagues.length === 0) {
                        setShowLeagueModal(false);
                      }
                    }}
                  >
                    <Text style={styles.leagueName}>{league.name}</Text>
                    <Text style={styles.leagueLevel}>Poziom {league.level}</Text>
                    {league.subLeagues.length > 0 && (
                      <ChevronRight size={16} color="#888888" />
                    )}
                  </TouchableOpacity>
                  
                  {selectedLeague === key && league.subLeagues.length > 0 && (
                    <View style={styles.subLeagueContainer}>
                      {league.subLeagues.map((subLeague) => (
                        <TouchableOpacity
                          key={subLeague}
                          style={[
                            styles.subLeagueItem,
                            selectedSubLeague === subLeague && styles.selectedSubLeagueItem
                          ]}
                          onPress={() => {
                            setSelectedSubLeague(subLeague);
                            setShowLeagueModal(false);
                          }}
                        >
                          <Text style={styles.subLeagueName}>{subLeague}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueSelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  leagueSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leagueSelectorText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
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
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#000000',
  },
  roundSelector: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  roundChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  activeRoundChip: {
    backgroundColor: '#00FF88',
  },
  roundText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  activeRoundText: {
    color: '#000000',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leagueText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  matchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamSection: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  score: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    minWidth: 30,
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    color: '#888888',
    marginHorizontal: 8,
  },
  vsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  // Table styles
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 4,
    borderRadius: 8,
  },
  tableCell: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  teamNameTable: {
    textAlign: 'left',
    fontFamily: 'Inter-SemiBold',
  },
  points: {
    fontFamily: 'Oswald-SemiBold',
    color: '#00FF88',
  },
  tableLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  // Stats styles
  statsSection: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  scorerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  scorerPosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  positionNumber: {
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
  },
  scorerInfo: {
    flex: 1,
  },
  scorerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scorerTeam: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  scorerMatches: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  scorerStats: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    color: '#00FF88',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#888888',
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
    paddingHorizontal: 20,
  },
  // Modal styles
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
  closeButton: {
    fontSize: 24,
    color: '#888888',
  },
  leagueList: {
    maxHeight: 400,
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  selectedLeagueItem: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  leagueName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  leagueLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  subLeagueContainer: {
    marginLeft: 16,
    marginBottom: 8,
  },
  subLeagueItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  selectedSubLeagueItem: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  subLeagueName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
});