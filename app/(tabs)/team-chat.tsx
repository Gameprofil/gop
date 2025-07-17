import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
  Modal,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send, 
  Image as ImageIcon, 
  Video, 
  Paperclip, 
  Mic, 
  X, 
  Users, 
  Plus, 
  Search,
  ChevronRight,
  Settings,
  Info
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  timestamp: string;
  attachments?: {
    type: 'image' | 'video' | 'file';
    url: string;
    thumbnail?: string;
    name?: string;
  }[];
  isRead: boolean;
}

interface ChatGroup {
  id: string;
  name: string;
  avatar: string;
  members: number;
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function TeamChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat groups
  useEffect(() => {
    // Mock data - in a real app, this would come from an API
    const mockChatGroups: ChatGroup[] = [
      {
        id: '1',
        name: 'Drużyna Główna',
        avatar: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        members: 22,
        lastMessage: {
          text: 'Trener: Pamiętajcie o jutrzejszym treningu o 17:00',
          timestamp: '14:30',
          senderId: 'coach-1'
        },
        unreadCount: 0
      },
      {
        id: '2',
        name: 'Sztab Szkoleniowy',
        avatar: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        members: 5,
        lastMessage: {
          text: 'Asystent: Przygotowałem analizę ostatniego meczu',
          timestamp: 'wczoraj',
          senderId: 'assistant-1'
        },
        unreadCount: 2
      },
      {
        id: '3',
        name: 'Napastnicy',
        avatar: 'https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        members: 4,
        lastMessage: {
          text: 'Trener: Dodatkowy trening strzałów jutro o 16:00',
          timestamp: '2 dni temu',
          senderId: 'coach-1'
        },
        unreadCount: 0
      }
    ];
    
    setChatGroups(mockChatGroups);
  }, []);

  // Load messages when a chat is selected
  useEffect(() => {
    if (activeChat) {
      // Mock data - in a real app, this would come from an API
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Dzień dobry drużyno! Przypominam o jutrzejszym treningu o 17:00. Proszę o potwierdzenie obecności.',
          sender: {
            id: 'coach-1',
            name: 'Trener Michał',
            avatar: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            role: 'Trener główny'
          },
          timestamp: '14:30',
          isRead: true
        },
        {
          id: '2',
          text: 'Będę obecny, trenerze!',
          sender: {
            id: 'player-1',
            name: 'Robert Lewandowski',
            avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            role: 'Napastnik'
          },
          timestamp: '14:35',
          isRead: true
        },
        {
          id: '3',
          text: 'Potwierdzam obecność',
          sender: {
            id: 'player-2',
            name: 'Piotr Zieliński',
            avatar: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            role: 'Pomocnik'
          },
          timestamp: '14:40',
          isRead: true
        },
        {
          id: '4',
          text: 'Dodaję również analizę ostatniego meczu. Proszę zapoznać się przed treningiem.',
          sender: {
            id: 'coach-1',
            name: 'Trener Michał',
            avatar: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            role: 'Trener główny'
          },
          timestamp: '14:45',
          attachments: [
            {
              type: 'file',
              url: 'https://example.com/analysis.pdf',
              name: 'Analiza_Meczu_Legia_Wisla.pdf'
            }
          ],
          isRead: true
        },
        {
          id: '5',
          text: 'Oto kilka zdjęć z ostatniego treningu',
          sender: {
            id: 'coach-2',
            name: 'Asystent Tomasz',
            avatar: 'https://images.pexels.com/photos/1222275/pexels-photo-1222275.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            role: 'Asystent trenera'
          },
          timestamp: '15:00',
          attachments: [
            {
              type: 'image',
              url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
            },
            {
              type: 'image',
              url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
            }
          ],
          isRead: false
        }
      ];
      
      setMessages(mockMessages);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [activeChat]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: {
        id: 'coach-1',
        name: 'Trener Michał',
        avatar: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        role: 'Trener główny'
      },
      timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Update last message in chat group
    setChatGroups(prev => 
      prev.map(group => 
        group.id === activeChat.id 
          ? {
              ...group,
              lastMessage: {
                text: `Trener: ${message}`,
                timestamp: 'teraz',
                senderId: 'coach-1'
              }
            }
          : group
      )
    );
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const isVideo = result.assets[0].type?.startsWith('video');
        
        const newMessage: Message = {
          id: Date.now().toString(),
          text: isVideo ? 'Wysłano film' : 'Wysłano zdjęcie',
          sender: {
            id: 'coach-1',
            name: 'Trener Michał',
            avatar: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            role: 'Trener główny'
          },
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          attachments: [
            {
              type: isVideo ? 'video' : 'image',
              url: result.assets[0].uri,
            }
          ],
          isRead: false
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Błąd', 'Nie udało się wybrać pliku');
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Błąd', 'Podaj nazwę grupy');
      return;
    }
    
    const newGroup: ChatGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      avatar: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      members: 0,
      lastMessage: {
        text: 'Grupa została utworzona',
        timestamp: 'teraz',
        senderId: 'coach-1'
      },
      unreadCount: 0
    };
    
    setChatGroups(prev => [newGroup, ...prev]);
    setNewGroupName('');
    setShowNewGroupModal(false);
    
    // Select the new group
    setActiveChat(newGroup);
  };

  const filteredChatGroups = chatGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render chat list view
  if (!activeChat) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CZAT DRUŻYNOWY</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowNewGroupModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#888888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj grup..."
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView style={styles.chatList}>
          {filteredChatGroups.map(group => (
            <TouchableOpacity
              key={group.id}
              style={styles.chatItem}
              onPress={() => setActiveChat(group)}
            >
              <Image source={{ uri: group.avatar }} style={styles.chatAvatar} />
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{group.name}</Text>
                  <Text style={styles.chatTime}>{group.lastMessage.timestamp}</Text>
                </View>
                <Text 
                  style={[
                    styles.chatLastMessage,
                    group.unreadCount > 0 && styles.unreadMessage
                  ]}
                  numberOfLines={1}
                >
                  {group.lastMessage.text}
                </Text>
                <View style={styles.chatFooter}>
                  <View style={styles.membersInfo}>
                    <Users size={14} color="#888888" />
                    <Text style={styles.membersCount}>{group.members} członków</Text>
                  </View>
                  {group.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{group.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* New Group Modal */}
        <Modal
          visible={showNewGroupModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNewGroupModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nowa grupa</Text>
                <TouchableOpacity onPress={() => setShowNewGroupModal(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalLabel}>Nazwa grupy</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Wpisz nazwę grupy..."
                placeholderTextColor="#666666"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateGroup}
              >
                <Text style={styles.createButtonText}>Utwórz grupę</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    );
  }

  // Render active chat view
  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveChat(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.chatHeaderInfo}
            onPress={() => setShowGroupInfoModal(true)}
          >
            <Image source={{ uri: activeChat.avatar }} style={styles.activeChatAvatar} />
            <View>
              <Text style={styles.activeChatName}>{activeChat.name}</Text>
              <View style={styles.membersInfo}>
                <Users size={14} color="#888888" />
                <Text style={styles.membersCount}>{activeChat.members} członków</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowGroupInfoModal(true)}
          >
            <Info size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.messageContainer,
                msg.sender.id === 'coach-1' ? styles.ownMessage : styles.otherMessage
              ]}
            >
              {msg.sender.id !== 'coach-1' && (
                <Image source={{ uri: msg.sender.avatar }} style={styles.messageAvatar} />
              )}
              
              <View style={styles.messageContent}>
                {msg.sender.id !== 'coach-1' && (
                  <Text style={styles.messageSender}>{msg.sender.name}</Text>
                )}
                
                <View 
                  style={[
                    styles.messageBubble,
                    msg.sender.id === 'coach-1' ? styles.ownBubble : styles.otherBubble
                  ]}
                >
                  <Text 
                    style={[
                      styles.messageText,
                      msg.sender.id === 'coach-1' ? styles.ownMessageText : styles.otherMessageText
                    ]}
                  >
                    {msg.text}
                  </Text>
                  
                  {msg.attachments && msg.attachments.map((attachment, index) => {
                    if (attachment.type === 'image') {
                      return (
                        <Image 
                          key={index}
                          source={{ uri: attachment.url }}
                          style={styles.attachmentImage}
                        />
                      );
                    } else if (attachment.type === 'video') {
                      return (
                        <View key={index} style={styles.videoContainer}>
                          <Image 
                            source={{ uri: attachment.url }}
                            style={styles.attachmentImage}
                          />
                          <View style={styles.playButton}>
                            <Video size={24} color="#FFFFFF" />
                          </View>
                        </View>
                      );
                    } else if (attachment.type === 'file') {
                      return (
                        <View key={index} style={styles.fileContainer}>
                          <Paperclip size={16} color={msg.sender.id === 'coach-1' ? "#000000" : "#FFFFFF"} />
                          <Text 
                            style={[
                              styles.fileName,
                              msg.sender.id === 'coach-1' ? styles.ownFileName : styles.otherFileName
                            ]}
                          >
                            {attachment.name}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
                
                <Text 
                  style={[
                    styles.messageTime,
                    msg.sender.id === 'coach-1' ? styles.ownMessageTime : styles.otherMessageTime
                  ]}
                >
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handleAttachment}
          >
            <Paperclip size={24} color="#888888" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Wiadomość..."
            placeholderTextColor="#666666"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send size={24} color={message.trim() ? "#FFFFFF" : "#666666"} />
          </TouchableOpacity>
        </View>

        {/* Group Info Modal */}
        <Modal
          visible={showGroupInfoModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGroupInfoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Informacje o grupie</Text>
                <TouchableOpacity onPress={() => setShowGroupInfoModal(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.groupInfo}>
                <Image source={{ uri: activeChat.avatar }} style={styles.groupAvatar} />
                <Text style={styles.groupName}>{activeChat.name}</Text>
                <Text style={styles.groupMembers}>{activeChat.members} członków</Text>
              </View>
              
              <TouchableOpacity style={styles.settingsButton}>
                <Settings size={20} color="#FFFFFF" />
                <Text style={styles.settingsText}>Ustawienia grupy</Text>
                <ChevronRight size={20} color="#888888" />
              </TouchableOpacity>
              
              <Text style={styles.membersTitle}>Członkowie</Text>
              
              <ScrollView style={styles.membersList}>
                <View style={styles.memberItem}>
                  <Image 
                    source={{ uri: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Trener Michał</Text>
                    <Text style={styles.memberRole}>Trener główny</Text>
                  </View>
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminText}>Admin</Text>
                  </View>
                </View>
                
                <View style={styles.memberItem}>
                  <Image 
                    source={{ uri: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Robert Lewandowski</Text>
                    <Text style={styles.memberRole}>Napastnik</Text>
                  </View>
                </View>
                
                <View style={styles.memberItem}>
                  <Image 
                    source={{ uri: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Piotr Zieliński</Text>
                    <Text style={styles.memberRole}>Pomocnik</Text>
                  </View>
                </View>
              </ScrollView>
              
              <TouchableOpacity style={styles.leaveButton}>
                <Text style={styles.leaveButtonText}>Opuść grupę</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  chatList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  chatLastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 4,
  },
  unreadMessage: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 4,
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
  // Chat View Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeChatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  activeChatName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageContent: {
    maxWidth: '100%',
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: '#00FF88',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
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
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#666666',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#888888',
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  videoContainer: {
    position: 'relative',
    marginTop: 8,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  fileName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  ownFileName: {
    color: '#000000',
  },
  otherFileName: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  modalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  // Group Info Modal
  groupInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  groupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  settingsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  membersTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  membersList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  adminBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adminText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#00FF88',
  },
  leaveButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
  },
});