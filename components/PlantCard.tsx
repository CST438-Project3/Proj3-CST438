import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface PlantCardProps {
  image: any;
  waterLevel: number;
  sunType: string;
  temperature: number;
  style?: ViewStyle;
}

export function PlantCard({ image, waterLevel, sunType, temperature, style }: PlantCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <IconSymbol name="drop.fill" size={16} color="#4A90E2" />
          <ThemedText style={styles.metricText}>{waterLevel}%</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <IconSymbol name="sun.max.fill" size={16} color="#FFB800" />
          <ThemedText style={styles.metricText}>{sunType}</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <IconSymbol name="thermometer" size={16} color="#FF4B4B" />
          <ThemedText style={styles.metricText}>{temperature}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: '#F5F5F5',
    aspectRatio: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#666666',
  },
}); 