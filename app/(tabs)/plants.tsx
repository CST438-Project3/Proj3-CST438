import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { PlantCard } from '@/components/PlantCard';

export default function PlantsScreen() {
  // Example data - replace with your database data
  const allPlants = [
    {
      id: 1,
      image: { uri: 'https://your-database-url/plant1-image.jpg' },
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
    {
      id: 2,
      image: { uri: 'https://your-database-url/plant2-image.jpg' },
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
    // Add more plants here
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>My Plants</ThemedText>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.plantsGrid}>
            {allPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                style={styles.plantCard}
                {...plant}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 229, 229, 0.25)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  plantCard: {
    width: '47%',
  },
}); 