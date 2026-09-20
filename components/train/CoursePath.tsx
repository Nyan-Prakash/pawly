import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/PillTag';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { EXERCISE_TO_PROTOCOL, PROTOCOLS_BY_ID, type Protocol } from '@/constants/protocols';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { PRO_LOCK_LABEL } from '@/hooks/useSessionLock';
import type { PlanSession } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Grouping: a course is a path of stages; each stage ends with a check session
// ─────────────────────────────────────────────────────────────────────────────

export type NodeState = 'done' | 'next' | 'locked';

export type PathNode = {
  session: PlanSession;
  /** 1-based position inside the stage. */
  index: number;
  state: NodeState;
  isCheck: boolean;
};

export type StageGroup = {
  stage: number;
  title: string | null;
  nodes: PathNode[];
  doneCount: number;
  /** True when the course's next session lives in this stage. */
  isCurrent: boolean;
  isLocked: boolean;
};

export function resolveProtocol(session: PlanSession): Protocol | null {
  const byExercise = EXERCISE_TO_PROTOCOL[session.exerciseId];
  return PROTOCOLS_BY_ID[byExercise ?? session.exerciseId] ?? null;
}

const NODE_SIZE = 40;
const RING_WIDTH = 2;
const CONNECTOR_HEIGHT = 2;
const WRAP_AFTER = 6;

/**
 * Groups a course's sessions by protocol stage (1 to 4, sessions without a
 * protocol last). The first incomplete session in path order is "next"; every
 * session after it is locked.
 */
export function buildStageGroups(sessions: PlanSession[]): StageGroup[] {
  const byStage = new Map<number, { title: string | null; sessions: PlanSession[] }>();

  for (const session of sessions) {
    const protocol = resolveProtocol(session);
    const stage = protocol?.stage ?? Number.MAX_SAFE_INTEGER;
    const entry = byStage.get(stage) ?? { title: protocol?.title ?? null, sessions: [] };
    entry.sessions.push(session);
    byStage.set(stage, entry);
  }

  const ordered = [...byStage.entries()].sort(([a], [b]) => a - b);
  let nextFound = false;
  const groups: StageGroup[] = [];

  for (const [stage, entry] of ordered) {
    const checkIdx = (() => {
      const proofingIdx = entry.sessions.findIndex((s) => s.sessionKind === 'proofing');
      return proofingIdx >= 0 ? proofingIdx : entry.sessions.length - 1;
    })();

    const nodes: PathNode[] = entry.sessions.map((session, i) => {
      let state: NodeState;
      if (session.isCompleted) {
        state = 'done';
      } else if (!nextFound) {
        state = 'next';
        nextFound = true;
      } else {
        state = 'locked';
      }
      return { session, index: i + 1, state, isCheck: i === checkIdx };
    });

    groups.push({
      stage,
      title: entry.title,
      nodes,
      doneCount: nodes.filter((n) => n.state === 'done').length,
      isCurrent: nodes.some((n) => n.state === 'next'),
      isLocked: nodes.length > 0 && nodes.every((n) => n.state === 'locked'),
    });
  }

  return groups;
}

export function stageLabel(group: StageGroup): string {
  return group.stage === Number.MAX_SAFE_INTEGER ? 'Extra sessions' : `Stage ${group.stage}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node
// ─────────────────────────────────────────────────────────────────────────────

function nodeA11yLabel(node: PathNode, needsPro: boolean): string {
  const what = node.isCheck ? `Stage check, ${node.session.title}` : `Session ${node.index}, ${node.session.title}`;
  const status = node.state === 'done' ? 'completed' : node.state === 'next' ? 'next up' : 'locked';
  return needsPro ? `${what}, ${status}, ${PRO_LOCK_LABEL}` : `${what}, ${status}`;
}

function PathNodeButton({ node, needsPro, onPress }: { node: PathNode; needsPro: boolean; onPress: () => void }) {
  const isDone = node.state === 'done';
  const isNext = node.state === 'next';
  const tint = isNext ? colors.accent : colors.text.secondary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={nodeA11yLabel(node, needsPro)}
      accessibilityHint="Opens session details"
      style={({ pressed }) => ({
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDone ? colors.accent : isNext ? colors.bg.surface : colors.bg.fill,
          borderWidth: isNext ? RING_WIDTH : 0,
          borderColor: colors.accent,
        }}
      >
        {isDone ? (
          <AppIcon name="checkmark" size={20} color={colors.text.onAccent} />
        ) : node.isCheck ? (
          <AppIcon name="flag" size={20} color={tint} />
        ) : (
          <Text variant="bodyStrong" color={tint}>
            {node.index}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function Connector() {
  return (
    <View
      style={{
        width: spacing.lg,
        height: CONNECTOR_HEIGHT,
        backgroundColor: colors.border.hairline,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage section: header + one Card of connected nodes
// ─────────────────────────────────────────────────────────────────────────────

type StagePathProps = {
  group: StageGroup;
  onSelectSession: (session: PlanSession) => void;
  /** The course's next session is past the free sessions; mark it where it shows. */
  nextNeedsPro?: boolean;
};

export function StagePath({ group, onSelectSession, nextNeedsPro = false }: StagePathProps) {
  const total = group.nodes.length;
  const nextNode = group.nodes.find((n) => n.state === 'next') ?? null;
  const wraps = total > WRAP_AFTER;

  return (
    <View>
      <SectionHeader title={stageLabel(group)} style={{ marginBottom: group.title ? 0 : spacing.sm }} />
      {group.title ? (
        <Text variant="caption" style={{ marginBottom: spacing.sm }}>
          {group.title}
        </Text>
      ) : null}
      <Card style={{ gap: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: wraps ? 'wrap' : 'nowrap',
            rowGap: spacing.sm,
          }}
        >
          {group.nodes.map((node, i) => (
            <View key={node.session.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {i > 0 ? <Connector /> : null}
              <PathNodeButton
                node={node}
                needsPro={nextNeedsPro && node.state === 'next'}
                onPress={() => onSelectSession(node.session)}
              />
            </View>
          ))}
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text variant="caption">
            {group.doneCount} of {total} sessions
          </Text>
          {group.isCurrent && nextNode ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text variant="caption" color={colors.text.primary} style={{ flexShrink: 1 }}>
                Next: {nextNode.session.title}
              </Text>
              {nextNeedsPro ? <Tag label="Pro" icon="lock-closed" tone="accent" /> : null}
            </View>
          ) : null}
        </View>
      </Card>
    </View>
  );
}
