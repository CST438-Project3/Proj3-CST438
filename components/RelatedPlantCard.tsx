import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface RelatedPlantCardProps {
  image: any;
  title: string;
  description: string;
  price: number;
  waterLevel: number;
  sunType: string;
  temperature: number;
  onPress?: () => void;
}

export function RelatedPlantCard({
  image,
  title,
  description,
  price,
  waterLevel,
  sunType,
  temperature,
  onPress,
}: RelatedPlantCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.description} numberOfLines={1}>
            {description}
          </ThemedText>
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
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>£{price.toFixed(2)}</ThemedText>
          </View>
        </View>
        <View style={styles.imageWrapper}>
          <Image source={image} style={styles.image} resizeMode="cover" />
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <IconSymbol name="heart" size={24} color="#999999" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  priceContainer: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C9A72',
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
}); 