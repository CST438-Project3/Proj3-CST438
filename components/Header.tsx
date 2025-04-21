import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  name: string;
  greeting: string;
  onMenuPress: () => void;
  onSharePress: () => void;
}

export function Header({ name, greeting, onMenuPress, onSharePress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <ThemedText style={styles.greeting}>{greeting}</ThemedText>
        <ThemedText style={styles.name}>{name}</ThemedText>
      </View>
      <View style={styles.iconsContainer}>
        <Pressable onPress={onSharePress} style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color="#333333" />
        </Pressable>
        <Pressable onPress={onMenuPress} style={styles.iconButton}>
          <Ionicons name="menu-outline" size={24} color="#333333" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666666',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
}); 