import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Alert,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { EmptyState } from '@/components/ui/EmptyState';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { MessageBubble } from '@/components/coach/MessageBubble';
import { QuickSuggestions } from '@/components/coach/QuickSuggestions';
import { TypingIndicator } from '@/components/coach/TypingIndicator';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/lib/theme';
import { useCoachStore } from '@/stores/coachStore';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';

export default function CoachScreen() {
  const { isDark } = useTheme();
  const { dog } = useDogStore();
  const { recentAdaptations } = usePlanStore();
  const {
    messages,
    isTyping,
    rateLimitError,
    initConversation,
    resetConversation,
    sendMessage,
    clearRateLimitError,
  } = useCoachStore();

  const [inputText, setInputText] = useState('');
  const [isInit, setIsInit] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const styles = createStyles(isDark);

  useEffect(() => {
    if (!dog) {
      setIsInit(true);
      return;
    }

    initConversation(dog.id).finally(() => setIsInit(true));
  }, [dog?.id, initConversation]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      const timeout = setTimeout(scrollToBottom, 80);
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [messages.length, isTyping, scrollToBottom]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isTyping) return;
    setInputText('');
    sendMessage(text);
  }, [inputText, isTyping, sendMessage]);

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      if (isTyping) return;
      sendMessage(suggestion);
    },
    [isTyping, sendMessage],
  );

  const handleResetChat = useCallback(() => {
    if (!dog || isTyping) return;

    Alert.alert(
      'Start a new chat?',
      `This will clear the current conversation with ${dog.name} and start a fresh coaching thread.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset chat',
          style: 'destructive',
          onPress: () => {
            setInputText('');
            resetConversation(dog.id);
          },
        },
      ],
    );
  }, [dog, isTyping, resetConversation]);

  if (!isInit) {
    return (
      <SafeScreen style={styles.screen}>
        <LinearGradient
          colors={colors.gradient.app as [string, string, string]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <CoachHeader dogName={dog?.name} />
        <View style={styles.centered}>
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.brand.primary} />
            <Text style={styles.loadingText}>Preparing your coach...</Text>
          </View>
        </View>
      </SafeScreen>
    );
  }

  if (!dog) {
    return (
      <SafeScreen style={styles.screen}>
        <LinearGradient
          colors={colors.gradient.app as [string, string, string]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <CoachHeader />
        <View style={styles.emptyWrap}>
          <EmptyState
            mascotState="waiting"
            title="Set up your dog's profile"
            subtitle="Complete your dog's profile to unlock personalized coaching."
            style={styles.centered}
          />
        </View>
      </SafeScreen>
    );
  }

  const showWelcome = messages.length === 0;
  const hasRecentAdaptation = recentAdaptations.length > 0 && recentAdaptations[0].status === 'applied';
  const suggestions = hasRecentAdaptation ? ADAPTIVE_SUGGESTIONS : BASE_SUGGESTIONS;

  return (
    <SafeScreen style={styles.screen}>
      <LinearGradient
        colors={colors.gradient.app as [string, string, string]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CoachHeader dogName={dog.name} onReset={handleResetChat} isResetDisabled={isTyping} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.flex}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListEmptyComponent={
              <WelcomeState dogName={dog.name} />
            }
            ListFooterComponent={
              isTyping ? <TypingIndicator /> : <View style={styles.listEndSpacer} />
            }
            contentContainerStyle={[
              styles.messageList,
              showWelcome ? styles.messageListEmpty : undefined,
            ]}
            style={styles.flex}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToBottom}
          />
        </View>

        {rateLimitError ? (
          <Pressable style={styles.errorBanner} onPress={clearRateLimitError}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorBannerText}>{rateLimitError}</Text>
            <Ionicons name="close" size={16} color={colors.error} />
          </Pressable>
        ) : null}

        {showWelcome ? (
          <View style={styles.suggestionTray}>
            <QuickSuggestions suggestions={suggestions} onSelect={handleSuggestion} />
          </View>
        ) : null}

        <View style={styles.composerShell}>
          <View style={styles.composerBar}>
            <Pressable style={styles.leadingAction}>
              <Ionicons name="add" size={24} color={colors.text.primary} />
            </Pressable>

            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                placeholder={`Ask about ${dog.name}...`}
                placeholderTextColor={colors.text.secondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={handleSend}
                editable={!isTyping}
              />

              <View style={styles.composerActions}>
                <Pressable style={styles.roundAction}>
                  <Ionicons name="mic-outline" size={20} color={colors.text.secondary} />
                </Pressable>

                <Pressable
                  style={[
                    styles.sendButton,
                    !inputText.trim() || isTyping ? styles.sendButtonIdle : undefined,
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || isTyping}
                >
                  <Ionicons
                    name={inputText.trim() ? 'arrow-up' : 'sparkles-outline'}
                    size={18}
                    color={
                      inputText.trim() && !isTyping
                        ? colors.text.inverse
                        : colors.text.primary
                    }
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const BASE_SUGGESTIONS = [
  'Should I push through or make it easier?',
  'How do I know when my dog is ready to progress?',
  'What should I focus on in today\'s session?',
  'My dog keeps getting distracted — what should I do?',
];

const ADAPTIVE_SUGGESTIONS = [
  'Why did today\'s plan change?',
  'What is Pawly learning about my dog?',
  'Should I push through or make it easier?',
  'How do I know when my dog is ready to progress?',
];

function WelcomeState({
  dogName,
}: {
  dogName: string;
}) {
  const { isDark } = useTheme();
  const styles = createStyles(isDark);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.welcomeWrap}>
      <View style={styles.welcomeHero}>
        <View style={styles.welcomePill}>
          <Text variant="caption" style={styles.welcomeEyebrow}>
            Pawly Coach
          </Text>
        </View>
        <Text variant="display" style={styles.welcomeGreeting}>
          {greeting}
        </Text>
        <Text variant="h2" style={styles.welcomeHeading}>
          How can I help {dogName} today?
        </Text>
        <Text style={styles.welcomeDescription}>
          Get quick guidance for behavior or a clear suggestion on what to work on next.
        </Text>
      </View>
    </View>
  );
}

function CoachHeader({
  dogName,
  onReset,
  isResetDisabled = false,
}: {
  dogName?: string;
  onReset?: () => void;
  isResetDisabled?: boolean;
}) {
  const { isDark } = useTheme();
  const styles = createStyles(isDark);

  return (
    <View style={styles.header}>
      <View style={styles.headerSurface}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => router.replace('/(tabs)/train')}
          >
            <Ionicons name="menu-outline" size={24} color={colors.text.primary} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text variant="h2" style={styles.headerTitle}>
              Pawly Coach
            </Text>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.headerOnlineDot} />
              <Text variant="caption" style={styles.headerSubtitle}>
                {dogName ? `${dogName}'s training assistant` : 'Behavior support'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={[
                styles.headerIconButton,
                isResetDisabled ? styles.headerIconButtonDisabled : undefined,
              ]}
              onPress={onReset}
              disabled={!onReset || isResetDisabled}
            >
              <Ionicons name="refresh-outline" size={21} color={colors.text.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    screen: {
      backgroundColor: colors.bg.app,
    },
    flex: {
      flex: 1,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyWrap: {
      flex: 1,
    },

    loadingCard: {
      minWidth: 180,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 24,
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.soft,
      shadowColor: colors.shadow.strong,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
      elevation: 5,
    },
    loadingText: {
      color: colors.text.secondary,
    },

    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    headerSurface: {
      borderRadius: 28,
      backgroundColor: colors.bg.glass,
      borderWidth: 1,
      borderColor: colors.border.soft,
      shadowColor: colors.shadow.soft,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    headerIconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg.elevatedMuted,
      borderWidth: 1,
      borderColor: colors.border.soft,
    },
    headerIconButtonDisabled: {
      opacity: 0.45,
    },
    headerTitleWrap: {
      flex: 1,
      minWidth: 0,
    },
    headerTitle: {
      fontSize: 24,
      lineHeight: 28,
    },
    headerSubtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 3,
    },
    headerOnlineDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: '#22C55E',
    },
    headerSubtitle: {
      color: colors.text.secondary,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },

    messageList: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    messageListEmpty: {
      justifyContent: 'center',
    },

    welcomeWrap: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: spacing.xl * 1.5,
    },
    welcomeHero: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    welcomePill: {
      alignSelf: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm,
      shadowColor: colors.brand.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 4,
    },
    welcomeEyebrow: {
      color: colors.brand.primary,
      letterSpacing: 1,
      fontWeight: '700',
      textTransform: 'uppercase',
      fontSize: 11,
    },
    welcomeGreeting: {
      textAlign: 'center',
      fontSize: 44,
      lineHeight: 48,
      marginBottom: spacing.xs,
      color: colors.brand.primary,
    },
    welcomeHeading: {
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    welcomeDescription: {
      textAlign: 'center',
      color: colors.text.secondary,
      lineHeight: 22,
      maxWidth: 320,
    },
    listEndSpacer: {
      height: spacing.sm,
    },

    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      borderRadius: 18,
      backgroundColor: colors.status.dangerBg,
      borderWidth: 1,
      borderColor: colors.status.dangerBorder,
    },
    errorBannerText: {
      flex: 1,
      fontSize: 13,
      color: colors.error,
    },

    suggestionTray: {
      backgroundColor: colors.bg.app,
      paddingTop: spacing.xs,
      marginBottom: spacing.sm,
    },

    composerShell: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      marginBottom: 10,
    },
    composerBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
    },
    leadingAction: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.default,
      shadowColor: colors.shadow.soft,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    composer: {
      flex: 1,
      minHeight: 58,
      maxHeight: 140,
      borderRadius: 30,
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.default,
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow.soft,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 6,
    },
    input: {
      flex: 1,
      maxHeight: 112,
      paddingTop: Platform.OS === 'ios' ? 0 : 0,
      paddingBottom: Platform.OS === 'ios' ? 0 : 0,
      paddingRight: spacing.sm,
      fontSize: 17,
      lineHeight: 22,
      color: colors.text.primary,
      textAlignVertical: 'center',
    },
    composerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    roundAction: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg.surfaceAlt,
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.brand.primary,
    },
    sendButtonIdle: {
      backgroundColor: isDark ? colors.bg.surfaceAlt : '#F3F4F6',
    },
  });
}
