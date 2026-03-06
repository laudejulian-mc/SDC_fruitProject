import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatWithGemini } from '../api';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useColors, Spacing, FontSize, BorderRadius } from '../theme';

const QUICK_REPLIES = [
  { key: 'what_is_fruitmd', icon: 'help-circle' },
  { key: 'how_to_detect', icon: 'camera' },
  { key: 'supported_fruits', icon: 'nutrition' },
  { key: 'freshness_tips', icon: 'leaf' },
  { key: 'accuracy', icon: 'analytics' },
];

export default function ChatbotScreen() {
  const { t, lang } = useI18n();
  const { dark } = useTheme();
  const { isGuest } = useAuth();
  const c = useColors(dark);

  const listRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: 'bot', text: t('chatbot.greeting'), time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text: text.trim(), time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    try {
      // Build conversation history for Gemini
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));
      const result = await chatWithGemini(history);
      const botText = result.text || t('chatbot.defaultReply');
      setMessages((prev) => [...prev, { role: 'bot', text: botText, time: new Date() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: t('chatbot.errorReply'), time: new Date() },
      ]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const handleQuickReply = (key) => {
    const text = t(`chatbot.quick_${key}`) || key.replace(/_/g, ' ');
    send(text);
  };

  const renderMessage = ({ item }) => {
    const isBot = item.role === 'bot';
    return (
      <View style={[styles.msgRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && (
          <View style={[styles.avatar, { backgroundColor: c.primary }]}>
            <Ionicons name="leaf" size={14} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isBot
              ? [styles.botBubble, { backgroundColor: c.inputBg }]
              : [styles.userBubble, { backgroundColor: c.primary }],
          ]}
        >
          <Text style={[styles.msgText, { color: isBot ? c.text : '#fff' }]}>{item.text}</Text>
          <Text style={[styles.msgTime, { color: isBot ? c.textMuted : 'rgba(255,255,255,0.7)' }]}>
            {item.time?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) ?? ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestTitle, { color: c.textSecondary }]}>{t('chatbot.suggestions')}</Text>
          {QUICK_REPLIES.map((qr) => (
            <TouchableOpacity
              key={qr.key}
              style={[styles.suggestChip, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}
              onPress={() => handleQuickReply(qr.key)}
            >
              <Ionicons name={qr.icon} size={16} color={c.primary} />
              <Text style={[styles.suggestText, { color: c.text }]}>
                {t(`chatbot.quick_${qr.key}`) || qr.key.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToEnd}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={[styles.typingRow]}>
          <View style={[styles.avatar, { backgroundColor: c.primary }]}>
            <Ionicons name="leaf" size={14} color="#fff" />
          </View>
          <View style={[styles.bubble, styles.botBubble, { backgroundColor: c.inputBg }]}>
            <ActivityIndicator size="small" color={c.primary} />
          </View>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: c.card, borderTopColor: c.cardBorder }]}>
        <TextInput
          style={[styles.input, { color: c.text, backgroundColor: c.inputBg }]}
          placeholder={t('chatbot.inputPlaceholder')}
          placeholderTextColor={c.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => send(input)}
          blurOnSubmit
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? c.primary : c.inputBg }]}
          onPress={() => send(input)}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={18} color={input.trim() ? '#fff' : c.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  suggestions: { padding: Spacing.lg, gap: Spacing.sm },
  suggestTitle: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 4 },
  suggestChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  suggestText: { fontSize: FontSize.sm, fontWeight: '500' },
  messageList: { padding: Spacing.lg, gap: Spacing.sm },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: Spacing.sm },
  botRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '75%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg },
  botBubble: { borderBottomLeftRadius: 4 },
  userBubble: { borderBottomRightRadius: 4 },
  msgText: { fontSize: FontSize.sm, lineHeight: 20 },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: Spacing.lg, paddingBottom: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: Spacing.md, borderTopWidth: 1,
  },
  input: {
    flex: 1, paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderRadius: BorderRadius.lg, fontSize: FontSize.sm, maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
