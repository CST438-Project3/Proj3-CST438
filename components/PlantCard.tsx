import { View, Text, Image, StyleSheet, ImageSourcePropType, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/lib/ThemeContext';

interface PlantCardProps {
  id: string;
  plantName: string;
  image: ImageSourcePropType;
  waterLevel?: number;
  sunType?: number;
  temperature?: number;
  lastWatered?: string;
  style?: ViewStyle;
}

export function PlantCard({
  plantName,
  image,
  waterLevel,
  sunType,
  temperature,
  lastWatered,
  style,
}: PlantCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, style]}>
      <Image source={image} style={styles.image} />

      <ThemedText type="subtitle" style={{ marginTop: 8, marginHorizontal: 12 }}>
        {plantName}
      </ThemedText>

      <View style={styles.infoContainer}>
        {waterLevel !== undefined && (
          <View style={styles.statBox}>
            <Text style={[styles.statText, { color: colors.text + 'CC' }]}>💧 {waterLevel}</Text>
          </View>
        )}
        {sunType !== undefined && (
          <View style={styles.statBox}>
            <Text style={[styles.statText, { color: colors.text + 'CC' }]}>☀️ {sunType}</Text>
          </View>
        )}
        {temperature !== undefined && (
          <View style={styles.statBox}>
            <Text style={[styles.statText, { color: colors.text + 'CC' }]}>🌡️ {temperature}°</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
});