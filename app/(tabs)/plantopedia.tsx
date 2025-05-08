import React, { useState, useEffect } from 'react';
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
import { SearchBar } from '@/components/SearchBar';
import { usePlants, Plant } from '@/hooks/usePlants';

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
  const { plants, loading, error, searchPlants, resetSearch } = usePlants();
  
  // Reset search when screen is focused (e.g., when navigating back)
  useEffect(() => {
      resetSearch();
  }, []);

  const handleSearch = (query: string) => {
    // Search is now handled by the usePlants hook
    // This is just here to maintain interface compatibility
  };

  const handlePlantSelect = (plantId: string) => {
    router.push(`/plantopedia/${plantId}`);
  };

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity
      style={[styles.plantCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/plantopedia/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        {(item.imageUrl && item.imageUrl.endsWith('.jpg') ) ? (
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

  if (loading && plants.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && plants.length === 0) {
    return (
      <ScrollView 
        contentContainerStyle={[styles.errorContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.errorContent}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error.message}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => resetSearch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 64 }}>
        <SearchBar
          placeholder="Search plants..."
          onSearch={handleSearch}
          onPlantSelect={handlePlantSelect}
        />
      </View>
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
    paddingTop: 24,
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