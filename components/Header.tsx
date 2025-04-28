import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';

interface HeaderProps {
  name: string;
  greeting: string;
  onMenuPress?: () => void;
  onSharePress?: () => void;
}

export function Header({ name, greeting, onMenuPress, onSharePress }: HeaderProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.button}>
        <IconSymbol name="line.3.horizontal" size={24} color="#333333" />
      </TouchableOpacity>
      
      <View style={styles.greetingContainer}>
        <ThemedText style={styles.name}>Hi {name}!</ThemedText>
        <ThemedText style={styles.greeting}>{greeting}</ThemedText>
      </View>

      <TouchableOpacity onPress={onSharePress} style={styles.button}>
        <IconSymbol name="square.and.arrow.up" size={24} color="#333333" />
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
}); 