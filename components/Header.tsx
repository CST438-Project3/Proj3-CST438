import React from 'react';

import { View, StyleSheet, Pressable, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';

interface HeaderProps {
  name: string;
  greeting: string;
  onMenuPress: () => void;
  onSharePress: () => void;
}

export function Header({ name, greeting, onMenuPress, onSharePress }: HeaderProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Image 
            source={require('@/assets/images/iWetMyPlants Logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.greetingContainer}>
          <ThemedText style={[styles.greeting, { color: colors.text + '80' }]}>{greeting}</ThemedText>
          <ThemedText style={[styles.name, { color: colors.text }]}>{name}</ThemedText>
        </View>
      </View>
      <View style={styles.iconsContainer}>
        <Pressable onPress={onMenuPress} style={styles.iconButton}>
          <Ionicons name="menu-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={onSharePress} style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logo: {
    width: 36,
    height: 36,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
}); 