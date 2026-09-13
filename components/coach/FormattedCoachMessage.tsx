import { View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

interface FormattedCoachMessageProps {
  message: string;
  textColor?: string;
}

type CalloutKind = 'tip' | 'caution' | 'check' | 'dog';

type Block =
  | { type: 'header'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'numbered-list'; items: string[] }
  | { type: 'callout'; kind: CalloutKind; content: string };

/**
 * The model still marks callouts with a leading emoji. The marker is used to
 * pick an icon and a title, then stripped: no emoji reaches the screen.
 */
const CALLOUT_MARKERS: { marker: string; kind: CalloutKind }[] = [
  { marker: '\u{1F4A1}', kind: 'tip' }, // light bulb
  { marker: '\u26A0\uFE0F', kind: 'caution' }, // warning sign
  { marker: '\u26A0', kind: 'caution' },
  { marker: '\u2705', kind: 'check' }, // check mark
  { marker: '\u{1F436}', kind: 'dog' }, // dog face
];

const CALLOUT_META: Record<CalloutKind, { icon: AppIconName; title: string }> = {
  tip: { icon: 'bulb-outline', title: 'Tip' },
  caution: { icon: 'warning-outline', title: 'Watch out' },
  check: { icon: 'checkmark-circle-outline', title: 'Good sign' },
  dog: { icon: 'paw-outline', title: 'About your dog' },
};

/**
 * Renders a coach message: a bold single line is a heading, "- " lines are
 * bullets, "1. " lines are a numbered list, an emoji-led block is a callout,
 * everything else is a paragraph. Inline **bold** is supported.
 */
export function FormattedCoachMessage({ message, textColor }: FormattedCoachMessageProps) {
  if (!message) return null;

  const blocks = parseMessage(message);

  return (
    <View style={{ width: '100%', gap: spacing.sm }}>
      {blocks.map((block, index) => (
        <MessageBlock key={index} block={block} textColor={textColor} />
      ))}
    </View>
  );
}

function parseMessage(text: string): Block[] {
  const rawBlocks = text.split(/\n\s*\n/);
  const blocks: Block[] = [];

  for (const rawBlock of rawBlocks) {
    const trimmedBlock = rawBlock.trim();
    if (!trimmedBlock) continue;

    if (trimmedBlock.startsWith('**') && trimmedBlock.endsWith('**') && !trimmedBlock.includes('\n')) {
      blocks.push({ type: 'header', content: trimmedBlock.slice(2, -2) });
      continue;
    }

    const callout = CALLOUT_MARKERS.find(({ marker }) => trimmedBlock.startsWith(marker));
    if (callout) {
      blocks.push({
        type: 'callout',
        kind: callout.kind,
        content: trimmedBlock.slice(callout.marker.length).trim(),
      });
      continue;
    }

    const lines = trimmedBlock.split('\n');

    if (lines.every((line) => /^[-\u2022]\s/.test(line.trim()))) {
      blocks.push({
        type: 'bullet-list',
        items: lines.map((line) => line.trim().replace(/^[-\u2022]\s*/, '')),
      });
      continue;
    }

    if (lines.every((line) => /^\d+\.\s/.test(line.trim()))) {
      blocks.push({
        type: 'numbered-list',
        items: lines.map((line) => line.trim().replace(/^\d+\.\s*/, '')),
      });
      continue;
    }

    blocks.push({ type: 'paragraph', content: trimmedBlock });
  }

  return blocks;
}

function MessageBlock({ block, textColor }: { block: Block; textColor?: string }) {
  switch (block.type) {
    case 'header':
      return (
        <Text variant="bodyStrong" color={textColor}>
          {block.content}
        </Text>
      );

    case 'callout': {
      const meta = CALLOUT_META[block.kind];
      return (
        <Card style={{ backgroundColor: colors.bg.fill, gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <AppIcon name={meta.icon} size={20} color={colors.accent} />
            <Text variant="captionStrong">{meta.title}</Text>
          </View>
          <Text variant="body" color={textColor}>
            <InlineBold text={block.content} textColor={textColor} />
          </Text>
        </Card>
      );
    }

    case 'bullet-list':
      return (
        <View style={{ gap: spacing.xs }}>
          {block.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <View
                style={{
                  width: spacing.xs,
                  height: spacing.xs,
                  borderRadius: radii.full,
                  backgroundColor: colors.accent,
                  marginTop: spacing.sm,
                }}
              />
              <Text variant="body" color={textColor} style={{ flex: 1 }}>
                <InlineBold text={item} textColor={textColor} />
              </Text>
            </View>
          ))}
        </View>
      );

    case 'numbered-list':
      return (
        <View style={{ gap: spacing.xs }}>
          {block.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <Text variant="bodyStrong" color={textColor} style={{ minWidth: spacing.xl }}>
                {i + 1}.
              </Text>
              <Text variant="body" color={textColor} style={{ flex: 1 }}>
                <InlineBold text={item} textColor={textColor} />
              </Text>
            </View>
          ))}
        </View>
      );

    case 'paragraph':
    default:
      return (
        <Text variant="body" color={textColor}>
          <InlineBold text={block.content} textColor={textColor} />
        </Text>
      );
  }
}

/** Splits on **bold** markers; bold runs render as nested bodyStrong text. */
function InlineBold({ text, textColor }: { text: string; textColor?: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={index} variant="bodyStrong" color={textColor}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </>
  );
}
