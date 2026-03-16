import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, View, type ViewToken } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { NotificationItem } from '@/components/notifications/NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { getNotificationDeepLink } from '@/lib/inAppNotifications';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import type { InAppNotification } from '@/types';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const viewedIdsRef = useRef<Set<string>>(new Set());

  const items = useNotificationStore((state) => state.items);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoadingInbox = useNotificationStore((state) => state.isLoadingInbox);
  const fetchInbox = useNotificationStore((state) => state.fetchInbox);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  useEffect(() => {
    if (!user?.id) return;
    fetchInbox(user.id).catch((error) => {
      console.warn('[notifications] fetchInbox error:', error);
    });
  }, [fetchInbox, user?.id]);

  const handlePressItem = useCallback(
    async (item: InAppNotification) => {
      if (!item.isRead) {
        await markAsRead(item.id);
      }

      const deepLink = getNotificationDeepLink(item);
      if (deepLink) {
        router.push(deepLink as Parameters<typeof router.push>[0]);
      }
    },
    [markAsRead],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken<InAppNotification>> }) => {
      for (const token of viewableItems) {
        const item = token.item;
        if (!item || item.isRead || viewedIdsRef.current.has(item.id)) continue;
        viewedIdsRef.current.add(item.id);
        markAsRead(item.id).catch((error) => {
          console.warn('[notifications] markAsRead error:', error);
        });
      }
    },
  );

  const headerRight = useMemo(() => {
    if (!user?.id || unreadCount === 0) return null;

    return (
      <Pressable
        onPress={() => markAllAsRead(user.id)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.72 : 1,
          paddingVertical: spacing.xs,
        })}
      >
        <Text variant="bodyStrong" color={colors.brand.primary}>
          Mark all as read
        </Text>
      </Pressable>
    );
  }, [markAllAsRead, unreadCount, user?.id]);

  return (
    <SafeScreen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
          <Pressable onPress={() => router.back()} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="title">Notifications</Text>
            <Text variant="caption">Recent updates to your dog&apos;s plan</Text>
          </View>
        </View>
        {headerRight}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} onPress={handlePressItem} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xxl * 2,
          gap: spacing.sm,
          flexGrow: items.length === 0 ? 1 : undefined,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 65 }}
        ListEmptyComponent={
          isLoadingInbox ? (
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border.default,
                padding: spacing.lg,
              }}
            >
              <Text variant="body">Loading notifications…</Text>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <EmptyState
                icon="notifications-outline"
                title="No notifications yet"
                subtitle="Plan updates will show up here once your dog&apos;s training plan changes."
              />
            </View>
          )
        }
      />
    </SafeScreen>
  );
}
