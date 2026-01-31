import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import io from 'socket.io-client';

interface Message {
  _id: string;
  senderId: string;
  senderType: 'user' | 'provider';
  text: string;
  createdAt: string;
}

interface ChatScreenProps {
  route: { params: { chatId: string; userId: string } };
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId, userId } = route.params;
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const res = await api.get(`/chats/${chatId}/messages`);
      return res.data;
    }
  });

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.emit('join', userId);
    newSocket.emit('join-chat', chatId);

    newSocket.on('new-message', (msg: Message) => {
      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => [...old, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatId, userId]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      socket?.emit('send-message', {
        chatId,
        senderId: userId,
        senderType: 'user',
        text
      });
    },
    onSuccess: () => {
      setMessage('');
    }
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === userId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
        <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messagesList: { padding: 16 },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ec4899',
    borderBottomRightRadius: 4
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  messageText: { fontSize: 15, color: '#1f2937' },
  myMessageText: { color: 'white' },
  messageTime: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  myMessageTime: { color: '#fce7f3' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 15
  },
  sendButton: {
    backgroundColor: '#ec4899',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  sendButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 }
});
