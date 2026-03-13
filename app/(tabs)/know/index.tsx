import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';

const SECTIONS = [
  {
    id: 'videos',
    emoji: 'videocam',
    title: 'My Videos',
    description: 'Your training clips and expert feedback',
    route: '/(tabs)/know/videos',
  },
] as const;

export default function KnowScreen() {
  const router = useRouter();

  return (
    <SafeScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
          }}
        >
          <Text variant="h2">Know</Text>
          <Text variant="body" color={colors.text.secondary} style={{ marginTop: 4 }}>
            Training resources and your video library.
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
          {SECTIONS.map((section) => (
            <Pressable
              key={section.id}
              onPress={() => router.push(section.route)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#DCFCE7' : colors.bg.surface,
                borderRadius: radii.md,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                borderWidth: 1,
                borderColor: pressed ? colors.brand.primary : colors.border.soft,
                ...shadows.card,
              })}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: radii.md,
                  backgroundColor: colors.bg.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AppIcon name={section.emoji as AppIconName} size={26} color={colors.text.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" color={colors.text.primary}>
                  {section.title}
                </Text>
                <Text variant="caption" color={colors.text.secondary} style={{ marginTop: 2 }}>
                  {section.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
