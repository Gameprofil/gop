import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Clock, MapPin, Users, Target, ChartBar as BarChart3, MessageCircle, Star, ArrowUpDown, ArrowUp, ArrowDown, Circle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled';
  minute?: number;
  date: string;
  time: string;
  stadium: string;
  league: string;
  referee?: string;
  attendance?: number;
}

interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  rating?: number;
}

interface Lineup {
  formation: string;
  players: Player[];
  substitutes: Player[];
}

interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty' | 'own_goal';
  team: 'home' | 'away';
  player: string;
  playerId?: string;
  assistPlayer?: string;
  assistPlayerId?: string;
  substitutedPlayer?: string;
  substitutedPlayerId?: string;
  description?: string;
}

export default function MatchDetailScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [homeLineup, setHomeLineup] = useState<Lineup | null>(null);
  const [awayLineup, setAwayLineup] = useState<Lineup | null>(null);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);

  const tabs = [
    { id: 'details', label: 'SZCZEGÓŁY', icon: Clock },
    { id: 'stats', label: 'STATYSTYKI', icon: BarChart3 },
    { id: 'lineups', label: 'SKŁADY', icon: Users },
    { id: 'comments', label: 'KOMENTARZ', icon: MessageCircle },
  ];

  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      // Mock data - replace with actual API calls
      setMatchData({
        id: matchId as string,
        homeTeam: 'Legia Warszawa',
        awayTeam: 'Lech Poznań',
        homeScore: 2,
        awayScore: 1,
        status: 'live',
        minute: 78,
        date: '15.03.2024',
        time: '18:00',
        stadium: 'Stadion Wojska Polskiego',
        league: 'Ekstraklasa',
        referee: 'Jan Kowalski',
        attendance: 28500
      });

      setMatchStats({
        possession: { home: 58, away: 42 },
        shots: { home: 12, away: 8 },
        shotsOnTarget: { home: 6, away: 3 },
        corners: { home: 7, away: 4 },
        fouls: { home: 11, away: 15 },
        yellowCards: { home: 2, away: 3 },
        redCards: { home: 0, away: 1 },
        offsides: { home: 3, away: 2 },
        passes: { home: 487, away: 352 },
        passAccuracy: { home: 85, away: 78 }
      });

      setHomeLineup({
        formation: '4-3-3',
        players: [
          { id: '1', name: 'Wojciech Szczęsny', number: 1, position: 'GK', rating: 7.5 },
          { id: '2', name: 'Bartosz Bereszyński', number: 2, position: 'RB', rating: 7.2 },
          { id: '3', name: 'Jan Bednarek', number: 3, position: 'CB', rating: 7.8 },
          { id: '4', name: 'Kamil Glik', number: 4, position: 'CB', rating: 7.6 },
          { id: '5', name: 'Arkadiusz Reca', number: 5, position: 'LB', rating: 7.0 },
          { id: '6', name: 'Grzegorz Krychowiak', number: 6, position: 'CDM', rating: 8.1 },
          { id: '7', name: 'Piotr Zieliński', number: 7, position: 'CM', rating: 8.5, goals: 1, assists: 1 },
          { id: '8', name: 'Sebastian Szymański', number: 8, position: 'CAM', rating: 7.9 },
          { id: '9', name: 'Robert Lewandowski', number: 9, position: 'ST', rating: 9.2, goals: 2 },
          { id: '10', name: 'Jakub Błaszczykowski', number: 10, position: 'RW', rating: 7.3 },
          { id: '11', name: 'Kamil Jóźwiak', number: 11, position: 'LW', rating: 7.1 }
        ],
        substitutes: [
          { id: '12', name: 'Łukasz Skorupski', number: 12, position: 'GK' },
          { id: '13', name: 'Michał Helik', number: 13, position: 'CB' },
          { id: '14', name: 'Jakub Kiwior', number: 14, position: 'CB' },
          { id: '15', name: 'Przemysław Frankowski', number: 15, position: 'RB' },
          { id: '16', name: 'Karol Linetty', number: 16, position: 'CM' }
        ]
      });

      setAwayLineup({
        formation: '4-2-3-1',
        players: [
          { id: '21', name: 'Filip Bednarek', number: 1, position: 'GK', rating: 6.8 },
          { id: '22', name: 'Joel Pereira', number: 2, position: 'RB', rating: 6.5 },
          { id: '23', name: 'Antonio Milic', number: 3, position: 'CB', rating: 6.9 },
          { id: '24', name: 'Bartosz Salamon', number: 4, position: 'CB', rating: 6.7 },
          { id: '25', name: 'Barry Douglas', number: 5, position: 'LB', rating: 6.4 },
          { id: '26', name: 'Jesper Karlström', number: 6, position: 'CDM', rating: 7.1 },
          { id: '27', name: 'Radosław Murawski', number: 8, position: 'CDM', rating: 6.8 },
          { id: '28', name: 'Michał Skóraś', number: 7, position: 'CAM', rating: 7.4, goals: 1 },
          { id: '29', name: 'Kristoffer Velde', number: 11, position: 'LW', rating: 7.0 },
          { id: '30', name: 'Filip Marchwiński', number: 10, position: 'RW', rating: 6.9 },
          { id: '31', name: 'Mikael Ishak', number: 9, position: 'ST', rating: 7.2, yellowCards: 1 }
        ],
        substitutes: [
          { id: '32', name: 'Bartosz Mrozek', number: 12, position: 'GK' },
          { id: '33', name: 'Maksymilian Pingot', number: 13, position: 'CB' },
          { id: '34', name: 'Nika Kvekveskiri', number: 14, position: 'CM' },
          { id: '35', name: 'Adriel Ba Loua', number: 15, position: 'LW' },
          { id: '36', name: 'Artur Sobiech', number: 16, position: 'ST' }
        ]
      });

      setMatchEvents([
        {
          id: '1',
          minute: 15,
          type: 'goal',
          team: 'home',
          player: 'Robert Lewandowski',
          playerId: '9',
          assistPlayer: 'Piotr Zieliński',
          assistPlayerId: '7',
          description: 'Strzał z pola karnego'
        },
        {
          id: '2',
          minute: 23,
          type: 'yellow_card',
          team: 'away',
          player: 'Mikael Ishak',
          playerId: '31',
          description: 'Faul taktyczny'
        },
        {
          id: '3',
          minute: 34,
          type: 'goal',
          team: 'away',
          player: 'Michał Skóraś',
          playerId: '28',
          description: 'Strzał z dystansu'
        },
        {
          id: '4',
          minute: 67,
          type: 'goal',
          team: 'home',
          player: 'Piotr Zieliński',
          playerId: '7',
          description: 'Rzut wolny'
        },
        {
          id: '5',
          minute: 72,
          type: 'substitution',
          team: 'away',
          player: 'Adriel Ba Loua',
          playerId: '35',
          substitutedPlayer: 'Filip Marchwiński',
          substitutedPlayerId: '30'
        }
      ]);

    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerPress = (playerId: string) => {
    router.push({
      pathname: '/player-detail',
      params: { playerId }
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'substitution': return '🔄';
      case 'penalty': return '⚽';
      case 'own_goal': return '⚽';
      default: return '•';
    }
  };

  const getFormationPositions = (formation: string) => {
    const formations: { [key: string]: number[][] } = {
      '4-3-3': [
        [1], // GK
        [2, 3, 4, 5], // Defense
        [6, 7, 8], // Midfield
        [9, 10, 11] // Attack
      ],
      '4-2-3-1': [
        [1], // GK
        [2, 3, 4, 5], // Defense
        [6, 8], // Defensive midfield
        [7, 10, 11], // Attacking midfield
        [9] // Attack
      ]
    };
    return formations[formation] || formations['4-3-3'];
  };

  const StatBar = ({ label, homeValue, awayValue, isPercentage = false }: {
    label: string;
    homeValue: number;
    awayValue: number;
    isPercentage?: boolean;
  }) => {
    const total = homeValue + awayValue;
    const homePercentage = total > 0 ? (homeValue / total) * 100 : 50;
    
    return (
      <View style={styles.statBar}>
        <Text style={styles.statValue}>
          {homeValue}{isPercentage ? '%' : ''}
        </Text>
        <View style={styles.statBarContainer}>
          <Text style={styles.statLabel}>{label}</Text>
          <View style={styles.statBarTrack}>
            <View 
              style={[
                styles.statBarFill, 
                { width: `${homePercentage}%` }
              ]} 
            />
          </View>
        </View>
        <Text style={styles.statValue}>
          {awayValue}{isPercentage ? '%' : ''}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Ładowanie meczu...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!matchData) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nie znaleziono meczu</Text>
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
          <Text style={styles.headerTitle}>{matchData.league}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Match Header */}
        <View style={styles.matchHeader}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchDate}>{matchData.date} • {matchData.time}</Text>
            <View style={styles.matchStatus}>
              {matchData.status === 'live' && (
                <>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>{matchData.minute}'</Text>
                </>
              )}
              {matchData.status === 'finished' && (
                <Text style={styles.finishedText}>Zakończony</Text>
              )}
              {matchData.status === 'scheduled' && (
                <Text style={styles.scheduledText}>Zaplanowany</Text>
              )}
            </View>
          </View>

          <View style={styles.matchScore}>
            <View style={styles.teamSection}>
              <Text style={styles.teamName}>{matchData.homeTeam}</Text>
              <Text style={styles.teamName}>{matchData.awayTeam}</Text>
            </View>
            
            <View style={styles.scoreSection}>
              <Text style={styles.score}>{matchData.homeScore}</Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.score}>{matchData.awayScore}</Text>
            </View>
          </View>

          <View style={styles.matchDetails}>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#888888" />
              <Text style={styles.detailText}>{matchData.stadium}</Text>
            </View>
            {matchData.referee && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sędzia:</Text>
                <Text style={styles.detailText}>{matchData.referee}</Text>
              </View>
            )}
            {matchData.attendance && (
              <View style={styles.detailRow}>
                <Users size={14} color="#888888" />
                <Text style={styles.detailText}>{matchData.attendance.toLocaleString()}</Text>
              </View>
            )}
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

        {/* Tab Content */}
        {activeTab === 'details' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>WYDARZENIA MECZU</Text>
            {matchEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventTime}>
                  <Text style={styles.eventMinute}>{event.minute}'</Text>
                </View>
                
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
                    <TouchableOpacity 
                      onPress={() => event.playerId && handlePlayerPress(event.playerId)}
                    >
                      <Text style={styles.eventPlayer}>{event.player}</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {event.assistPlayer && (
                    <TouchableOpacity 
                      onPress={() => event.assistPlayerId && handlePlayerPress(event.assistPlayerId)}
                    >
                      <Text style={styles.eventAssist}>Asysta: {event.assistPlayer}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {event.substitutedPlayer && (
                    <View style={styles.substitution}>
                      <ArrowUp size={12} color="#00FF88" />
                      <TouchableOpacity 
                        onPress={() => event.playerId && handlePlayerPress(event.playerId)}
                      >
                        <Text style={styles.subIn}>{event.player}</Text>
                      </TouchableOpacity>
                      <ArrowDown size={12} color="#FF4444" />
                      <TouchableOpacity 
                        onPress={() => event.substitutedPlayerId && handlePlayerPress(event.substitutedPlayerId)}
                      >
                        <Text style={styles.subOut}>{event.substitutedPlayer}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                </View>
                
                <View style={styles.eventTeam}>
                  <Text style={styles.eventTeamText}>
                    {event.team === 'home' ? matchData.homeTeam : matchData.awayTeam}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'stats' && matchStats && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>STATYSTYKI MECZU</Text>
            
            <View style={styles.statsContainer}>
              <StatBar 
                label="Posiadanie piłki" 
                homeValue={matchStats.possession.home} 
                awayValue={matchStats.possession.away}
                isPercentage
              />
              <StatBar 
                label="Strzały" 
                homeValue={matchStats.shots.home} 
                awayValue={matchStats.shots.away}
              />
              <StatBar 
                label="Strzały celne" 
                homeValue={matchStats.shotsOnTarget.home} 
                awayValue={matchStats.shotsOnTarget.away}
              />
              <StatBar 
                label="Rzuty rożne" 
                homeValue={matchStats.corners.home} 
                awayValue={matchStats.corners.away}
              />
              <StatBar 
                label="Faule" 
                homeValue={matchStats.fouls.home} 
                awayValue={matchStats.fouls.away}
              />
              <StatBar 
                label="Żółte kartki" 
                homeValue={matchStats.yellowCards.home} 
                awayValue={matchStats.yellowCards.away}
              />
              <StatBar 
                label="Czerwone kartki" 
                homeValue={matchStats.redCards.home} 
                awayValue={matchStats.redCards.away}
              />
              <StatBar 
                label="Spalone" 
                homeValue={matchStats.offsides.home} 
                awayValue={matchStats.offsides.away}
              />
              <StatBar 
                label="Podania" 
                homeValue={matchStats.passes.home} 
                awayValue={matchStats.passes.away}
              />
              <StatBar 
                label="Celność podań" 
                homeValue={matchStats.passAccuracy.home} 
                awayValue={matchStats.passAccuracy.away}
                isPercentage
              />
            </View>
          </View>
        )}

        {activeTab === 'lineups' && homeLineup && awayLineup && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>SKŁADY</Text>
            
            {/* Home Team */}
            <View style={styles.lineupSection}>
              <Text style={styles.teamLineupTitle}>
                {matchData.homeTeam} ({homeLineup.formation})
              </Text>
              
              <View style={styles.formationContainer}>
                {getFormationPositions(homeLineup.formation).map((line, lineIndex) => (
                  <View key={lineIndex} style={styles.formationLine}>
                    {line.map((playerIndex) => {
                      const player = homeLineup.players[playerIndex - 1];
                      return (
                        <TouchableOpacity
                          key={player.id}
                          style={styles.playerPosition}
                          onPress={() => handlePlayerPress(player.id)}
                        >
                          <View style={styles.playerCircle}>
                            <Text style={styles.playerNumber}>{player.number}</Text>
                          </View>
                          <Text style={styles.playerNameSmall}>{player.name.split(' ').pop()}</Text>
                          {player.rating && (
                            <Text style={styles.playerRating}>{player.rating}</Text>
                          )}
                          {player.goals && player.goals > 0 && (
                            <Text style={styles.playerGoals}>⚽ {player.goals}</Text>
                          )}
                          {player.yellowCards && player.yellowCards > 0 && (
                            <Text style={styles.playerCard}>🟨</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              <Text style={styles.substitutesTitle}>Ławka rezerwowych:</Text>
              <View style={styles.substitutesList}>
                {homeLineup.substitutes.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.substituteItem}
                    onPress={() => handlePlayerPress(player.id)}
                  >
                    <Text style={styles.substituteNumber}>{player.number}</Text>
                    <Text style={styles.substituteName}>{player.name}</Text>
                    <Text style={styles.substitutePosition}>{player.position}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Away Team */}
            <View style={styles.lineupSection}>
              <Text style={styles.teamLineupTitle}>
                {matchData.awayTeam} ({awayLineup.formation})
              </Text>
              
              <View style={styles.formationContainer}>
                {getFormationPositions(awayLineup.formation).map((line, lineIndex) => (
                  <View key={lineIndex} style={styles.formationLine}>
                    {line.map((playerIndex) => {
                      const player = awayLineup.players[playerIndex - 1];
                      return (
                        <TouchableOpacity
                          key={player.id}
                          style={styles.playerPosition}
                          onPress={() => handlePlayerPress(player.id)}
                        >
                          <View style={[styles.playerCircle, styles.awayPlayerCircle]}>
                            <Text style={styles.playerNumber}>{player.number}</Text>
                          </View>
                          <Text style={styles.playerNameSmall}>{player.name.split(' ').pop()}</Text>
                          {player.rating && (
                            <Text style={styles.playerRating}>{player.rating}</Text>
                          )}
                          {player.goals && player.goals > 0 && (
                            <Text style={styles.playerGoals}>⚽ {player.goals}</Text>
                          )}
                          {player.yellowCards && player.yellowCards > 0 && (
                            <Text style={styles.playerCard}>🟨</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              <Text style={styles.substitutesTitle}>Ławka rezerwowych:</Text>
              <View style={styles.substitutesList}>
                {awayLineup.substitutes.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.substituteItem}
                    onPress={() => handlePlayerPress(player.id)}
                  >
                    <Text style={styles.substituteNumber}>{player.number}</Text>
                    <Text style={styles.substituteName}>{player.name}</Text>
                    <Text style={styles.substitutePosition}>{player.position}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'comments' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>KOMENTARZ NA ŻYWO</Text>
            <View style={styles.emptyState}>
              <MessageCircle size={48} color="#666666" />
              <Text style={styles.emptyText}>Komentarz na żywo</Text>
              <Text style={styles.emptySubtext}>
                Tutaj będzie dostępny komentarz na żywo z meczu
              </Text>
            </View>
          </View>
        )}
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
  placeholder: {
    width: 44,
  },
  matchHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  matchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    marginRight: 8,
  },
  liveText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#00FF88',
  },
  finishedText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  scheduledText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  matchScore: {
    alignItems: 'center',
    marginBottom: 16,
  },
  teamSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 36,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    minWidth: 50,
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 28,
    fontFamily: 'Oswald-Bold',
    color: '#888888',
    marginHorizontal: 16,
  },
  matchDetails: {
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 4,
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
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  eventTime: {
    width: 40,
    alignItems: 'center',
  },
  eventMinute: {
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
  },
  eventContent: {
    flex: 1,
    marginHorizontal: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  eventPlayer: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  eventAssist: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginTop: 2,
  },
  substitution: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subIn: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#00FF88',
    marginHorizontal: 4,
  },
  subOut: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginHorizontal: 4,
  },
  eventDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  eventTeam: {
    width: 80,
    alignItems: 'flex-end',
  },
  eventTeamText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'right',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  statBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    width: 50,
    textAlign: 'center',
  },
  statBarContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  statBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#00FF88',
  },
  lineupSection: {
    marginBottom: 32,
  },
  teamLineupTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  formationContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formationLine: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  playerPosition: {
    alignItems: 'center',
    flex: 1,
  },
  playerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  awayPlayerCircle: {
    backgroundColor: '#FF4444',
  },
  playerNumber: {
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    color: '#000000',
  },
  playerNameSmall: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  playerRating: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFD700',
  },
  playerGoals: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#00FF88',
  },
  playerCard: {
    fontSize: 10,
  },
  substitutesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  substitutesList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  substituteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  substituteNumber: {
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    width: 30,
  },
  substituteName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  substitutePosition: {
    fontSize: 12,
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
  },
});