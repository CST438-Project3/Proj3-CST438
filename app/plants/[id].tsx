import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import { ThemedText } from '@/components/ThemedText';

export default function PlantDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastWatered, setLastWatered] = useState<string | null>(null);

  const fetchPlant = async () => {
    const { data, error } = await supabase
      .from('plant')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) setPlant(data);
    else console.error('Error fetching plant details:', error);

    setLoading(false);
  };

  const fetchLastWatered = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('collection')
      .select('lastWatered')
      .eq('userId', user.id)
      .eq('plantId', id)
      .single();

    if (!error && data) setLastWatered(data.lastWatered);
  };

  const handleRemovePlant = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('collection')
      .delete()
      .eq('userId', user.id)
      .eq('plantId', id);

    if (error) {
      console.error('Failed to remove plant from collection', error);
      return;
    }

    router.replace('/plants');
  };

  const handleWaterNow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('collection')
      .update({ lastWatered: new Date().toISOString() })
      .eq('userId', user.id)
      .eq('plantId', id);

    if (!error) setLastWatered(new Date().toISOString());
  };

  useEffect(() => {
    if (id) {
      fetchPlant();
      fetchLastWatered();
    }
  }, [id]);

  const getWateringRange = () => {
    const min = plant?.minPrecip;
    const max = plant?.maxPrecip;
    if (!min || !max) return null;

    const mmToLiters = (mm: number) => Math.round(mm * 0.05 * 100) / 100;
    const minL = mmToLiters(Math.round(min / 52));
    const maxL = mmToLiters(Math.round(max / 52));

    return `${minL}–${maxL} L per week`;
  };

  const getNextWaterDate = () => {
    if (!lastWatered) return null;
    const last = new Date(lastWatered);
    last.setDate(last.getDate() + 7); // always 1 week later
    return last.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  const getReadableLight = (value: number) => {
    if (value <= 3) return "Low light (2–4 hours/day)";
    if (value <= 6) return "Medium light (4–6 hours/day)";
    return "High light (6–12 hours/day)";
  };
  
  const getWindowPlacement = (value: number) => {
    if (value <= 3) return "🌑 Place near a north-facing window or shaded area.";
    if (value <= 6) return "🌥 Bright, indirect light—east or west window is ideal.";
    return "☀️ Needs strong sun—south-facing window or outdoor spot.";
  };

  const getTempTip = (min: number, max: number) => {
    if (min < 10) return "🧊 This plant may need extra warmth indoors.";
    if (max > 35) return "🔥 Keep away from extreme heat or direct sunlight.";
    return "🌡️ This plant thrives in average indoor conditions.";
  };

  const formatLastWatered = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Plant not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require('../../assets/images/leaf-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background + 'CC' }]} edges={['top']}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Image 
                  source={require('@/assets/images/iWetMyPlants Logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <ThemedText style={[styles.title, { color: colors.text }]}>Plant Details</ThemedText>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {plant.imageUrl && (
                <Image source={{ uri: plant.imageUrl }} style={styles.image} />
              )}
              <ThemedText style={[styles.name, { color: colors.text }]}>
                {plant.plantName}
              </ThemedText>

              {plant.scientificName && (
                <Text style={styles.italicText}>
                  <Ionicons name="book-outline" size={16} /> <Text style={{ fontStyle: 'italic' }}>{plant.scientificName}</Text>
                </Text>
              )}

              {plant.duration && (
                <View style={styles.iconRow}>
                    <Ionicons name="hourglass-outline" size={18} color={colors.text} />
                    <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Duration: {plant.duration.charAt(0).toUpperCase() + plant.duration.slice(1)}
                    </Text>
                </View>
)}              
                {plant.growthRate && (
                <View style={styles.iconRow}>
                    <Ionicons name="leaf-outline" size={18} color={colors.text} />
                    <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Growth Rate: {plant.growthRate.charAt(0).toUpperCase() + plant.growthRate.slice(1)}
                    </Text>
                </View>
                )}
                <View style={styles.divider} />
                
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Watering Tips</Text>
                            
              {getWateringRange() && (
                <View style={styles.iconRow}>
                  <Ionicons name="water-outline" size={18} color={colors.text} />
                  <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                     {getWateringRange()} per square meter of soil
                  </Text>
                </View>
              )}

              {lastWatered && (
                <View style={styles.iconRow}>
                  <Ionicons name="time-outline" size={18} color={colors.text} />
                  <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Last Watered: {formatLastWatered(lastWatered)}
                  </Text>
                </View>
              )}

                {getNextWaterDate() && (
                <View style={styles.iconRow}>
                    <Ionicons name="calendar-outline" size={18} color={colors.text} />
                    <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Water Next: {getNextWaterDate()}
                    </Text>
                </View>
                )}

            <TouchableOpacity onPress={handleWaterNow} style={styles.waterButton}>
                <Text style={styles.waterButtonText}>💧 Water Now</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
                
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Lighting Tips</Text>
            <View style={styles.iconRow}>
                <Ionicons name="sunny-outline" size={18} color={colors.text} />
                <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                  Light: {plant.light}/10
                </Text>
              </View>
            {plant.light && (
            <>
                <View style={styles.iconRow}>
                <Ionicons name="sunny-outline" size={18} color={colors.text} />
                <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    {getReadableLight(plant.light)}
                </Text>
                </View>
                <Text style={[styles.tipText, { color: colors.text + 'CC' }]}>
                {getWindowPlacement(plant.light)}
                </Text>
            </>
            )}
            <View style={styles.divider} />
                
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Temperature Tips</Text>
            <View style={styles.iconRow}>
            <Ionicons name="thermometer-outline" size={18} color={colors.text} />
            <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                Temp: {plant.minTemp}–{plant.maxTemp}°C
            </Text>
            </View>

            <Text style={[styles.tipText, { color: colors.text + 'CC' }]}>
                {getTempTip(plant.minTemp, plant.maxTemp)}
            </Text>

            <Text style={[styles.tipText, { color: colors.text + 'CC' }]}>
                Want to check suitability? Add your room temperature in Settings.
            </Text>
            
            <View style={styles.divider} />
              <TouchableOpacity onPress={handleRemovePlant} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove from My Plants</Text>
              </TouchableOpacity>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red' },
  header: { padding: 16, borderBottomWidth: 1 },
  backButton: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoContainer: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  logo: { width: 36, height: 36 },
  title: { fontSize: 24, fontWeight: '600' },
  scrollContent: { padding: 16, alignItems: 'center' },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    marginVertical: 8,
    opacity: 0.6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'center',
  },
  tipText: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 26,
  },
  italicText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    color: '#666',
    alignSelf: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  detailText: {
    fontSize: 16,
  },
  removeButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  waterButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  waterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});