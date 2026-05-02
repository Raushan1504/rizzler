import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

// Derive socket URL from API_BASE_URL (removing /api)
const API_BASE_URL = api.defaults.baseURL;
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export default function ChatScreen({ matchId, matchName }) {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial message history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${matchId}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();

    // 2. Initialize Socket.io connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join the specific match room
    newSocket.emit('join_match', matchId);

    // Listen for incoming messages
    newSocket.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [matchId]);

  const sendMessage = () => {
    if (!inputText.trim() || !socket) return;

    const messageData = {
      matchId,
      senderId: user._id,
      text: inputText.trim(),
    };

    // Send to server via socket
    socket.emit('send_message', messageData);
    setInputText('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender._id === user._id;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperThem]}>
        {!isMe && item.sender.photos?.[0] && (
          <Image source={{ uri: item.sender.photos[0] }} style={styles.avatar} />
        )}
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const handleUnmatch = async () => {
    try {
      await api.delete(`/matches/${matchId}`);
      router.back();
    } catch (error) {
      console.error('Failed to unmatch:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{matchName || 'Chat'}</Text>
        <TouchableOpacity onPress={handleUnmatch} style={styles.unmatchButton}>
          <Text style={styles.unmatchText}>Unmatch</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#888899"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3E',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unmatchButton: {
    padding: 8,
  },
  unmatchText: {
    color: '#888899',
    fontSize: 14,
    fontWeight: '600',
  },
  messageList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperThem: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 20,
  },
  messageBubbleMe: {
    backgroundColor: '#FF5A5F',
    borderBottomRightRadius: 4,
  },
  messageBubbleThem: {
    backgroundColor: '#2C2C3E',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTextThem: {
    color: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1A2E',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#2C2C3E',
  },
  input: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  sendButton: {
    marginLeft: 12,
    marginBottom: 8,
    backgroundColor: '#FF5A5F',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
