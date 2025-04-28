import { TextStyle, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  return (
    <ThemedView style={$titleContainer}>
      <ThemedText type={'title'} style={$titleText}>iWetMyPlants</ThemedText>
      <ThemedText type='subtitle' style={$subText}>Keep your plants healthy and thriving without forgetting their care needs!</ThemedText>
    </ThemedView>
  );
}

const $titleContainer: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
};

const $titleText: TextStyle = {
  marginBottom: 20,
}

const $subText: TextStyle = {
  fontSize: 16,
  textAlign: 'center',
  paddingHorizontal: 20,
};