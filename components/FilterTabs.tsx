import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

type FilterOption = 'Indoor' | 'Outdoor' | 'Both';

interface FilterTabsProps {
  selectedFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export function FilterTabs({ selectedFilter, onFilterChange }: FilterTabsProps) {
  const filters: FilterOption[] = ['Indoor', 'Outdoor', 'Both'];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.tab,
            selectedFilter === filter && styles.selectedTab,
          ]}
          onPress={() => onFilterChange(filter)}>
          <ThemedText
            style={[
              styles.tabText,
              selectedFilter === filter && styles.selectedTabText,
            ]}>
            {filter}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedTab: {
    backgroundColor: '#7C9A72',
  },
  tabText: {
    fontSize: 14,
  },
  selectedTabText: {
    color: '#FFFFFF',
  },
}); 