import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface RelatedPlantCardProps {
  id: number;
  image: any;
  title: string;
  description: string;
  price: number;
  waterLevel: number;
  sunType: string;
  temperature: number;
}

export function RelatedPlantCard({
  image,
  title,
  description,
  price,
  waterLevel,
  sunType,
  temperature,
}: RelatedPlantCardProps) {
  return (
    <Pressable style={styles.container}>
      <Image source={image} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.price}>${price.toFixed(2)}</ThemedText>
        </View>
        <ThemedText style={styles.description} numberOfLines={2}>
          {description}
        </ThemedText>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C9A72',
  },
  description: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
  },
  infoContainer: {
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