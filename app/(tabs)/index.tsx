import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ImageBackground, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';

import { ThemedText } from '@/components/ThemedText';
import { PlantCard } from '@/components/PlantCard';
import { RelatedPlantCard } from '@/components/RelatedPlantCard';
import { FilterTabs } from '@/components/FilterTabs';
import { Header } from '@/components/Header';

type FilterOption = 'Indoor' | 'Outdoor' | 'Both';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Indoor');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get the user's information from the users table
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }

        if (data && data.full_name) {
          setUserName(data.full_name);
        } else {
          // If no full_name exists, use email as fallback
          setUserName(user.email?.split('@')[0] || 'User');
        }
      }
    };

    fetchUser();
  }, []);

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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require('../../assets/images/leaf-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background + '80' }]} edges={['top']}>
          <Header
            name={userName}
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
                <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>My Plants</ThemedText>
                <Pressable onPress={() => router.push('/plants')}>
                  <ThemedText style={[styles.viewAll, { 
                    color: colors.primary,
                    backgroundColor: colors.card
                  }]}>View all</ThemedText>
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
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Related Plants</ThemedText>
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
  },
  viewAll: {
    fontSize: 14,
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