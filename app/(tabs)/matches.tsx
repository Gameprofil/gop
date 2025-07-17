import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, Clock, ChevronDown, Filter } from 'lucide-react-native';
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
}

function MatchCard({ id, homeTeam, awayTeam, homeScore, awayScore, date, time, stadium, league, status, minute }: MatchCardProps) {
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

export default function MatchesScreen() {
  const [selectedLeague, setSelectedLeague] = useState('Wszystkie');
  const [selectedRegion, setSelectedRegion] = useState('Wszystkie');
  const [selectedDivision, setSelectedDivision] = useState('Wszystkie');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matches, setMatches] = useState([
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
      status: 'live' as const,
      minute: 78
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
      status: 'finished' as const
    },
    {
      id: '3',
      homeTeam: 'Wisła Kraków',
      awayTeam: 'Górnik Zabrze',
      date: '16.03.2024',
      time: '17:00',
      stadium: 'Stadion Wisły',
      league: 'Ekstraklasa',
      status: 'scheduled' as const
    },
    {
      id: '4',
      homeTeam: 'Pogoń Szczecin',
      awayTeam: 'Raków Częstochowa',
      date: '16.03.2024',
      time: '19:30',
      stadium: 'Stadion Pogoni',
      league: 'Ekstraklasa',
      status: 'scheduled' as const
    },
    {
      id: '5',
      homeTeam: 'Arka Gdynia',
      awayTeam: 'Miedź Legnica',
      homeScore: 3,
      awayScore: 0,
      date: '14.03.2024',
      time: '18:00',
      stadium: 'Stadion Arki',
      league: '1 Liga',
      status: 'finished' as const
    }
  ]);

  // Check if user is logged in
  React.useEffect(() => {
    checkLoginStatus();
    fetchMatches();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  // Fetch matches from backend (public access)
  const fetchMatches = async () => {
    try {
      const response = await fetch('https://game-p.onrender.com/api/matches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Keep using mock data if API fails
    }
  };

  // Add match result (only for logged in users with permissions)
  const handleAddMatch = async () => {
    if (!isLoggedIn) {
      alert('Musisz być zalogowany, aby dodać mecz');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://game-p.onrender.com/api/matches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeam: 'Nowa Drużyna A',
          awayTeam: 'Nowa Drużyna B',
          date: new Date().toISOString().split('T')[0],
          time: '18:00',
          stadium: 'Stadion Testowy',
          league: 'Ekstraklasa',
        }),
      });

      if (response.ok) {
        fetchMatches(); // Refresh matches
        alert('Mecz został dodany');
      } else {
        alert('Brak uprawnień do dodawania meczów');
      }
    } catch (error) {
      console.error('Error adding match:', error);
      alert('Wystąpił błąd podczas dodawania meczu');
    }
  };
  const leagues = ['Wszystkie', 'Ekstraklasa', '1 Liga', '2 Liga', 'Okręgówka', 'Juniorzy'];
  const regions = ['Wszystkie', 'Mazowieckie', 'Małopolskie', 'Śląskie', 'Wielkopolskie', 'Dolnośląskie'];
  const divisions = ['Wszystkie', 'Seniorzy', 'Juniorzy'];


  const FilterDropdown = ({ title, options, selected, onSelect }: {
    title: string;
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
  }) => (
    <View style={styles.filterDropdown}>
      <Text style={styles.filterLabel}>{title}</Text>
      <TouchableOpacity style={styles.dropdownButton}>
        <Text style={styles.dropdownText}>{selected}</Text>
        <ChevronDown size={16} color="#888888" />
      </TouchableOpacity>
    </View>
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
                <Text style={styles.addButtonText}>+</Text>
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

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <FilterDropdown
              title="Liga"
              options={leagues}
              selected={selectedLeague}
              onSelect={setSelectedLeague}
            />
            <FilterDropdown
              title="Województwo"
              options={regions}
              selected={selectedRegion}
              onSelect={setSelectedRegion}
            />
            <FilterDropdown
              title="Podział"
              options={divisions}
              selected={selectedDivision}
              onSelect={setSelectedDivision}
            />
          </View>
        )}

        {/* Live Matches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MECZE NA ŻYWO</Text>
          {matches
            .filter(match => match.status === 'live')
            .map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
        </View>

        {/* Today's Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DZISIAJ</Text>
          {matches
            .filter(match => match.date === '15.03.2024')
            .map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
        </View>

        {/* Tomorrow's Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JUTRO</Text>
          {matches
            .filter(match => match.date === '16.03.2024')
            .map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
        </View>

        {/* Recent Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OSTATNIE WYNIKI</Text>
          {matches
            .filter(match => match.status === 'finished')
            .map((match) => (
              <MatchCard key={match.id} {...match} />
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
  addButtonText: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#000000',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  filterDropdown: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
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
    marginBottom: 12,
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
});