import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import api from '../../services/api';
import MatchModal from '../../components/MatchModal';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.68;
const SWIPE_THRESHOLD = width * 0.3;

export default function DiscoverScreen() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchVisible, setMatchVisible] = useState(false);
  const [matchedName, setMatchedName] = useState('');

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/discover');
      setUsers(res.data.data || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to fetch discover users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const currentUser = users[currentIndex];

  const handleSwipe = async (action) => {
    if (!currentUser) return;
    
    try {
      const res = await api.post('/swipe', {
        swipedUserId: currentUser._id,
        action,
      });

      if (res.data?.data?.isMatch) {
        setMatchedName(currentUser.name);
        setMatchVisible(true);
      }

      // Move to next user
      if (currentIndex < users.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        // Reset card position for next user
        translateX.value = 0;
        translateY.value = 0;
      } else {
        // All users swiped — refetch
        await fetchUsers();
      }
    } catch (err) {
      console.error('Swipe failed:', err);
      // Spring back if API fails
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  };

  const forceSwipe = (direction) => {
    'worklet';
    const destination = direction === 'right' ? width + 100 : -width - 100;
    translateX.value = withSpring(destination, { velocity: 50 }, () => {
      runOnJS(handleSwipe)(direction === 'right' ? 'like' : 'dislike');
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe Right
        translateX.value = withSpring(width + 100, { velocity: event.velocityX }, () => {
          runOnJS(handleSwipe)('like');
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe Left
        translateX.value = withSpring(-width - 100, { velocity: event.velocityX }, () => {
          runOnJS(handleSwipe)('dislike');
        });
      } else {
        // Spring back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-width / 2, 0, width / 2], [-15, 0, 15], 'clamp');
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nopeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, -SWIPE_THRESHOLD / 2], [0, 1], 'clamp');
    return { opacity };
  });

  const likeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1], 'clamp');
    return { opacity };
  });

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>Finding people near you…</Text>
      </View>
    );
  }

  // ── Empty State ────────────────────────────────────────────
  if (!users.length || !currentUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>😴</Text>
        <Text style={styles.emptyTitle}>No one new around</Text>
        <Text style={styles.emptySubtitle}>Check back later!</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photoUri = currentUser.photos && currentUser.photos.length > 0 ? currentUser.photos[0] : null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.placeholderPhoto]}>
              <Text style={styles.placeholderEmoji}>🙂</Text>
            </View>
          )}

          <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}>
            <Text style={[styles.stampText, styles.nopeStampText]}>NOPE</Text>
          </Animated.View>

          <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}>
            <Text style={[styles.stampText, styles.likeStampText]}>LIKE</Text>
          </Animated.View>

          <View style={styles.gradient} />
          <View style={styles.infoOverlay}>
            <Text style={styles.name}>
              {currentUser.name}
              {currentUser.age ? `, ${currentUser.age}` : ''}
            </Text>
            {currentUser.bio ? (
              <Text style={styles.bio} numberOfLines={3}>{currentUser.bio}</Text>
            ) : null}
          </View>
        </Animated.View>
      </GestureDetector>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.dislikeBtn]} onPress={() => forceSwipe('left')}>
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={() => forceSwipe('right')}>
          <Text style={styles.actionIcon}>♥</Text>
        </TouchableOpacity>
      </View>

      <MatchModal visible={matchVisible} matchedName={matchedName} onClose={() => setMatchVisible(false)} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderPhoto: {
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 60,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bio: {
    fontSize: 15,
    color: '#DDDDDD',
    lineHeight: 20,
  },
  stamp: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 4,
  },
  nopeStamp: {
    right: 40,
    borderColor: '#FF4458',
    transform: [{ rotate: '15deg' }],
  },
  likeStamp: {
    left: 40,
    borderColor: '#4CAF50',
    transform: [{ rotate: '-15deg' }],
  },
  stampText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  nopeStampText: {
    color: '#FF4458',
  },
  likeStampText: {
    color: '#4CAF50',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 36,
    marginTop: 24,
  },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dislikeBtn: {
    backgroundColor: '#2C2C3E',
    borderWidth: 2,
    borderColor: '#FF4458',
  },
  likeBtn: {
    backgroundColor: '#FF5A5F',
  },
  actionIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888899',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888899',
    marginBottom: 24,
  },
  refreshBtn: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
