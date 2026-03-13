import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { radii } from '@/constants/radii';

type PillTagVariant = 'default' | 'green' | 'gold' | 'blue' | 'muted';
type PillTagSize = 'sm' | 'md';

type PillTagProps = {
  label: string;
  variant?: PillTagVariant;
  size?: PillTagSize;
  onPress?: () => void;
};

const variantTokens: Record<PillTagVariant, { bg: string; text: string }> = {
  default: { bg: '#F5F7F9', text: '#6B7280' },
  green:   { bg: '#DCFCE7', text: '#15803D' },
  gold:    { bg: '#FEF3C7', text: '#B45309' },
  blue:    { bg: '#DBEAFE', text: '#1D4ED8' },
  muted:   { bg: '#E5E7EB', text: '#6B7280' },
};

const sizeTokens: Record<PillTagSize, { paddingH: number; paddingV: number }> = {
  sm: { paddingH: 10, paddingV: 4 },
  md: { paddingH: 12, paddingV: 6 },
};

export function PillTag({ label, variant = 'default', size = 'md', onPress }: PillTagProps) {
  const vt = variantTokens[variant];
  const st = sizeTokens[size];

  const content = (
    <View
      style={{
        backgroundColor: vt.bg,
        borderRadius: radii.pill,
        paddingHorizontal: st.paddingH,
        paddingVertical: st.paddingV,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        variant={size === 'sm' ? 'micro' : 'caption'}
        color={vt.text}
        style={{ fontWeight: '600' }}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ alignSelf: 'flex-start' }}>
        {content}
      </Pressable>
    );
  }

  return content;
}
