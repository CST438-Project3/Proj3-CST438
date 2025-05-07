import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ImageBackground, Pressable, Image, Alert, TouchableOpacity, Animated, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';

import { PlantCard } from '@/components/PlantCard';
import { RelatedPlantCard } from '@/components/RelatedPlantCard';
import { FilterTabs } from '@/components/FilterTabs';
import { Header } from '@/components/Header';

type FilterOption = 'Indoor' | 'Outdoor' | 'Both';

export default function HomeScreen() {
  const { colors, setTheme, theme, isSeasonalThemeEnabled, toggleSeasonalTheme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Indoor');
  const [userName, setUserName] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const [toggleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get the user's information from the user table
        const { data, error } = await supabase
          .from('user')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error fetching user:', errorMessage);
          return;
        }

        if (data?.full_name) {
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

  const handleToggle = () => {
    const newValue = !isSeasonalThemeEnabled;
    Animated.timing(toggleAnim, {
      toValue: newValue ? 20 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      toggleSeasonalTheme();
    });
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
            onMenuPress={() => {
              setShowMenu(!showMenu);
            }}
            onSharePress={() => {
              Alert.alert('Share', 'Share this app with your friends!');
            }}
          />
          
          {showMenu && (
            <View style={[styles.menuDropdown, { 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }]}>
              <View style={styles.toggleContainer}>
                <View style={styles.seasonIconsContainer}>
                  <View style={styles.seasonIconsRow}>
                    <Ionicons name="flower-outline" size={14} color={colors.text} />
                    <Ionicons name="sunny-outline" size={14} color={colors.text} />
                  </View>
                  <View style={styles.seasonIconsRow}>
                    <Ionicons name="leaf-outline" size={14} color={colors.text} />
                    <Ionicons name="snow-outline" size={14} color={colors.text} />
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={handleToggle}
                  style={[
                    styles.toggleTrack,
                    { 
                      backgroundColor: isSeasonalThemeEnabled 
                        ? colors.primary 
                        : theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(0, 0, 0, 0.1)',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: isSeasonalThemeEnabled 
                        ? colors.primary 
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.3)'
                          : 'rgba(0, 0, 0, 0.2)'
                    }
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: colors.card,
                        transform: [{ translateX: toggleAnim }],
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 1,
                        elevation: 2,
                      },
                    ]}
                  >
                    <Ionicons 
                      name="sync-outline" 
                      size={14} 
                      color={isSeasonalThemeEnabled ? colors.primary : colors.text + '40'} 
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.menuItem, { 
                  borderTopColor: colors.border,
                  borderTopWidth: 1,
                  padding: 10,
                }]}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/add-plant');
                }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="add-circle-outline" size={14} color={colors.primary} style={styles.buttonIcon} />
                  <Ionicons name="flower-outline" size={14} color={colors.primary} style={styles.buttonIcon} />
                  <Text style={[styles.menuItemText, { color: colors.text, fontSize: 14 }]}>Add Plants</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

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
  header: {
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  menuDropdown: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 8,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    zIndex: 1000,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  seasonIconsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginRight: 8,
  },
  seasonIconsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  toggleTrack: {
    width: 50,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
});