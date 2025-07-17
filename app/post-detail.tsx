import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, MessageCircle, Share, Send, MoveHorizontal as MoreHorizontal, Video } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    club: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface PostDetail {
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
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
  isLiked: boolean;
}

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    fetchPostDetail();
    fetchComments();
  }, [postId]);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const fetchPostDetail = async () => {
    try {
      const response = await fetch(`https://game-p.onrender.com/api/posts/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        // Mock data for development
        setPost({
          id: postId as string,
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
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`https://game-p.onrender.com/api/posts/${postId}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        // Mock comments
        setComments([
          {
            id: '1',
            author: {
              name: 'Piotr Zieliński',
              avatar: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              club: 'Napoli'
            },
            text: 'Świetna forma! Powodzenia w kolejnym meczu! 💪',
            timestamp: '1 godz. temu',
            likes: 24,
            isLiked: false
          },
          {
            id: '2',
            author: {
              name: 'Wojciech Szczęsny',
              avatar: 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              club: 'Juventus'
            },
            text: 'Zawsze gotowy do walki! Respect 🔥',
            timestamp: '45 min. temu',
            likes: 18,
            isLiked: true
          },
          {
            id: '3',
            author: {
              name: 'Michał Nowak',
              avatar: 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
              club: 'Cracovia'
            },
            text: 'Inspiracja dla młodych piłkarzy! Dziękuję za motywację',
            timestamp: '30 min. temu',
            likes: 12,
            isLiked: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      Alert.alert('Logowanie wymagane', 'Musisz być zalogowany, aby polubić post');
      return;
    }

    if (!post) return;

    const newLikedState = !post.isLiked;
    const newLikesCount = newLikedState ? post.stats.likes + 1 : post.stats.likes - 1;

    setPost(prev => prev ? {
      ...prev,
      isLiked: newLikedState,
      stats: { ...prev.stats, likes: newLikesCount }
    } : null);

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
      console.error('Error liking post:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Logowanie wymagane', 'Musisz być zalogowany, aby polubić komentarz');
      return;
    }

    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 
            }
          : comment
      )
    );

    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`https://game-p.onrender.com/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      Alert.alert('Logowanie wymagane', 'Musisz być zalogowany, aby skomentować');
      return;
    }

    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Ty',
        avatar: 'https://images.pexels.com/photos/1222275/pexels-photo-1222275.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        club: 'Twój klub'
      },
      text: newComment,
      timestamp: 'teraz',
      likes: 0,
      isLiked: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');

    // Update post comments count
    if (post) {
      setPost(prev => prev ? {
        ...prev,
        stats: { ...prev.stats, comments: prev.stats.comments + 1 }
      } : null);
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`https://game-p.onrender.com/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newComment,
        }),
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = () => {
    if (!isLoggedIn) {
      Alert.alert('Logowanie wymagane', 'Musisz być zalogowany, aby udostępnić post');
      return;
    }

    Alert.alert(
      'Udostępnij post',
      'Wybierz sposób udostępnienia',
      [
        { text: 'Wyślij wiadomość', onPress: () => handleSendMessage() },
        { text: 'Udostępnij na profilu', onPress: () => handleRepost() },
        { text: 'Anuluj', style: 'cancel' }
      ]
    );
  };

  const handleSendMessage = () => {
    router.push({
      pathname: '/messages',
      params: { sharePostId: postId }
    });
  };

  const handleRepost = () => {
    // Handle repost functionality
    Alert.alert('Udostępniono', 'Post został udostępniony na Twoim profilu');
  };

  if (loading || !post) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Ładowanie posta...</Text>
        </View>
      </LinearGradient>
    );
  }

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
          <Text style={styles.headerTitle}>POST</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Post Content */}
          <View style={styles.postContainer}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.authorInfo}>
                <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
                <View style={styles.authorDetails}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{post.author.name}</Text>
                    {post.author.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.authorClub}>{post.author.club}</Text>
                  <Text style={styles.timestamp}>{post.timestamp}</Text>
                </View>
              </View>
            </View>

            {/* Live Indicator */}
            {post.content.isLive && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>NA ŻYWO</Text>
              </View>
            )}

            {/* Post Content */}
            {post.content.text && (
              <Text style={styles.postText}>{post.content.text}</Text>
            )}
            {post.content.image && (
              <Image source={{ uri: post.content.image }} style={styles.postImage} />
            )}
            {post.content.video && (
              <View style={styles.videoContainer}>
                <Image source={{ uri: post.content.video }} style={styles.postImage} />
                <View style={styles.playButton}>
                  <Video size={32} color="#FFFFFF" />
                </View>
              </View>
            )}

            {/* Post Stats */}
            <View style={styles.postStats}>
              <Text style={styles.statsText}>
                {post.stats.likes > 0 && `${post.stats.likes} polubień`}
                {post.stats.likes > 0 && post.stats.comments > 0 && ' • '}
                {post.stats.comments > 0 && `${post.stats.comments} komentarzy`}
                {(post.stats.likes > 0 || post.stats.comments > 0) && post.stats.shares > 0 && ' • '}
                {post.stats.shares > 0 && `${post.stats.shares} udostępnień`}
              </Text>
            </View>

            {/* Post Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity 
                style={[styles.actionButton, post.isLiked && styles.likedButton]} 
                onPress={handleLike}
              >
                <Heart 
                  size={20} 
                  color={post.isLiked ? "#FF4444" : "#888888"} 
                  fill={post.isLiked ? "#FF4444" : "transparent"}
                />
                <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                  Polub
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={20} color="#888888" />
                <Text style={styles.actionText}>Komentuj</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share size={20} color="#888888" />
                <Text style={styles.actionText}>Udostępnij</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Komentarze ({comments.length})</Text>
            
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentContainer}>
                <Image source={{ uri: comment.author.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                    <Text style={styles.commentClub}>{comment.author.club}</Text>
                    <Text style={styles.commentTime}>{comment.timestamp}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity 
                      style={styles.commentAction}
                      onPress={() => handleCommentLike(comment.id)}
                    >
                      <Heart 
                        size={16} 
                        color={comment.isLiked ? "#FF4444" : "#888888"} 
                        fill={comment.isLiked ? "#FF4444" : "transparent"}
                      />
                      <Text style={[styles.commentActionText, comment.isLiked && styles.likedText]}>
                        {comment.likes > 0 ? comment.likes : 'Polub'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentAction}>
                      <Text style={styles.commentActionText}>Odpowiedz</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Dodaj komentarz..."
            placeholderTextColor="#666666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send size={20} color={newComment.trim() ? "#000000" : "#666666"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
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
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
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
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  commentClub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
    marginLeft: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000000',
  },
  commentInput: {
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
});