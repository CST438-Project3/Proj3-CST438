import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ImageBackground, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';

import { supabase } from '@/lib/supabase';

import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { FilterTabs } from '@/components/FilterTabs';
import { PlantCard } from '@/components/PlantCard';
import { RelatedPlantCard } from '@/components/RelatedPlantCard';

type FilterOption = 'Indoor' | 'Outdoor' | 'Both';

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Indoor');

  const myPlants = [
    {
      id: 1,
      image: require('../../assets/images/plant1.png'),
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
    {
      id: 2,
      image: require('../../assets/images/plant2.png'),
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
  ];

  const relatedPlants = [
    {
      id: 1,
      image: require('../../assets/images/plant3.png'),
      title: 'Alberiya garden plant',
      description: 'Plants are predominantly...',
      price: 25.55,
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
    {
      id: 2,
      image: require('../../assets/images/plant4.png'),
      title: 'Alberiya garden plant',
      description: 'Plants are predominantly...',
      price: 25.55,
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../assets/images/leaf-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header
            name="Hani"
            greeting={getGreeting()}
            onMenuPress={() => {}}
            onSharePress={() => {}}
          />
          
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <FilterTabs
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>My Plants</ThemedText>
                <Pressable onPress={() => router.push('/plants')}>
                  <ThemedText style={styles.viewAll}>View all</ThemedText>
                </Pressable>
              </View>

              <View style={styles.plantsGrid}>
                {myPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    style={styles.plantCard}
                    {...plant}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Related Plants</ThemedText>
              {relatedPlants.map((plant) => (
                <RelatedPlantCard
                  key={plant.id}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  viewAll: {
    color: '#7C9A72',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  plantsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  plantCard: {
    flex: 1,
  },
});