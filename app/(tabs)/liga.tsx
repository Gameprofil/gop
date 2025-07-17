import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Calendar, Target, ChartBar as BarChart3, Clock } from 'lucide-react-native';

export default function LigaScreen() {
  const [activeTab, setActiveTab] = useState('table');

  const leagueTable = [
    { position: 1, team: 'Legia Warszawa', points: 67, matches: 30, wins: 21, draws: 4, losses: 5 },
    { position: 2, team: 'Lech Poznań', points: 63, matches: 30, wins: 19, draws: 6, losses: 5 },
    { position: 3, team: 'Cracovia', points: 58, matches: 30, wins: 17, draws: 7, losses: 6 },
    { position: 4, team: 'Jagiellonia', points: 54, matches: 30, wins: 16, draws: 6, losses: 8 },
    { position: 5, team: 'Wisła Kraków', points: 48, matches: 30, wins: 14, draws: 6, losses: 10 },
  ];

  const topScorers = [
    { name: 'Robert Lewandowski', team: 'Legia Warszawa', goals: 24, matches: 28 },
    { name: 'Piotr Kowalski', team: 'Lech Poznań', goals: 19, matches: 30 },
    { name: 'Michał Nowak', team: 'Cracovia', goals: 17, matches: 29 },
    { name: 'Adam Zieliński', team: 'Jagiellonia', goals: 15, matches: 27 },
    { name: 'Jakub Wójcik', team: 'Wisła Kraków', goals: 13, matches: 26 },
  ];

  const upcomingMatches = [
    {
      date: '15.03.2024',
      time: '18:00',
      homeTeam: 'Legia Warszawa',
      awayTeam: 'Lech Poznań',
      stadium: 'Stadion Wojska Polskiego',
    },
    {
      date: '16.03.2024',
      time: '20:30',
      homeTeam: 'Cracovia',
      awayTeam: 'Jagiellonia',
      stadium: 'Stadion Cracovii',
    },
    {
      date: '17.03.2024',
      time: '17:00',
      homeTeam: 'Wisła Kraków',
      awayTeam: 'Górnik Zabrze',
      stadium: 'Stadion Wisły',
    },
  ];

  const tabs = [
    { id: 'table', label: 'Tabela', icon: BarChart3 },
    { id: 'scorers', label: 'Strzelcy', icon: Target },
    { id: 'fixtures', label: 'Terminarz', icon: Calendar },
  ];

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LIGA POLSKA</Text>
          <View style={styles.headerSubtitle}>
            <Trophy size={16} color="#888888" />
            <Text style={styles.headerSubtitleText}>Ekstraklasa 2023/24</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
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
                  size={20} 
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
        </View>

        {/* League Table */}
        {activeTab === 'table' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TABELA LIGOWA</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Drużyna</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>M</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>W</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>R</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>P</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>Pkt</Text>
            </View>
            {leagueTable.map((team) => (
              <TouchableOpacity key={team.position} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{team.position}</Text>
                <Text style={[styles.tableCell, styles.teamName, { flex: 2 }]}>{team.team}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{team.matches}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{team.wins}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{team.draws}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{team.losses}</Text>
                <Text style={[styles.tableCell, styles.points, { flex: 0.7 }]}>{team.points}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Top Scorers */}
        {activeTab === 'scorers' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NAJLEPSI STRZELCY</Text>
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
                <View style={styles.scorerGoals}>
                  <Text style={styles.goalsNumber}>{scorer.goals}</Text>
                  <Text style={styles.goalsLabel}>goli</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Fixtures */}
        {activeTab === 'fixtures' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NADCHODZĄCE MECZE</Text>
            {upcomingMatches.map((match, index) => (
              <TouchableOpacity key={index} style={styles.matchCard}>
                <View style={styles.matchDate}>
                  <Calendar size={16} color="#888888" />
                  <Text style={styles.matchDateText}>{match.date}</Text>
                  <Clock size={16} color="#888888" />
                  <Text style={styles.matchTimeText}>{match.time}</Text>
                </View>
                <View style={styles.matchTeams}>
                  <Text style={styles.homeTeam}>{match.homeTeam}</Text>
                  <Text style={styles.vs}>vs</Text>
                  <Text style={styles.awayTeam}>{match.awayTeam}</Text>
                </View>
                <Text style={styles.stadium}>{match.stadium}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Live Matches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MECZE NA ŻYWO</Text>
          <TouchableOpacity style={styles.liveMatchCard}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.liveMatchInfo}>
              <Text style={styles.liveTeams}>Legia Warszawa 2-1 Lech Poznań</Text>
              <Text style={styles.liveTime}>78'</Text>
            </View>
            <View style={styles.liveStats}>
              <Text style={styles.liveStatsText}>xG: 1.8 - 1.2</Text>
              <Text style={styles.liveStatsText}>Strzały: 12 - 8</Text>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
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
    marginLeft: 8,
  },
  activeTabText: {
    color: '#000000',
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
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 4,
    borderRadius: 8,
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  teamName: {
    textAlign: 'left',
    fontFamily: 'Inter-SemiBold',
  },
  points: {
    fontFamily: 'Oswald-SemiBold',
    color: '#00FF88',
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
  scorerGoals: {
    alignItems: 'center',
  },
  goalsNumber: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#00FF88',
  },
  goalsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  matchDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchDateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 8,
    marginRight: 16,
  },
  matchTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  homeTeam: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  vs: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginHorizontal: 16,
  },
  awayTeam: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  stadium: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  liveMatchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    marginRight: 8,
  },
  liveText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#00FF88',
  },
  liveMatchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveTeams: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  liveTime: {
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
    color: '#00FF88',
  },
  liveStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveStatsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
});