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
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import MatchModal from '../../components/MatchModal';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.68;

// Ensure user is authenticated before making API calls
const ensureAuth = async () => {
  const existing = await SecureStore.getItemAsync('authToken');
  if (existing) return;

  try {
    // Auto-login with a test account (replace with your credentials)
    const res = await api.post('/auth/login', {
      email: 'rizzler@test.com',
      password: 'test123',
    });
    if (res.data?.token) {
      await SecureStore.setItemAsync('authToken', res.data.token);
    }
  } catch (err) {
    console.error('Auto-login failed:', err);
  }
};

export default function DiscoverScreen() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchVisible, setMatchVisible] = useState(false);
  const [matchedName, setMatchedName] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      await ensureAuth();
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
    if (swiping || !currentUser) return;

    setSwiping(true);
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
      } else {
        // All users swiped — refetch
        await fetchUsers();
      }
    } catch (err) {
      console.error('Swipe failed:', err);
    } finally {
      setSwiping(false);
    }
  };

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

  // ── Profile photo ──────────────────────────────────────────
  const photoUri =
    currentUser.photos && currentUser.photos.length > 0
      ? currentUser.photos[0]
      : null;

  // ── Main UI ────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Card */}
      <View style={styles.card}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.placeholderPhoto]}>
            <Text style={styles.placeholderEmoji}>🙂</Text>
          </View>
        )}

        {/* Gradient overlay at bottom of image */}
        <View style={styles.gradient} />

        {/* Info overlay */}
        <View style={styles.infoOverlay}>
          <Text style={styles.name}>
            {currentUser.name}
            {currentUser.age ? `, ${currentUser.age}` : ''}
          </Text>
          {currentUser.bio ? (
            <Text style={styles.bio} numberOfLines={3}>
              {currentUser.bio}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.dislikeBtn]}
          onPress={() => handleSwipe('dislike')}
          disabled={swiping}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => handleSwipe('like')}
          disabled={swiping}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Match modal */}
      <MatchModal
        visible={matchVisible}
        matchedName={matchedName}
        onClose={() => setMatchVisible(false)}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },

  // ── Card ───────────────────────────────────────────────────
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
    backgroundColor: 'transparent',
    // Simulated gradient via multiple shadow layers — RN has no LinearGradient
    // by default, so we use a semi-transparent overlay instead.
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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

  // ── Action Buttons ─────────────────────────────────────────
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

  // ── Loading / Empty States ─────────────────────────────────
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
