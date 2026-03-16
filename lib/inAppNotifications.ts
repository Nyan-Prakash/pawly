import type { InAppNotification } from '@/types';

function readMetadataValue(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function formatRelative(diffMs: number): string {
  const diffAbsMs = Math.abs(diffMs);
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffAbsMs < hourMs) {
    const minutes = Math.max(1, Math.round(diffAbsMs / minuteMs));
    return diffMs < 0 ? `${minutes}m ago` : `in ${minutes}m`;
  }

  if (diffAbsMs < dayMs) {
    const hours = Math.max(1, Math.round(diffAbsMs / hourMs));
    return diffMs < 0 ? `${hours}h ago` : `in ${hours}h`;
  }

  const days = Math.max(1, Math.round(diffAbsMs / dayMs));
  if (days === 1) {
    return diffMs < 0 ? 'Yesterday' : 'Tomorrow';
  }

  return diffMs < 0 ? `${days}d ago` : `in ${days}d`;
}

export function formatNotificationTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = date.getTime() - Date.now();
  const diffAbsMs = Math.abs(diffMs);
  const dayMs = 24 * 60 * 60 * 1000;

  const absolute = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return diffAbsMs <= 7 * dayMs ? `${formatRelative(diffMs)} · ${absolute}` : absolute;
}

export function getNotificationDeepLink(notification: InAppNotification): string | null {
  return readMetadataValue(notification.metadata, 'deepLink');
}

export function getPlanUpdateNotificationEventKey(input: {
  adaptationId?: string | null;
  planId?: string | null;
  planUpdatedAt?: string | null;
}): string | null {
  if (input.adaptationId) {
    return `adaptation:${input.adaptationId}`;
  }

  if (input.planId && input.planUpdatedAt) {
    return `plan:${input.planId}:${input.planUpdatedAt}`;
  }

  return null;
}

export function isDuplicatePlanUpdateNotification(
  notification: Pick<InAppNotification, 'type' | 'metadata'>,
  metadata: Record<string, unknown>,
): boolean {
  if (notification.type !== 'plan_updated') return false;

  const existingKey = getPlanUpdateNotificationEventKey({
    adaptationId: readMetadataValue(notification.metadata, 'adaptationId'),
    planId: readMetadataValue(notification.metadata, 'planId'),
    planUpdatedAt: readMetadataValue(notification.metadata, 'planUpdatedAt'),
  });

  const nextKey = getPlanUpdateNotificationEventKey({
    adaptationId: readMetadataValue(metadata, 'adaptationId'),
    planId: readMetadataValue(metadata, 'planId'),
    planUpdatedAt: readMetadataValue(metadata, 'planUpdatedAt'),
  });

  return existingKey !== null && existingKey === nextKey;
}
