import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/lib/ThemeContext';

type FilterOption = 'Indoor' | 'Outdoor' | 'Both';

interface FilterTabsProps {
  selectedFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export function FilterTabs({ selectedFilter, onFilterChange }: FilterTabsProps) {
  const { colors } = useTheme();
  const filters: FilterOption[] = ['Indoor', 'Outdoor', 'Both'];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <Pressable
          key={filter}
          style={[
            styles.tab,
            { backgroundColor: colors.card },
            selectedFilter === filter && { backgroundColor: colors.primary },
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <ThemedText
            style={[
              styles.tabText,
              { color: colors.text + '80' },
              selectedFilter === filter && { color: colors.card },
            ]}
          >
            {filter}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 