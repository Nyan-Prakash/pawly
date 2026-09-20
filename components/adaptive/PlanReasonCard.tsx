/**
 * PlanReasonCard
 *
 * Shown on plan-preview to explain why this plan was built this way.
 * Renders the planningSummary from AdaptivePlanMetadata plus a one-sentence
 * caption drawn from dog profile facts.
 */

import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { AIPlanningSummary } from '@/types';

interface PlanReasonCardProps {
  dogName: string;
  summary: AIPlanningSummary;
  /**
   * Legacy profile facts joined by a middle dot (age, home, sessions per week). Rendered as a
   * single caption sentence: "9 months old, lives in an apartment, trains
   * 3 times a week". Prefer the structured fields below when available.
   */
  profileCaption?: string;
  ageLabel?: string;
  homeType?: string;
  sessionsPerWeek?: number;
  /** Kept for call-site compatibility; the card no longer animates in. */
  delay?: number;
}

/**
 * Turn one profile fact into a clause about the dog: "9 months old" becomes
 * "is 9 months old", "Apartment" becomes "lives in an apartment", "3×/week"
 * becomes "trains 3 times a week". A fact that is already a full sentence is
 * returned unchanged and rendered on its own line.
 */
function factToClause(fact: string): { clause?: string; sentence?: string } {
  const trimmed = fact.trim();
  if (!trimmed) return {};
  if (/[.!?]$/.test(trimmed) && trimmed.includes(' ')) return { sentence: trimmed };

  const perWeek = trimmed.match(/^(\d+)\s*(?:×|x)\s*\/?\s*(?:week|wk)$/i);
  if (perWeek) return { clause: timesAWeek(Number(perWeek[1])) };

  const skills = trimmed.match(/^(\d+)\s+skills?$/i);
  if (skills) return { clause: `is working on ${skills[1]} ${Number(skills[1]) === 1 ? 'skill' : 'skills'}` };

  const lower = trimmed.toLowerCase();
  if (lower === 'apartment' || lower === 'flat') return { clause: 'lives in an apartment' };
  if (lower === 'house') return { clause: 'lives in a house' };
  if (/\b(old|weeks?|months?|years?)\b/.test(lower)) return { clause: `is ${lower}` };
  return { clause: lower };
}

function timesAWeek(n: number): string {
  return `trains ${n} ${n === 1 ? 'time' : 'times'} a week`;
}

function buildProfileLines(
  dogName: string,
  { profileCaption, ageLabel, homeType, sessionsPerWeek }: Pick<PlanReasonCardProps, 'profileCaption' | 'ageLabel' | 'homeType' | 'sessionsPerWeek'>,
): string[] {
  const clauses: string[] = [];
  const sentences: string[] = [];

  const facts: string[] = [];
  if (ageLabel) facts.push(ageLabel);
  if (homeType) facts.push(homeType);
  if (typeof sessionsPerWeek === 'number' && sessionsPerWeek > 0) clauses.push(timesAWeek(sessionsPerWeek));
  if (facts.length === 0 && clauses.length === 0 && profileCaption) {
    facts.push(...profileCaption.split(/\s*\u00B7\s*|\s*\|\s*/));
  }

  for (const fact of facts) {
    const { clause, sentence } = factToClause(fact);
    if (clause) clauses.push(clause);
    if (sentence) sentences.push(sentence);
  }

  const lines: string[] = [];
  if (clauses.length > 0) lines.push(`${dogName} ${clauses.join(', ')}.`);
  return [...lines, ...sentences];
}

export function PlanReasonCard({
  dogName,
  summary,
  profileCaption,
  ageLabel,
  homeType,
  sessionsPerWeek,
}: PlanReasonCardProps) {
  const lines: string[] = [];
  if (summary.whyThisStart) lines.push(summary.whyThisStart);
  for (const assumption of (summary.keyAssumptions ?? []).slice(0, 2)) {
    lines.push(assumption);
  }

  const profileLines = buildProfileLines(dogName, { profileCaption, ageLabel, homeType, sessionsPerWeek });

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text variant="caption" accessibilityRole="header">
        Why this plan
      </Text>

      <View style={{ gap: spacing.sm }}>
        {lines.map((line, i) => (
          <Text key={i} variant="body">
            {line}
          </Text>
        ))}
      </View>

      {profileLines.map((line) => (
        <Text key={line} variant="caption" color={colors.text.secondary}>
          {line}
        </Text>
      ))}
    </Card>
  );
}
