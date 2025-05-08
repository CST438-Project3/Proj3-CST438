import React, { useEffect, useState } from 'react';
import {
View,
Text,
StyleSheet,
FlatList,
Image,
ActivityIndicator,
TouchableOpacity,
ScrollView,
Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

type Plant = {
id: string;
plantName: string;
imageUrl: string | null;
};

const handleAddPlant = async (plant: Plant) => {
try {
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error("User not authenticated");

const { error } = await supabase.from('collection').insert({
  userId: user.id,
  plantId: plant.id,
});

if (error) {
  console.error("Failed to add plant:", error);
  alert("Something went wrong while adding the plant.");
} else {
  alert(`${plant.plantName} added to your collection!`);
}
} catch (err) {
console.error("Error:", err);
alert("Something went wrong.");
}
};

const capitalizeWords = (str: string) => {
return str.split(' ').map(word => 
word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
).join(' ');
};

export default function PlantopediaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plant')
        .select('*')
        .order('plantName');

      if (error) throw error;
      setPlants(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plants');
    } finally {
      setLoading(false);
    }
  };

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity
      style={[styles.plantCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/plantopedia/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.plantImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.plantImage, { backgroundColor: colors.border }]} />
        )}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => handleAddPlant(item)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={[styles.plantName, { color: colors.text }]}>
        {capitalizeWords(item.plantName)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView 
        contentContainerStyle={[styles.errorContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.errorContent}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchPlants}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
    <FlatList
      data={plants}
      renderItem={renderPlantItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
    listContent: {
    padding: 16,
    paddingTop: 64,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  plantCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
    imageContainer: {
    position: 'relative',
  },
    plantImage: {
    width: '100%',
    height: 150,
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  plantName: {
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 