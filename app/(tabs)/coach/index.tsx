import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { router } from 'expo-router';

import { MessageBubble } from '@/components/coach/MessageBubble';
import { QuickSuggestions } from '@/components/coach/QuickSuggestions';
import { TypingIndicator } from '@/components/coach/TypingIndicator';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { useCoachStore } from '@/stores/coachStore';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import type { ChatMessage } from '@/types';

const BASE_SUGGESTIONS = [
  'Should I push through or make it easier?',
  'How do I know when my dog is ready to progress?',
  "What should I focus on in today's session?",
  'What do I do when my dog gets distracted?',
];

const ADAPTIVE_SUGGESTIONS = [
  "Why did today's plan change?",
  'What is Pawly learning about my dog?',
  'Should I push through or make it easier?',
  'How do I know when my dog is ready to progress?',
];

const COMPOSER_MAX_HEIGHT = 144;

function ChatSkeleton() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      <SkeletonBlock height={72} width="70%" borderRadius={radii.md} />
      <SkeletonBlock height={48} width="55%" borderRadius={radii.md} style={{ alignSelf: 'flex-end' }} />
      <SkeletonBlock height={96} width="80%" borderRadius={radii.md} />
      <SkeletonBlock height={48} width="45%" borderRadius={radii.md} style={{ alignSelf: 'flex-end' }} />
    </View>
  );
}

export default function CoachScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
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
  const listRef = useRef<FlatList<ChatMessage>>(null);

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

  const canSend = inputText.trim().length > 0 && !isTyping;

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

    Alert.alert('Start a new chat?', `This clears the conversation about ${dog.name} and starts a new one.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start new chat',
        style: 'destructive',
        onPress: () => {
          setInputText('');
          resetConversation(dog.id);
        },
      },
    ]);
  }, [dog, isTyping, resetConversation]);

  if (!isInit) {
    return <ChatSkeleton />;
  }

  if (!dog) {
    return (
      <EmptyState
        mascotState="waiting"
        title="Add your dog first"
        subtitle="The coach needs your dog's profile before it can help."
        action={{ label: 'Add your dog', onPress: () => router.push('/(onboarding)/dog-basics') }}
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );
  }

  const hasMessages = messages.length > 0;
  const hasRecentAdaptation = recentAdaptations.length > 0 && recentAdaptations[0].status === 'applied';
  const suggestions = hasRecentAdaptation ? ADAPTIVE_SUGGESTIONS : BASE_SUGGESTIONS;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight + tabBarHeight}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg }}
        style={{ flex: 1 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg, marginBottom: spacing.xl }}>
            <PageHeader
              title="Coach"
              line={hasMessages ? `Still here. Ask me anything else about ${dog.name}.` : `Ask me anything about ${dog.name}. I know the whole history.`}
              mascotState={isTyping ? 'thinking' : 'happy'}
            />
            {hasMessages ? (
            <View style={{ alignItems: 'flex-start' }}>
              <Button
                label="New chat"
                variant="ghost"
                size="md"
                icon="add-outline"
                onPress={handleResetChat}
                disabled={isTyping}
                style={{ paddingHorizontal: 0 }}
              />
            </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title="Good places to start" />
            <QuickSuggestions suggestions={suggestions} onSelect={handleSuggestion} disabled={isTyping} />
          </View>
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
      />

      {rateLimitError ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.sm,
            paddingLeft: spacing.md,
            backgroundColor: colors.status.warningSoft,
            borderRadius: radii.sm,
          }}
          accessibilityLiveRegion="polite"
        >
          <AppIcon name="alert-circle-outline" size={20} color={colors.status.warning} />
          <Text variant="caption" color={colors.status.warning} style={{ flex: 1 }}>
            {rateLimitError}
          </Text>
          <IconButton icon="close" accessibilityLabel="Dismiss" tone="secondary" onPress={clearRateLimitError} />
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          backgroundColor: colors.bg.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border.hairline,
        }}
      >
        <Input
          style={{ flex: 1, maxHeight: COMPOSER_MAX_HEIGHT }}
          placeholder={`Ask about ${dog.name}`}
          accessibilityLabel="Message the coach"
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={1}
          maxLength={1000}
          returnKeyType="send"
          enablesReturnKeyAutomatically
          submitBehavior="submit"
          onSubmitEditing={handleSend}
          editable={!isTyping}
        />
        <IconButton
          icon="arrow-up"
          variant="filled"
          accessibilityLabel="Send"
          onPress={handleSend}
          disabled={!canSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
