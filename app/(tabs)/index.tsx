import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  Alert,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
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
import { FlatList} from 'react-native';

type FilterOption = 'Indoor' | 'Outdoor' | 'Both';

export default function HomeScreen() {
  const { colors, isSeasonalThemeEnabled, toggleSeasonalTheme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Indoor');
  const [userName, setUserName] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const [toggleAnim] = useState(new Animated.Value(0));
  const [userPlants, setUserPlants] = useState<any[]>([]);
  const [relatedPlants, setRelatedPlants] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndPlants = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase.from('user').select('full_name').eq('id', user.id).single();
        setUserName(userData?.full_name || user.email?.split('@')[0] || 'User');

        const { data: collection } = await supabase
          .from('collection')
          .select('*, plant(*)')
          .eq('userId', user.id);

        setUserPlants(collection || []);

        const firstPlant = collection?.[0]?.plant;
        if (firstPlant) {
          const { data: related } = await supabase
            .from('plant')
            .select('*')
            .neq('id', firstPlant.id)
            .gte('light', firstPlant.light - 2)
            .lte('light', firstPlant.light + 2)
            .limit(4);
          setRelatedPlants(related || []);
        }
      }
    };

    fetchUserAndPlants();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggle = () => {
    Animated.timing(toggleAnim, {
      toValue: !isSeasonalThemeEnabled ? 20 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => toggleSeasonalTheme());
  };

  // ✅ Filter based on selected tab using light level
  const filteredPlants = userPlants.filter(({ plant }) => {
    if (selectedFilter === 'Indoor') return plant.light <= 6;
    if (selectedFilter === 'Outdoor') return plant.light > 6;
    return true; // Both
  });

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
            onMenuPress={() => setShowMenu(!showMenu)}
            onSharePress={() => Alert.alert('Share', 'Share this app with your friends!')}
          />

          {showMenu && (
            <View style={[styles.menuDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* ... seasonal toggle and menu content ... */}
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
         
            <FilterTabs selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>My Plants</ThemedText>
                <Pressable onPress={() => router.push('/plants')}>
                  <ThemedText style={[styles.viewAll, {
                    color: colors.primary,
                    backgroundColor: colors.card,
                  }]}>View all</ThemedText>
                </Pressable>
              </View>

              <View style={styles.plantsGrid}>
              {filteredPlants.map(({ id: collectionId, plant }) => (
                <PlantCard
                  key={collectionId}
                  id={plant.id}
                  plantName={plant.common_name}
                  image={{ uri: plant.imageUrl }}
                  waterLevel={Math.round(plant.minPrecip / 52)}
                  sunType={plant.light}
                  temperature={plant.maxTemp}
                />
              ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Related Plants</ThemedText>
              {relatedPlants.map((plant) => (
                <RelatedPlantCard
                  key={plant.id}
                  id={plant.id}
                  image={{ uri: plant.imageUrl }}
                  title={plant.common_name}
                  description={plant.scientific_name}
                  waterLevel={Math.round(plant.minPrecip / 52)}
                  sunType={plant.light}
                  temperature={plant.maxTemp}
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