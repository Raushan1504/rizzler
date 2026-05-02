import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function MatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches');
      setMatches(res.data.data || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const matchedUser = item.user;
    if (!matchedUser) return null;

    const photoUri = matchedUser.photos && matchedUser.photos.length > 0
      ? matchedUser.photos[0]
      : null;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => router.push({ pathname: `/chat/${item._id}`, params: { name: matchedUser.name } })}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.matchPhoto} />
        ) : (
          <View style={[styles.matchPhoto, styles.placeholderPhoto]}>
            <Text style={styles.placeholderEmoji}>🙂</Text>
          </View>
        )}
        <Text style={styles.matchName} numberOfLines={1}>{matchedUser.name}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>New Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyText}>No matches yet.</Text>
          <Text style={styles.emptySubtext}>Keep swiping to find your spark!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF5A5F',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  matchCard: {
    flex: 1 / 3,
    aspectRatio: 0.7,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
  },
  matchPhoto: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },
  placeholderPhoto: {
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  matchName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#888899',
    textAlign: 'center',
  },
});
