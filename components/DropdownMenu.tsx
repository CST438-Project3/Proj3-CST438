import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/lib/ThemeContext';

interface DropdownMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string) => void;
}

export function DropdownMenu({ isVisible, onClose, onSelectTheme }: DropdownMenuProps) {
  const { colors } = useTheme();
  const [animation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (!isVisible) return null;

  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Spring', value: 'spring' },
    { label: 'Summer', value: 'summer' },
    { label: 'Autumn', value: 'autumn' },
    { label: 'Winter', value: 'winter' },
  ];

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: animation,
          transform: [{ scale: animation }]
        }
      ]}
    >
      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            { borderBottomColor: colors.border }
          ]}
          onPress={() => {
            onSelectTheme(option.value);
            onClose();
          }}
        >
          <ThemedText style={[styles.optionText, { color: colors.text }]}>
            {option.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 150,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
}); 