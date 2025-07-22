import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Search, Phone, Video, MoveHorizontal as MoreHorizontal, Plus, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    club: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isOwn: boolean;
    isRead: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface User {
  id: string;
  name: string;
  avatar: string;
  club: string;
  isOnline: boolean;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { conversationId, sharePostId } = useLocalSearchParams();
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadConversations();
    loadAvailableUsers();
    
    if (conversationId) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        openConversation(conversation);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    if (sharePostId) {
      setShowNewChatModal(true);
    }
  }, [sharePostId]);

  const loadConversations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://game-p.onrender.com/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        // Mock data for development
        setConversations([
          {
            id: '1',
            participant: {
              id: '1',
              name: 'Robert Lewandowski',
              avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              club: 'Bayern Munich',
              isOnline: true
            },
            lastMessage: {
              text: 'Świetny mecz wczoraj!',
              timestamp: '14:30',
              isOwn: false,
              isRead: false
            },
            unreadCount: 2
          },
          {
            id: '2',
            participant: {
              id: '2',
              name: 'Piotr Zieliński',
              avatar: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              club: 'Napoli',
              isOnline: false
            },
            lastMessage: {
              text: 'Ty: Dzięki za gratulacje!',
              timestamp: 'wczoraj',
              isOwn: true,
              isRead: true
            },
            unreadCount: 0
          },
          {
            id: '3',
            participant: {
              id: '3',
              name: 'Wojciech Szczęsny',
              avatar: 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              club: 'Juventus',
              isOnline: true
            },
            lastMessage: {
              text: 'Może spotkamy się na treningu?',
              timestamp: '2 dni temu',
              isOwn: false,
              isRead: true
            },
            unreadCount: 0
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://game-p.onrender.com/api/users/search', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
        setFilteredUsers(data);
      } else {
        // Mock data
        const mockUsers = [
          {
            id: '4',
            name: 'Michał Nowak',
            avatar: 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            club: 'Cracovia',
            isOnline: false
          },
          {
            id: '5',
            name: 'Jakub Wójcik',
            avatar: 'https://images.pexels.com/photos/1222275/pexels-photo-1222275.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            club: 'Wisła Kraków',
            isOnline: true
          }
        ];
        setAvailableUsers(mockUsers);
        setFilteredUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const openConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setCurrentView('chat');
    
    // Load messages for this conversation
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://game-p.onrender.com/api/messages/${conversation.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        // Mock messages
        setMessages([
          {
            id: '1',
            text: 'Cześć! Jak się masz?',
            timestamp: '14:25',
            isOwn: false,
            status: 'read'
          },
          {
            id: '2',
            text: 'Świetnie! A ty jak?',
            timestamp: '14:26',
            isOwn: true,
            status: 'read'
          },
          {
            id: '3',
            text: 'Świetny mecz wczoraj!',
            timestamp: '14:30',
            isOwn: false,
            status: 'delivered'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }

    // Mark conversation as read
    markAsRead(conversation.id);
  };

  const markAsRead = async (conversationId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`https://game-p.onrender.com/api/messages/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`https://game-p.onrender.com/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage,
          sharePostId: sharePostId || null
        }),
      });

      // Update message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startNewConversation = (user: User) => {
    const newConversation: Conversation = {
      id: `new-${user.id}`,
      participant: user,
      lastMessage: {
        text: '',
        timestamp: 'teraz',
        isOwn: true,
        isRead: true
      },
      unreadCount: 0
    };

    setSelectedConversation(newConversation);
    setCurrentView('chat');
    setMessages([]);
    setShowNewChatModal(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (currentView === 'list') {
      // Filter conversations
      const filtered = conversations.filter(conv =>
        conv.participant.name.toLowerCase().includes(query.toLowerCase()) ||
        conv.participant.club.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      // Filter users for new chat
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.club.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const getFilteredConversations = () => {
    if (!searchQuery) return conversations;
    return conversations.filter(conv =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.club.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (currentView === 'chat' && selectedConversation) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentView('list')}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.chatHeaderInfo}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: selectedConversation.participant.avatar }} 
                  style={styles.chatAvatar} 
                />
                {selectedConversation.participant.isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
              </View>
              <View style={styles.chatUserInfo}>
                <Text style={styles.chatUserName}>{selectedConversation.participant.name}</Text>
                <Text style={styles.chatUserStatus}>
                  {selectedConversation.participant.isOnline ? 'Online' : 'Ostatnio widziany'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.chatActions}>
              <TouchableOpacity style={styles.chatActionButton}>
                <Phone size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatActionButton}>
                <Video size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatActionButton}>
                <MoreHorizontal size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isOwn ? styles.ownMessage : styles.otherMessage
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.isOwn ? styles.ownBubble : styles.otherBubble
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    message.isOwn ? styles.ownMessageText : styles.otherMessageText
                  ]}>
                    {message.text}
                  </Text>
                </View>
                <Text style={styles.messageTime}>
                  {message.timestamp}
                  {message.isOwn && (
                    <Text style={styles.messageStatus}>
                      {message.status === 'sent' ? ' ✓' : 
                       message.status === 'delivered' ? ' ✓✓' : ' ✓✓'}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Napisz wiadomość..."
              placeholderTextColor="#666666"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} color={newMessage.trim() ? "#000000" : "#666666"} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WIADOMOŚCI</Text>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={() => setShowNewChatModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#888888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Szukaj rozmów..."
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {getFilteredConversations().map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={styles.conversationItem}
            onPress={() => openConversation(conversation)}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: conversation.participant.avatar }} 
                style={styles.conversationAvatar} 
              />
              {conversation.participant.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
            </View>

            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={[
                  styles.conversationName,
                  conversation.unreadCount > 0 && styles.unreadName
                ]}>
                  {conversation.participant.name}
                </Text>
                <Text style={styles.conversationTime}>
                  {conversation.lastMessage.timestamp}
                </Text>
              </View>
              
              <View style={styles.conversationFooter}>
                <Text style={[
                  styles.lastMessage,
                  conversation.unreadCount > 0 && styles.unreadMessage
                ]} numberOfLines={1}>
                  {conversation.lastMessage.text}
                </Text>
                {conversation.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>
                      {conversation.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.conversationClub}>
                {conversation.participant.club}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* New Chat Modal */}
      <Modal visible={showNewChatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nowa rozmowa</Text>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color="#888888" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Szukaj graczy..."
                  placeholderTextColor="#888888"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
            </View>

            <ScrollView style={styles.usersList}>
              {filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userItem}
                  onPress={() => startNewConversation(user)}
                >
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                    {user.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userClub}>{user.club}</Text>
                  </View>
                </TouchableOpacity>
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
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
  conversationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00FF88',
    borderWidth: 2,
    borderColor: '#000000',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  unreadName: {
    fontFamily: 'Inter-Bold',
  },
  conversationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  unreadBadge: {
    backgroundColor: '#00FF88',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  conversationClub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  // Chat Screen Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatUserInfo: {
    marginLeft: 12,
  },
  chatUserName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  chatUserStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  chatActions: {
    flexDirection: 'row',
  },
  chatActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  ownBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#000000',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'right',
  },
  messageStatus: {
    color: '#00FF88',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageInput: {
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
  // Modal Styles
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
    maxHeight: height * 0.8,
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
  modalSearchContainer: {
    marginBottom: 20,
  },
  usersList: {
    maxHeight: 400,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userClub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
});