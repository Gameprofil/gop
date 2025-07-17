import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, TextInput, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share, Send, MoveHorizontal as MoreHorizontal, Camera, Video, Mic, X, Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface FeedPostProps {
  id: string;
  author: {
    name: string;
    avatar: string;
    club: string;
    isVerified?: boolean;
  };
  content: {
    text?: string;
    image?: string;
    video?: string;
    isLive?: boolean;
    sharedPost?: any;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onRepost: () => void;
}

function FeedPost({ id, author, content, stats, timestamp, isLiked, onLike, onComment, onShare, onRepost }: FeedPostProps) {
  const router = useRouter();

  const handlePostPress = () => {
    router.push({
      pathname: '/post-detail',
      params: { postId: id }
    });
  };

  return (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.authorInfo}>
          <Image source={{ uri: author.avatar }} style={styles.authorAvatar} />
          <View style={styles.authorDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{author.name}</Text>
              {author.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.authorClub}>{author.club}</Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color="#888888" />
        </TouchableOpacity>
      </View>

      {/* Live Indicator */}
      {content.isLive && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>NA ŻYWO</Text>
        </View>
      )}

      {/* Shared Post */}
      {content.sharedPost && (
        <View style={styles.sharedPostContainer}>
          <Text style={styles.sharedText}>Udostępnił post od {content.sharedPost.author}</Text>
          <View style={styles.sharedPost}>
            <Text style={styles.sharedPostText}>{content.sharedPost.text}</Text>
            {content.sharedPost.image && (
              <Image source={{ uri: content.sharedPost.image }} style={styles.sharedPostImage} />
            )}
          </View>
        </View>
      )}

      {/* Post Content */}
      <TouchableOpacity onPress={handlePostPress} activeOpacity={0.95}>
        {content.text && (
          <Text style={styles.postText}>{content.text}</Text>
        )}
        {content.image && (
          <Image source={{ uri: content.image }} style={styles.postImage} />
        )}
        {content.video && (
          <View style={styles.videoContainer}>
            <Image source={{ uri: content.video }} style={styles.postImage} />
            <View style={styles.playButton}>
              <Video size={32} color="#FFFFFF" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Post Stats */}
      <View style={styles.postStats}>
        <Text style={styles.statsText}>
          {stats.likes > 0 && `${stats.likes} polubień`}
          {stats.likes > 0 && stats.comments > 0 && ' • '}
          {stats.comments > 0 && `${stats.comments} komentarzy`}
          {(stats.likes > 0 || stats.comments > 0) && stats.shares > 0 && ' • '}
          {stats.shares > 0 && `${stats.shares} udostępnień`}
        </Text>
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={[styles.actionButton, isLiked && styles.likedButton]} 
          onPress={onLike}
        >
          <Heart 
            size={20} 
            color={isLiked ? "#FF4444" : "#888888"} 
            fill={isLiked ? "#FF4444" : "transparent"}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            Polub
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <MessageCircle size={20} color="#888888" />
          <Text style={styles.actionText}>Komentuj</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onRepost}>
          <Share size={20} color="#888888" />
          <Text style={styles.actionText}>Udostępnij</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Send size={20} color="#888888" />
          <Text style={styles.actionText}>Wyślij</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState<any>(null);
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: {
        name: 'Robert Lewandowski',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        club: 'Bayern Munich',
        isVerified: true
      },
      content: {
        text: 'Świetny trening dzisiaj! Przygotowujemy się do kolejnego meczu. Dziękuję za wsparcie! ⚽️🔥',
        image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'
      },
      stats: { likes: 1247, comments: 89, shares: 23 },
      timestamp: '2 godz. temu',
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Piotr Zieliński',
        avatar: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        club: 'Napoli'
      },
      content: {
        text: 'Mecz z Juventusem był niesamowity! Dziękuję kibicom za doping. Teraz czas na regenerację 💪',
        video: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'
      },
      stats: { likes: 892, comments: 156, shares: 45 },
      timestamp: '5 godz. temu',
      isLiked: true
    },
    {
      id: '3',
      author: {
        name: 'Wojciech Szczęsny',
        avatar: 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        club: 'Juventus'
      },
      content: {
        text: 'Zero straconych bramek w tym tygodniu! Praca zespołowa to podstawa sukcesu 🥅',
        isLive: true
      },
      stats: { likes: 634, comments: 67, shares: 12 },
      timestamp: '1 dzień temu',
      isLiked: false
    },
    {
      id: '4',
      author: {
        name: 'Michał Nowak',
        avatar: 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        club: 'Cracovia'
      },
      content: {
        text: 'Świetny mecz wczoraj!',
        sharedPost: {
          author: 'Robert Lewandowski',
          text: 'Świetny trening dzisiaj! Przygotowujemy się do kolejnego meczu.',
          image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
        }
      },
      stats: { likes: 234, comments: 45, shares: 8 },
      timestamp: '3 godz. temu',
      isLiked: false
    }
  ]);

  const [newPost, setNewPost] = useState({
    text: '',
    image: null as string | null,
    video: null as string | null,
    isLive: false
  });

  React.useEffect(() => {
    checkLoginStatus();
    fetchPosts();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        const response = await fetch('https://game-p.onrender.com/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://game-p.onrender.com/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleLike = (postId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Logowanie wymagane', 'Musisz być zalogowany, aby polubić post');
      return;
    }

    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              stats: { 
                ...post.stats, 
                likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1 
              }
            }
          : post
      )
    );

    sendLikeToBackend(postId);
  };

  const sendLikeToBackend = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`https://game-p.onrender.com/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error sending like:', error);
    }
  };

  const handleComment = (postId: string) => {
    router.push({
      pathname: '/post-detail',
      params: { postId }
    });
  };

  const handleShare = (postId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Logowanie wymagane', 'Musisz być zalogowany, aby udostępnić post');
      return;
    }
    
    Alert.alert(
      'Udostępnij post',
      'Wybierz sposób udostępnienia',
      [
        { text: 'Wyślij wiadomość', onPress: () => handleSendMessage(postId) },
        { text: 'Udostępnij na profilu', onPress: () => handleRepost(postId) },
        { text: 'Anuluj', style: 'cancel' }
      ]
    );
  };

  const handleRepost = (postId: string) => {
    const postToShare = posts.find(p => p.id === postId);
    if (postToShare) {
      setSelectedPostToShare(postToShare);
      setShowShareModal(true);
    }
  };

  const handleSendMessage = (postId: string) => {
    router.push({
      pathname: '/messages',
      params: { sharePostId: postId }
    });
  };

  const confirmRepost = async (shareText: string) => {
    if (!selectedPostToShare) return;

    const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Użytkownik';
    const newRepost = {
      id: Date.now().toString(),
      author: {
        name: userName,
        avatar: currentUser?.avatar_url || 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        club: currentUser?.club || 'Brak klubu'
      },
      content: {
        text: shareText,
        sharedPost: {
          author: selectedPostToShare.author.name,
          text: selectedPostToShare.content.text,
          image: selectedPostToShare.content.image
        }
      },
      stats: { likes: 0, comments: 0, shares: 0 },
      timestamp: 'teraz',
      isLiked: false
    };

    setPosts([newRepost, ...posts]);
    
    // Update shares count
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === selectedPostToShare.id 
          ? { ...post, stats: { ...post.stats, shares: post.stats.shares + 1 } }
          : post
      )
    );

    setShowShareModal(false);
    setSelectedPostToShare(null);
    
    // Send to backend
    sendRepostToBackend(newRepost);
  };

  const sendRepostToBackend = async (repost: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch('https://game-p.onrender.com/api/posts/repost', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPostId: selectedPostToShare?.id,
          text: repost.content.text,
        }),
      });
    } catch (error) {
      console.error('Error sending repost:', error);
    }
  };

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      Alert.alert('Logowanie wymagane', 'Musisz być zalogowany, aby utworzyć post');
      return;
    }
    setShowCreatePost(true);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewPost(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewPost(prev => ({ ...prev, video: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const publishPost = async () => {
    if (!newPost.text.trim() && !newPost.image && !newPost.video) {
      Alert.alert('Błąd', 'Dodaj treść do posta');
      return;
    }

    const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Użytkownik';
    const post = {
      id: Date.now().toString(),
      author: {
        name: userName,
        avatar: currentUser?.avatar_url || 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        club: currentUser?.club || 'Brak klubu'
      },
      content: {
        text: newPost.text,
        image: newPost.image,
        video: newPost.video,
        isLive: newPost.isLive
      },
      stats: { likes: 0, comments: 0, shares: 0 },
      timestamp: 'teraz',
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost({ text: '', image: null, video: null, isLive: false });
    setShowCreatePost(false);

    // Send to backend
    sendPostToBackend(post);
  };

  const sendPostToBackend = async (post: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch('https://game-p.onrender.com/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: post.content.text,
          image: post.content.image,
          video: post.content.video,
          isLive: post.content.isLive,
        }),
      });
    } catch (error) {
      console.error('Error sending post:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SPOŁECZNOŚĆ</Text>
          <TouchableOpacity 
            style={styles.messagesButton}
            onPress={() => router.push('/messages')}
          >
            <MessageCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Create Post Button */}
        {isLoggedIn && (
          <TouchableOpacity style={styles.createPostButton} onPress={handleCreatePost}>
            <Image 
              source={{ uri: currentUser?.avatar_url || 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1' }} 
              style={styles.createPostAvatar} 
            />
            <Text style={styles.createPostText}>Co się dzieje w świecie piłki?</Text>
          </TouchableOpacity>
        )}

        {/* Feed Posts */}
        {posts.map((post) => (
          <FeedPost
            key={post.id}
            id={post.id}
            author={post.author}
            content={post.content}
            stats={post.stats}
            timestamp={post.timestamp}
            isLiked={post.isLiked}
            onLike={() => handleLike(post.id)}
            onComment={() => handleComment(post.id)}
            onShare={() => handleShare(post.id)}
            onRepost={() => handleRepost(post.id)}
          />
        ))}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.createPostModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Utwórz post</Text>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.createPostContent}>
              <Image 
                source={{ uri: currentUser?.avatar_url || 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1' }} 
                style={styles.modalAvatar} 
              />
              <TextInput
                style={styles.postTextInput}
                placeholder="Co się dzieje w świecie piłki?"
                placeholderTextColor="#666666"
                value={newPost.text}
                onChangeText={(text) => setNewPost(prev => ({ ...prev, text }))}
                multiline
                maxLength={500}
              />
            </View>

            {newPost.image && (
              <View style={styles.mediaPreview}>
                <Image source={{ uri: newPost.image }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeMedia}
                  onPress={() => setNewPost(prev => ({ ...prev, image: null }))}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {newPost.video && (
              <View style={styles.mediaPreview}>
                <Image source={{ uri: newPost.video }} style={styles.previewImage} />
                <View style={styles.videoOverlay}>
                  <Video size={24} color="#FFFFFF" />
                </View>
                <TouchableOpacity 
                  style={styles.removeMedia}
                  onPress={() => setNewPost(prev => ({ ...prev, video: null }))}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.postActions}>
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage}>
                  <Camera size={20} color="#888888" />
                  <Text style={styles.mediaButtonText}>Zdjęcie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={handlePickVideo}>
                  <Video size={20} color="#888888" />
                  <Text style={styles.mediaButtonText}>Film</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.mediaButton, newPost.isLive && styles.liveActive]}
                  onPress={() => setNewPost(prev => ({ ...prev, isLive: !prev.isLive }))}
                >
                  <Mic size={20} color={newPost.isLive ? "#FF4444" : "#888888"} />
                  <Text style={[styles.mediaButtonText, newPost.isLive && styles.liveText]}>
                    {newPost.isLive ? 'LIVE' : 'Na żywo'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.publishButton, (!newPost.text.trim() && !newPost.image && !newPost.video) && styles.publishButtonDisabled]}
                onPress={publishPost}
                disabled={!newPost.text.trim() && !newPost.image && !newPost.video}
              >
                <Text style={styles.publishButtonText}>Opublikuj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.shareModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Udostępnij post</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.shareTextInput}
              placeholder="Dodaj komentarz..."
              placeholderTextColor="#666666"
              multiline
              maxLength={200}
            />

            {selectedPostToShare && (
              <View style={styles.sharedPostPreview}>
                <Text style={styles.sharedAuthor}>{selectedPostToShare.author.name}</Text>
                <Text style={styles.sharedText}>{selectedPostToShare.content.text}</Text>
                {selectedPostToShare.content.image && (
                  <Image source={{ uri: selectedPostToShare.content.image }} style={styles.sharedImage} />
                )}
              </View>
            )}

            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => confirmRepost('')}
            >
              <Text style={styles.shareButtonText}>Udostępnij</Text>
            </TouchableOpacity>
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
  messagesButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  createPostText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    flex: 1,
  },
  postContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  verifiedBadge: {
    backgroundColor: '#00FF88',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  authorClub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 8,
  },
  liveText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
  },
  sharedPostContainer: {
    marginBottom: 12,
  },
  sharedText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginBottom: 8,
  },
  sharedPost: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#888888',
  },
  sharedPostText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sharedPostImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
  },
  postText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  videoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postStats: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  likedButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginLeft: 6,
  },
  likedText: {
    color: '#FF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxHeight: '80%',
  },
  shareModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxHeight: '70%',
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
  createPostContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postTextInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  shareTextInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  mediaPreview: {
    position: 'relative',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  removeMedia: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaButtons: {
    flexDirection: 'row',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  liveActive: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  mediaButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginLeft: 6,
  },
  liveText: {
    color: '#FF4444',
  },
  publishButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  publishButtonDisabled: {
    backgroundColor: '#333333',
  },
  publishButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  sharedPostPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#888888',
  },
  sharedAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sharedImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginTop: 8,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
});