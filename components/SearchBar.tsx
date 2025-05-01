import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';
import { ThemedText } from './ThemedText';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function SearchBar({ onSearch, suggestions = [], placeholder = 'Search...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handleSearch = (text: string) => {
    setQuery(text);
    setShowSuggestions(true);
    onSearch(text);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearch('');
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

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
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text + '80'} />
          </TouchableOpacity>
        )}
      </View>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                onPress={() => handleSuggestionPress(item)}
              >
                <ThemedText>{item}</ThemedText>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
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
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
});
