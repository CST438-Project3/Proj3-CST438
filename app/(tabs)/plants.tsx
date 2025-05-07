import React from 'react';

import { ScrollView, StyleSheet, View, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { PlantCard } from '@/components/PlantCard';
import { useTheme } from '@/lib/ThemeContext';

export default function PlantsScreen() {
  const { colors } = useTheme();

  // Example data - replace with your database data
  const allPlants = [
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
    {
      id: 3,
      image: require('../../assets/images/plant3.png'),
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
    {
      id: 4,
      image: require('../../assets/images/plant4.png'),
      waterLevel: 125,
      sunType: 'Sunny',
      temperature: 90,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require('../../assets/images/leaf-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background + '80' }]} edges={['top']}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Image 
                  source={require('@/assets/images/iWetMyPlants Logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <ThemedText style={[styles.title, { color: colors.text }]}>My Plants</ThemedText>
            </View>
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
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logo: {
    width: 36,
    height: 36,
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