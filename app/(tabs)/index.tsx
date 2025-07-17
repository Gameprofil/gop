import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Users, TrendingUp, Calendar, Star, MessageCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const elevenOfTheWeek = [
    // Goalkeeper
    { position: 'GK', name: 'Wojciech Szczęsny', club: 'Juventus', rating: 8.5 },
    
    // Defense (4 players)
    { position: 'RB', name: 'Łukasz Piszczek', club: 'Borussia Dortmund', rating: 8.2 },
    { position: 'CB', name: 'Jan Bednarek', club: 'Southampton', rating: 8.0 },
    { position: 'CB', name: 'Kamil Glik', club: 'Benevento', rating: 7.8 },
    { position: 'LB', name: 'Arkadiusz Reca', club: 'Atalanta', rating: 7.9 },
    
    // Midfield (4 players)
    { position: 'CM', name: 'Piotr Zieliński', club: 'Napoli', rating: 8.7 },
    { position: 'CM', name: 'Grzegorz Krychowiak', club: 'Krasnodar', rating: 8.1 },
    { position: 'LM', name: 'Jakub Błaszczykowski', club: 'Wisła Kraków', rating: 8.3 },
    { position: 'RM', name: 'Kamil Jóźwiak', club: 'Derby County', rating: 8.0 },
    
    // Attack (2 players)
    { position: 'ST', name: 'Robert Lewandowski', club: 'Bayern Munich', rating: 9.2 },
    { position: 'ST', name: 'Arkadiusz Milik', club: 'Olympique Marseille', rating: 8.4 },
  ];

  const challenges = [
    { title: 'Skill Challenge', description: 'Wykonaj 50 żonglerów', points: 100, icon: Star },
    { title: 'Team Spirit', description: 'Zagraj w drużynie', points: 150, icon: Users },
    { title: 'Goal Scorer', description: 'Strzel 3 gole w tygodniu', points: 200, icon: Trophy },
  ];

  const topPlayers = [
    { name: 'Robert Lewandowski', points: 2847, position: 1, club: 'Bayern Munich' },
    { name: 'Piotr Zieliński', points: 2541, position: 2, club: 'Napoli' },
    { name: 'Wojciech Szczęsny', points: 2398, position: 3, club: 'Juventus' },
    { name: 'Jan Bednarek', points: 2156, position: 4, club: 'Southampton' },
    { name: 'Grzegorz Krychowiak', points: 2089, position: 5, club: 'Krasnodar' },
  ];

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>GAME PROFIL</Text>
          <TouchableOpacity style={styles.messageButton}>
            <MessageCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 11 of the Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11 TYGODNIA</Text>
          <View style={styles.formation}>
            {/* Goalkeeper */}
            <View style={[styles.formationRow, { justifyContent: 'center' }]}>
              <TouchableOpacity style={styles.playerCard}>
                <Text style={styles.playerPosition}>{elevenOfTheWeek[0].position}</Text>
                <Text style={styles.playerName}>{elevenOfTheWeek[0].name.split(' ')[1]}</Text>
                <Text style={styles.playerRating}>{elevenOfTheWeek[0].rating}</Text>
              </TouchableOpacity>
            </View>

            {/* Defense */}
            <View style={styles.formationRow}>
              {elevenOfTheWeek.slice(1, 5).map((player, index) => (
                <TouchableOpacity key={index} style={styles.playerCard}>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                  <Text style={styles.playerName}>{player.name.split(' ')[1]}</Text>
                  <Text style={styles.playerRating}>{player.rating}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Midfield */}
            <View style={styles.formationRow}>
              {elevenOfTheWeek.slice(5, 9).map((player, index) => (
                <TouchableOpacity key={index} style={styles.playerCard}>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                  <Text style={styles.playerName}>{player.name.split(' ')[1]}</Text>
                  <Text style={styles.playerRating}>{player.rating}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Attack */}
            <View style={[styles.formationRow, { justifyContent: 'space-around' }]}>
              {elevenOfTheWeek.slice(9, 11).map((player, index) => (
                <TouchableOpacity key={index} style={styles.playerCard}>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                  <Text style={styles.playerName}>{player.name.split(' ')[1]}</Text>
                  <Text style={styles.playerRating}>{player.rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WYZWANIA TYGODNIA</Text>
          {challenges.map((challenge, index) => {
            const IconComponent = challenge.icon;
            return (
              <TouchableOpacity key={index} style={styles.challengeCard}>
                <View style={styles.challengeIcon}>
                  <IconComponent size={24} color="#FFFFFF" />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <View style={styles.challengePoints}>
                  <Text style={styles.pointsText}>{challenge.points}</Text>
                  <Text style={styles.pointsLabel}>pkt</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Top 20 Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOP 20 GRACZY</Text>
          {topPlayers.map((player, index) => (
            <TouchableOpacity key={index} style={styles.leaderCard}>
              <View style={styles.leaderPosition}>
                <Text style={styles.positionNumber}>{player.position}</Text>
              </View>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{player.name}</Text>
                <Text style={styles.leaderClub}>{player.club}</Text>
              </View>
              <View style={styles.leaderPoints}>
                <Text style={styles.leaderPointsText}>{player.points}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Community Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SPOŁECZNOŚĆ</Text>
          <TouchableOpacity style={styles.communityPreview}>
            <Text style={styles.communityText}>Zobacz najnowsze posty i videos</Text>
            <TrendingUp size={20} color="#888888" />
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
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  formation: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    minHeight: 300,
  },
  formationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playerPosition: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  playerRating: {
    fontSize: 12,
    fontFamily: 'Oswald-Bold',
    color: '#00FF88',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  challengePoints: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
  },
  pointsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  leaderPosition: {
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
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  leaderClub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  leaderPoints: {
    alignItems: 'center',
  },
  leaderPointsText: {
    fontSize: 16,
    fontFamily: 'Oswald-SemiBold',
    color: '#00FF88',
  },
  communityPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  communityText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
});