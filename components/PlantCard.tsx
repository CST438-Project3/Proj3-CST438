import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface PlantCardProps {
  id: number;
  image: any;
  waterLevel: number;
  sunType: string;
  temperature: number;
  style?: ViewStyle;
}

export function PlantCard({ image, waterLevel, sunType, temperature, style }: PlantCardProps) {
  return (
    <View style={[styles.container, style]}>
      <Image source={image} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="water-outline" size={16} color="#7C9A72" />
          <ThemedText style={styles.infoText}>{waterLevel}ml</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="sunny-outline" size={16} color="#7C9A72" />
          <ThemedText style={styles.infoText}>{sunType}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="thermometer-outline" size={16} color="#7C9A72" />
          <ThemedText style={styles.infoText}>{temperature}°F</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
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
    color: '#666666',
  },
}); 