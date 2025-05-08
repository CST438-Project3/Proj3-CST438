import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/lib/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground } from 'react-native';
import * as FileSystem from 'expo-file-system';
import openai from '@/lib/openai';

export default function AnalyzeScreen() {
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        setAnalysis(null); // Clear previous analysis
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        setAnalysis(null); // Clear previous analysis
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setAnalyzing(true);
      
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare the image for OpenAI
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a plant identification and care assistant. Analyze the attached plant image and provide a structured, professional report with the following sections:

Plant Species/Type:
- Scientific name
- Common names

Care Requirements:
- Light
- Water
- Temperature

Common Issues and Solutions:
- List common problems and how to address them

Growth Characteristics:
- Type
- Height
- Spread
- Flowers
- Foliage

Do NOT use markdown, headings, or conversational language. Do NOT include phrases like 'Certainly' or 'The plant in the image is...'. Present each section with a clear label, followed by bullet points or short sentences. Keep the format consistent and neutral, suitable for a care report.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      // Extract and set the analysis
      const analysisText = response.choices[0].message.content;
      setAnalysis(analysisText);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require('../../assets/images/leaf-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background + '80' }]} edges={['top']}>
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>Plant Analysis</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
              Upload a photo of your plant to get care information
            </ThemedText>
          </View>

          <ScrollView style={styles.content}>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={[styles.analyzeButton, { backgroundColor: colors.primary }]}
                  onPress={analyzeImage}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <ActivityIndicator color={colors.card} />
                  ) : (
                    <ThemedText style={[styles.buttonText, { color: colors.card }]}>
                      Analyze Plant
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadContainer}>
                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={24} color={colors.card} />
                  <ThemedText style={[styles.buttonText, { color: colors.card }]}>
                    Choose from Library
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={24} color={colors.card} />
                  <ThemedText style={[styles.buttonText, { color: colors.card }]}>
                    Take Photo
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {analysis && (
              <View style={[styles.analysisContainer, { backgroundColor: colors.card }]}>
                <ThemedText style={[styles.analysisTitle, { color: colors.text }]}>Analysis Report</ThemedText>
                {analysis.split(/\n{2,}/).map((section, idx) => {
                  const [header, ...content] = section.split('\n');
                  return (
                    <View key={idx} style={{ marginBottom: 12 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text, marginBottom: 4 }}>{header.trim()}</Text>
                      {content.join('\n').split(/\n|•|-/).filter(line => line.trim()).map((line, i) => (
                        <Text key={i} style={{ color: colors.text, marginLeft: 12, marginBottom: 2, fontSize: 15 }}>• {line.trim()}</Text>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  uploadContainer: {
    gap: 16,
    marginTop: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  analyzeButton: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 