import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

const icons = {
  train: 'paw',
  progress: 'bar-chart',
  coach: 'chatbubble-ellipses',
  know: 'heart',
  profile: 'person-circle'
} as const;

type TabName = keyof typeof icons;

function TabIcon({ name, color, size }: { name: TabName; color: string; size: number }) {
  return <Ionicons name={icons[name]} color={color} size={size} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        }
      }}
    >
      <Tabs.Screen
        name="train"
        options={{
          title: 'Train',
          tabBarIcon: ({ color, size }) => <TabIcon name="train" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <TabIcon name="progress" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size }) => <TabIcon name="coach" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="know"
        options={{
          title: 'Know',
          tabBarIcon: ({ color, size }) => <TabIcon name="know" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon name="profile" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
