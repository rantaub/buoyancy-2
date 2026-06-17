import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0c0a09',
          borderTopColor: '#292524',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#78716c',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Identify',
          tabBarIcon: ({ color, size }) => <Ionicons name="scan-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="findings"
        options={{
          title: 'Findings',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="subscribe"
        options={{
          title: 'Premium',
          tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
