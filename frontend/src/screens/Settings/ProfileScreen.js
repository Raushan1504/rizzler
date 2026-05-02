import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  // State initialization with safety checks
  const [bio, setBio] = useState(user?.bio || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [interests, setInterests] = useState(user?.interests ? user.interests.join(', ') : '');
  const [photo, setPhoto] = useState(user?.photos?.[0] || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload your photo.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      // Create the base64 data URI
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhoto(base64Image);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        bio,
        age: parseInt(age, 10) || undefined,
        interests: interests.split(',').map(i => i.trim()).filter(Boolean),
      };

      if (photo) {
        payload.photos = [photo];
      }

      await api.put('/users/profile', payload);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarPlaceholder}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.profileImage} />
            ) : (
              <Text style={styles.avatarEmoji}>📸</Text>
            )}
            <View style={styles.editIconBadge}>
              <Text style={styles.editIconText}>+</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.nameText}>{user?.name || 'User Name'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="Your age"
            placeholderTextColor="#888899"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            placeholder="Write something about yourself..."
            placeholderTextColor="#888899"
          />

          <Text style={styles.label}>Interests (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={interests}
            onChangeText={setInterests}
            placeholder="Coding, Hiking, Coffee..."
            placeholderTextColor="#888899"
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2C2C3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF5A5F',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF5A5F',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F0F1A',
  },
  editIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#888899',
  },
  formSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4458',
  },
  logoutText: {
    color: '#FF4458',
    fontSize: 16,
    fontWeight: '700',
  },
});
