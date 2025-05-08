import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';
import { useRouter } from 'expo-router';

interface RelatedPlantCardProps {
  id: number;
  image: any;
  title: string;
  description: string;
  price?: number; // price is optional
  waterLevel: number;
  sunType: string;
  temperature: number;
}

export function RelatedPlantCard({
  id,
  image,
  title,
  description,
  price = 0, // fallback if undefined
  waterLevel,
  sunType,
  temperature,
}: RelatedPlantCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/plantopedia/${id}`)}
    >
      <Image source={image} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
          {/* <ThemedText style={[styles.price, { color: colors.primary }]}>${price.toFixed(2)}</ThemedText> */}
        </View>
        <ThemedText style={[styles.description, { color: colors.text + '80' }]} numberOfLines={2}>
          {description}
        </ThemedText>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
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
  },
});