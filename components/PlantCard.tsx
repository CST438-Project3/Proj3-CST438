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
  plantName?: string;
  lastWatered?: string | null;
  style?: ViewStyle;
}

function formatLastWatered(dateString: string) {
  const last = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diff === 0 ? 'Today' : `${diff} day${diff === 1 ? '' : 's'} ago`;
}

export function PlantCard({ image, waterLevel, sunType, temperature, plantName, lastWatered, style }: PlantCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, style]}>
      <Image source={image} style={styles.image} />
      
      {/* Plant Name */}
      {plantName && (
        <View style={styles.nameContainer}>
          <ThemedText style={[styles.plantName, { color: colors.text }]}>
            {plantName}
          </ThemedText>
        </View>
      )}

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

        {/* ✅ Last Watered Row */}
        {lastWatered && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <ThemedText style={[styles.infoText, { color: colors.text + '80' }]}>
              {formatLastWatered(lastWatered)}
            </ThemedText>
          </View>
        )}
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
  nameContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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