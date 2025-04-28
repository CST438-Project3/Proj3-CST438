import React from 'react';
import { ScrollView, StyleSheet, View, ImageBackground } from 'react-native';
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
      <ImageBackground
        source={require('@/assets/images/leaf-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
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
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(248, 248, 248, 0.25)',
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