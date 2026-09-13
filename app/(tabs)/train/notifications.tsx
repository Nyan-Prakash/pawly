import { useCallback, useEffect, useRef } from 'react';
import { FlatList, View, type ViewToken } from 'react-native';
import { router } from 'expo-router';

import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { getNotificationDeepLink } from '@/lib/inAppNotifications';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import type { InAppNotification } from '@/types';

function LoadingRows() {
  return (
    <View style={{ gap: spacing.sm }}>
      {[0, 1, 2].map((i) => (
        <SkeletonBlock key={i} height={96} borderRadius={radii.md} />
      ))}
    </View>
  );
}

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

  const showMarkAll = !!user?.id && unreadCount > 0;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationItem item={item} onPress={handlePressItem} />}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: spacing.lg,
        gap: spacing.sm,
        flexGrow: items.length === 0 ? 1 : undefined,
      }}
      ListHeaderComponent={
        showMarkAll ? (
          <Button
            label="Mark all as read"
            variant="ghost"
            size="md"
            onPress={() => user?.id && markAllAsRead(user.id)}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          />
        ) : null
      }
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={{ itemVisiblePercentThreshold: 65 }}
      ListEmptyComponent={
        isLoadingInbox ? (
          <LoadingRows />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState
              icon="notifications-outline"
              title="No notifications yet"
              subtitle="Plan updates will show up here once your dog's plan changes."
              action={{ label: 'Back to Train', onPress: () => router.back() }}
            />
          </View>
        )
      }
    />
  );
}
