import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Wallpaper as SoccerBall, Clock, Users, Video, ChevronRight, Trophy, Clipboard, MessageCircle, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('treningi');

  const tabs = [
    { id: 'treningi', label: 'Treningi', icon: SoccerBall },
    { id: 'mecze', label: 'Mecze', icon: Trophy },
    { id: 'plan', label: 'Plan tygodnia', icon: Clipboard },
    { id: 'kalendarz', label: 'Kalendarz', icon: Calendar },
  ];

  const upcomingTrainings = [
    {
      id: '1',
      date: '15.06.2024',
      time: '17:00',
      title: 'Trening taktyczny',
      location: 'Boisko główne',
      playersConfirmed: 18,
      totalPlayers: 22,
      status: 'upcoming'
    },
    {
      id: '2',
      date: '17.06.2024',
      time: '16:30',
      title: 'Trening siłowy',
      location: 'Siłownia klubowa',
      playersConfirmed: 20,
      totalPlayers: 22,
      status: 'upcoming'
    }
  ];

  const pastTrainings = [
    {
      id: '3',
      date: '12.06.2024',
      time: '17:00',
      title: 'Trening techniczny',
      location: 'Boisko treningowe',
      playersPresent: 19,
      totalPlayers: 22,
      status: 'completed'
    }
  ];

  const upcomingMatches = [
    {
      id: '1',
      date: '18.06.2024',
      time: '18:00',
      homeTeam: 'Legia Warszawa',
      awayTeam: 'Lech Poznań',
      location: 'Stadion Wojska Polskiego',
      type: 'Liga',
      status: 'upcoming'
    }
  ];

  const pastMatches = [
    {
      id: '2',
      date: '11.06.2024',
      time: '20:00',
      homeTeam: 'Legia Warszawa',
      awayTeam: 'Wisła Kraków',
      result: '2-1',
      location: 'Stadion Wojska Polskiego',
      type: 'Liga',
      status: 'completed',
      hasAnalysis: true
    }
  ];

  const weeklyPlan = [
    { day: 'Poniedziałek', activities: ['Trening taktyczny (17:00)', 'Analiza wideo (19:00)'] },
    { day: 'Wtorek', activities: ['Trening siłowy (16:30)'] },
    { day: 'Środa', activities: ['Dzień wolny'] },
    { day: 'Czwartek', activities: ['Trening techniczny (17:00)'] },
    { day: 'Piątek', activities: ['Trening przedmeczowy (16:00)'] },
    { day: 'Sobota', activities: ['Mecz: Legia - Lech (18:00)'] },
    { day: 'Niedziela', activities: ['Regeneracja (11:00)'] }
  ];

  const recentNotifications = [
    {
      id: '1',
      title: 'Nowa analiza meczu',
      message: 'Analiza meczu Legia - Wisła jest już dostępna',
      time: '2 godz. temu'
    },
    {
      id: '2',
      title: 'Zmiana w treningu',
      message: 'Trening w czwartek przesunięty na 18:00',
      time: '5 godz. temu'
    }
  ];

  const renderTrainingsTab = () => (
    <>
      <Text style={styles.sectionTitle}>NADCHODZĄCE TRENINGI</Text>
      {upcomingTrainings.map(training => (
        <TouchableOpacity 
          key={training.id} 
          style={styles.card}
          onPress={() => router.push(`/training-detail?id=${training.id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <SoccerBall size={20} color="#00FF88" />
              <Text style={styles.cardTitle}>{training.title}</Text>
            </View>
            <ChevronRight size={20} color="#888888" />
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
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>OSTATNIE TRENINGI</Text>
      {pastTrainings.map(training => (
        <TouchableOpacity 
          key={training.id} 
          style={styles.card}
          onPress={() => router.push(`/training-detail?id=${training.id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <SoccerBall size={20} color="#888888" />
              <Text style={styles.cardTitle}>{training.title}</Text>
            </View>
            <ChevronRight size={20} color="#888888" />
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
                {training.playersPresent}/{training.totalPlayers} obecnych
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderMatchesTab = () => (
    <>
      <Text style={styles.sectionTitle}>NADCHODZĄCE MECZE</Text>
      {upcomingMatches.map(match => (
        <TouchableOpacity 
          key={match.id} 
          style={styles.card}
          onPress={() => router.push(`/match-detail?id=${match.id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Trophy size={20} color="#FFD700" />
              <Text style={styles.cardTitle}>{match.type}</Text>
            </View>
            <ChevronRight size={20} color="#888888" />
          </View>
          
          <View style={styles.matchTeams}>
            <Text style={styles.teamName}>{match.homeTeam}</Text>
            <Text style={styles.vsText}>vs</Text>
            <Text style={styles.teamName}>{match.awayTeam}</Text>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#888888" />
              <Text style={styles.detailText}>{match.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={16} color="#888888" />
              <Text style={styles.detailText}>{match.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>OSTATNIE MECZE</Text>
      {pastMatches.map(match => (
        <TouchableOpacity 
          key={match.id} 
          style={styles.card}
          onPress={() => router.push(`/match-detail?id=${match.id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Trophy size={20} color="#888888" />
              <Text style={styles.cardTitle}>{match.type}</Text>
            </View>
            {match.hasAnalysis && (
              <View style={styles.analysisTag}>
                <Video size={14} color="#FFFFFF" />
                <Text style={styles.analysisText}>Analiza</Text>
              </View>
            )}
          </View>
          
          <View style={styles.matchTeams}>
            <Text style={styles.teamName}>{match.homeTeam}</Text>
            <Text style={styles.resultText}>{match.result}</Text>
            <Text style={styles.teamName}>{match.awayTeam}</Text>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#888888" />
              <Text style={styles.detailText}>{match.date}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderWeeklyPlanTab = () => (
    <>
      <Text style={styles.sectionTitle}>PLAN TYGODNIA</Text>
      {weeklyPlan.map((day, index) => (
        <View key={index} style={styles.dayCard}>
          <Text style={styles.dayTitle}>{day.day}</Text>
          {day.activities.map((activity, actIndex) => (
            <View key={actIndex} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );

  const renderCalendarTab = () => (
    <View style={styles.calendarPlaceholder}>
      <Calendar size={48} color="#666666" />
      <Text style={styles.placeholderText}>Kalendarz</Text>
      <Text style={styles.placeholderSubtext}>
        Tutaj będzie dostępny pełny kalendarz z mikro- i mezocyklem
      </Text>
      <TouchableOpacity 
        style={styles.placeholderButton}
        onPress={() => router.push('/calendar')}
      >
        <Text style={styles.placeholderButtonText}>Przejdź do kalendarza</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'treningi':
        return renderTrainingsTab();
      case 'mecze':
        return renderMatchesTab();
      case 'plan':
        return renderWeeklyPlanTab();
      case 'kalendarz':
        return renderCalendarTab();
      default:
        return renderTrainingsTab();
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PANEL TRENERA</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>22</Text>
            <Text style={styles.statLabel}>Zawodników</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Treningi w tym tygodniu</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Nadchodzący mecz</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => {
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
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        {/* Recent Notifications */}
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>OSTATNIE POWIADOMIENIA</Text>
          {recentNotifications.map(notification => (
            <TouchableOpacity 
              key={notification.id} 
              style={styles.notificationCard}
              onPress={() => router.push('/notifications')}
            >
              <View style={styles.notificationIcon}>
                <Bell size={20} color="#FFFFFF" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              <ChevronRight size={20} color="#888888" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/create-training')}
          >
            <SoccerBall size={24} color="#000000" />
            <Text style={styles.actionButtonText}>Nowy trening</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/team-chat')}
          >
            <MessageCircle size={24} color="#000000" />
            <Text style={styles.actionButtonText}>Wiadomość do drużyny</Text>
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
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
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
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#000000',
  },
  tabContent: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  card: {
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
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  vsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginHorizontal: 8,
  },
  resultText: {
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  analysisTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  analysisText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  dayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    marginRight: 8,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DDDDDD',
  },
  calendarPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  placeholderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  placeholderButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  notificationsSection: {
    marginBottom: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginLeft: 8,
  },
});