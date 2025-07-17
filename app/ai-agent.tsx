import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot, User, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAgentScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Witaj! Jestem Agent AI - Twój pomocnik w aplikacji. Mogę pomóc Ci z następującymi komendami:\n\n• "Pokaż profile"\n• "Wyszukaj gracza [imię]"\n• "Dodaj grę [opis]"\n• "Pokaż ligi"\n• "Edytuj dane"\n\nCzego potrzebujesz?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [interactions, setInteractions] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCommand = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    let response = '';
    let apiEndpoint = '';
    let data = {};

    try {
      const token = await AsyncStorage.getItem('token');
      
      if (message.toLowerCase().includes('pokaż profile')) {
        apiEndpoint = 'http://localhost:3001/api/player-profile';
        const result = await fetch(apiEndpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (result.ok) {
          const profileData = await result.json();
          response = `Profil użytkownika:\n• Imię: ${profileData.user.name}\n• Pozycja: ${profileData.stats.position || 'Nie określono'}\n• Mecze: ${profileData.stats.matches}\n• Gole: ${profileData.stats.goals}`;
        } else {
          response = 'Nie udało się pobrać profilu.';
        }
        
      } else if (message.toLowerCase().includes('wyszukaj gracza')) {
        const playerName = message.split('wyszukaj gracza ')[1] || '';
        apiEndpoint = 'http://localhost:3001/api/market';
        
        const result = await fetch(`${apiEndpoint}?name=${encodeURIComponent(playerName)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (result.ok) {
          const searchData = await result.json();
          if (searchData.players && searchData.players.length > 0) {
            response = `Znalezieni gracze:\n${searchData.players.map((p: any) => `• ${p.name} - ${p.position} (${p.club})`).join('\n')}`;
          } else {
            response = `Nie znaleziono gracza o imieniu "${playerName}".`;
          }
        } else {
          response = 'Błąd podczas wyszukiwania gracza.';
        }
        
      } else if (message.toLowerCase().includes('dodaj grę')) {
        const gameDescription = message.split('dodaj grę ')[1] || 'Nowa gra';
        apiEndpoint = 'http://localhost:3001/api/add-game';
        
        const result = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: gameDescription }),
        });
        
        if (result.ok) {
          response = `Gra "${gameDescription}" została dodana do PlayArena!`;
        } else {
          response = 'Nie udało się dodać gry.';
        }
        
      } else if (message.toLowerCase().includes('pokaż ligi')) {
        apiEndpoint = 'http://localhost:3001/api/leagues';
        
        const result = await fetch(apiEndpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (result.ok) {
          const leaguesData = await result.json();
          response = `Dostępne ligi:\n${leaguesData.leagues?.map((l: any) => `• ${l.name} - ${l.level}`).join('\n') || 'Brak dostępnych lig'}`;
        } else {
          response = 'Nie udało się pobrać listy lig.';
        }
        
      } else if (message.toLowerCase().includes('edytuj dane')) {
        response = 'Przekierowuję Cię do edycji profilu...';
        setTimeout(() => {
          router.push('/edit-profile');
        }, 1500);
        
      } else {
        response = 'Nie rozumiem tej komendy. Spróbuj:\n\n• "Pokaż profile"\n• "Wyszukaj gracza [imię]"\n• "Dodaj grę [opis]"\n• "Pokaż ligi"\n• "Edytuj dane"';
      }

      const newInteractions = interactions + 1;
      setInteractions(newInteractions);

      // Special message after 10 interactions
      if (newInteractions >= 10) {
        response += '\n\n🎉 Gratulacje! Odbierz 25% zniżki na BoltAI z kodem: INDIE2025!';
      }

    } catch (error) {
      console.error('AI Agent error:', error);
      response = 'Wystąpił błąd podczas przetwarzania komendy. Spróbuj ponownie.';
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setMessage('');
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AGENT AI</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Messages */}
        <ScrollView 
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.isUser ? styles.userMessage : styles.aiMessage
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageIcon}>
                  {msg.isUser ? (
                    <User size={16} color="#FFFFFF" />
                  ) : (
                    <Bot size={16} color="#000000" />
                  )}
                </View>
                <Text style={styles.messageSender}>
                  {msg.isUser ? 'Ty' : 'Agent AI'}
                </Text>
              </View>
              <Text style={[
                styles.messageText,
                msg.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {msg.text}
              </Text>
            </View>
          ))}
          
          {loading && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <View style={styles.messageIcon}>
                  <Bot size={16} color="#000000" />
                </View>
                <Text style={styles.messageSender}>Agent AI</Text>
              </View>
              <Text style={styles.aiMessageText}>Przetwarzam...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Wpisz komendę (np. 'Pokaż profile')"
            placeholderTextColor="#666666"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleCommand}
            disabled={!message.trim() || loading}
          >
            <Send size={20} color={message.trim() ? "#000000" : "#666666"} />
          </TouchableOpacity>
        </View>

        {/* Interaction Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            Interakcje: {interactions}/10
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  counterContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  counterText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});