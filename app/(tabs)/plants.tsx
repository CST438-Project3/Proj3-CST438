import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { PlantCard } from '@/components/PlantCard';
import { useTheme } from '@/lib/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useIsFocused} from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function PlantsScreen() {
  const { colors } = useTheme();
  const [myPlants, setMyPlants] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const router = useRouter();

  const fetchMyPlants = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('collection')
      .select('id, plantId, plant:plantId (imageUrl, plantName, minTemp, maxTemp, light)')
      .eq('userId', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setMyPlants(data);
    else console.error('Failed to load user plants', error);
  };

  useEffect(() => {
    if (isFocused) {
      fetchMyPlants();
    }
  }, [isFocused]);

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
              {myPlants.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.plantCard}
                  onPress={() => router.push(`/plants/${entry.plantId}`)}
                >
                  <PlantCard
                    id={entry.id}
                    image={{ uri: entry.plant?.imageUrl }}
                    waterLevel={500} // placeholder for now
                    sunType={entry.plant?.light?.toString() || 'medium'}
                    temperature={parseInt(entry.plant?.maxTemp) || 25}
                    plantName={entry.plant?.plantName}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoContainer: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  logo: { width: 36, height: 36 },
  title: { fontSize: 24, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  plantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  plantCard: { width: '47%' },
});