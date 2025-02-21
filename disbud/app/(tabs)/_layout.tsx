import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Emergency',
          tabBarLabel: 'Emergency',
        }}
      />
    </Tabs>
  );
} 