import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
        <Pressable
          key={filter}
          style={[
            styles.tab,
            selectedFilter === filter && styles.selectedTab,
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <ThemedText
            style={[
              styles.tabText,
              selectedFilter === filter && styles.selectedTabText,
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: '#7C9A72',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 