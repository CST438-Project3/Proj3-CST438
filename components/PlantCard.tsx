import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';

interface PlantCardProps {
  id: number;
  image: any;
  waterLevel: number;
  sunType: string;
  temperature: number;
  style?: ViewStyle;
}

export function PlantCard({ image, waterLevel, sunType, temperature, style }: PlantCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, style]}>
      <Image source={image} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="water-outline" size={16} color={colors.primary} />
          <ThemedText style={[styles.infoText, { color: colors.text + '80' }]}>{waterLevel}ml</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="sunny-outline" size={16} color={colors.primary} />
          <ThemedText style={[styles.infoText, { color: colors.text + '80' }]}>{sunType}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="thermometer-outline" size={16} color={colors.primary} />
          <ThemedText style={[styles.infoText, { color: colors.text + '80' }]}>{temperature}°F</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
  },
}); 