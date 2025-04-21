import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

type PlantCardProps = {
  id: number;
  image: { uri: string };
  waterLevel: number;
  sunType: string;
  temperature: number;
  style?: ViewStyle;
};

export function PlantCard({ image, waterLevel, sunType, temperature, style }: PlantCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Image source={image} style={styles.image} />
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold">Water Level: {waterLevel}%</ThemedText>
        <ThemedText type="default">Sun Type: {sunType}</ThemedText>
        <ThemedText type="default">Temperature: {temperature}°F</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 12,
  },
}); 