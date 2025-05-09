import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';
import { ThemedText } from './ThemedText';
import { usePlants, Plant } from '@/hooks/usePlants';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  onPlantSelect?: (plantId: string) => void;
}

export function SearchBar({ onSearch, placeholder = 'Search plants...', onPlantSelect }: SearchBarProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const { plants, loading, searchPlants, resetSearch, currentQuery } = usePlants();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [query, setQuery] = useState(currentQuery);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Update query whenever currentQuery changes (e.g., on navigation)
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchPlants(searchQuery);
      setIsTyping(false);
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 200); // Reduced debounce time for more responsive filtering
  }, [searchPlants, onSearch]);

  const handleSearch = (text: string) => {
    setQuery(text);
    setIsTyping(true);
    setShowSuggestions(true);
    debouncedSearch(text);
  };

  const handleSuggestionPress = (plantId: string) => {
    setShowSuggestions(false);
    onPlantSelect?.(plantId);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    resetSearch();
    if (onSearch) {
      onSearch('');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '80'}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => setShowSuggestions(true)}
        />
        {(loading || isTyping) ? (
          <ActivityIndicator color={colors.primary} style={styles.loadingIndicator} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text + '80'} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {showSuggestions && query.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {loading || isTyping ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <ThemedText style={[styles.loadingText, { color: colors.text + '80' }]}>
                Searching plants...
              </ThemedText>
            </View>
          ) : plants.length > 0 ? (
            <FlatList
              data={plants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSuggestionPress(item.id)}
                >
                  <View style={styles.suggestionContent}>
                    <ThemedText style={styles.plantName}>{item.plantName}</ThemedText>
                    <ThemedText style={[styles.scientificName, { color: colors.text + '80' }]}>
                      {item.scientificName || ''}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <ThemedText style={[styles.noResultsText, { color: colors.text + '80' }]}>
                No plants found
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  loadingIndicator: {
    padding: 5,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },
  noResultsContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
  },
});