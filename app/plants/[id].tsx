import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function PlantDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastWatered, setLastWatered] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchPlant = async () => {
    const { data, error } = await supabase
      .from('plant')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) setPlant(data);
    else console.error('Error fetching plant details:', error);

    setLoading(false);
  };

  const fetchLastWatered = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('collection')
      .select('lastWatered, userImagePath, notes')
      .eq('userId', user.id)
      .eq('plantId', id)
      .single();

    if (!error && data) {
      setLastWatered(data.lastWatered);
      
      // Load user notes if available
      if (data.notes) {
        setNotes(data.notes);
      }
      
      // If user has uploaded an image previously, fetch it
      if (data.userImagePath) {
        fetchUserImage(data.userImagePath);
      }
    }
  };

  const fetchUserImage = async (imagePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('plants')
        .createSignedUrl(imagePath, 60 * 60); // 1 hour expiry
      
      if (error) throw error;
      setUserImage(data.signedUrl);
    } catch (error) {
      console.error('Error fetching user image:', error);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        uploadImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to use your camera');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        uploadImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (base64Image: string) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to upload images');
        setUploading(false);
        return;
      }

      // Create unique filename
      const fileName = `${user.id}-plant-${id}-${Date.now()}.jpg`;
      const filePath = `user-plants/${fileName}`;
      
      // Convert base64 to ArrayBuffer for Supabase storage
      const arrayBuffer = decode(base64Image);
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('plants')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      
      if (uploadError) throw uploadError;

      // Update collection record with the image path
      const { error: updateError } = await supabase
        .from('collection')
        .update({ userImagePath: filePath })
        .eq('userId', user.id)
        .eq('plantId', id);
      
      if (updateError) throw updateError;

      // Get the public URL
      const { data } = await supabase.storage
        .from('plants')
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
      
      if (data) {
        setUserImage(data.signedUrl);
        Alert.alert('Success', 'Your plant photo was uploaded!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload failed', error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePlant = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('collection')
      .delete()
      .eq('userId', user.id)
      .eq('plantId', id);

    if (error) {
      console.error('Failed to remove plant from collection', error);
      return;
    }

    router.replace('/plants');
  };

  const handleWaterNow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('collection')
      .update({ lastWatered: new Date().toISOString() })
      .eq('userId', user.id)
      .eq('plantId', id);

    if (!error) setLastWatered(new Date().toISOString());
  };
  
  const saveNotes = async () => {
    try {
      setSavingNotes(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to save notes');
        setSavingNotes(false);
        return;
      }

      const { error } = await supabase
        .from('collection')
        .update({ notes: notes })
        .eq('userId', user.id)
        .eq('plantId', id);
      
      if (error) throw error;
      
      setEditingNotes(false);
      Alert.alert('Success', 'Your notes have been saved!');
    } catch (error: any) {
      console.error('Error saving notes:', error);
      Alert.alert('Save failed', error.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRemoveUserImage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the current image path
      const { data } = await supabase
        .from('collection')
        .select('userImagePath')
        .eq('userId', user.id)
        .eq('plantId', id)
        .single();

      if (data?.userImagePath) {
        // Remove from storage
        await supabase.storage
          .from('plants')
          .remove([data.userImagePath]);

        // Update collection record
        await supabase
          .from('collection')
          .update({ userImagePath: null })
          .eq('userId', user.id)
          .eq('plantId', id);

        setUserImage(null);
        Alert.alert('Success', 'Your plant photo was removed');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      Alert.alert('Error', 'Failed to remove image');
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlant();
      fetchLastWatered();
    }
  }, [id]);

  const getWateringRange = () => {
    const min = plant?.minPrecip;
    const max = plant?.maxPrecip;
    if (!min || !max) return null;

    const mmToLiters = (mm: number) => Math.round(mm * 0.05 * 100) / 100;
    const minL = mmToLiters(Math.round(min / 52));
    const maxL = mmToLiters(Math.round(max / 52));

    return `${minL}–${maxL} L per week`;
  };

  const getNextWaterDate = () => {
    if (!lastWatered) return null;
    const last = new Date(lastWatered);
    last.setDate(last.getDate() + 7); // always 1 week later
    return last.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  const getReadableLight = (value: number) => {
    if (value <= 3) return "Low light (2–4 hours/day)";
    if (value <= 6) return "Medium light (4–6 hours/day)";
    return "High light (6–12 hours/day)";
  };
  
  const getWindowPlacement = (value: number) => {
    if (value <= 3) return "🌑 Place near a north-facing window or shaded area.";
    if (value <= 6) return "🌥 Bright, indirect light—east or west window is ideal.";
    return "☀️ Needs strong sun—south-facing window or outdoor spot.";
  };

  const getTempTip = (min: number, max: number) => {
    if (min < 10) return "🧊 This plant may need extra warmth indoors.";
    if (max > 35) return "🔥 Keep away from extreme heat or direct sunlight.";
    return "🌡️ This plant thrives in average indoor conditions.";
  };

  const formatLastWatered = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Plant not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require('../../assets/images/leaf-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background + 'CC' }]} edges={['top']}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Image 
                  source={require('@/assets/images/iWetMyPlants Logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <ThemedText style={[styles.title, { color: colors.text }]}>Plant Details</ThemedText>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {userImage ? (
                <View style={styles.userImageContainer}>
                  <Image source={{ uri: userImage }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={handleRemoveUserImage}
                  >
                    <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : plant.imageUrl ? (
                <Image source={{ uri: plant.imageUrl }} style={styles.image} />
              ) : null}

              <View style={styles.photoButtonsContainer}>
                <TouchableOpacity
                  style={[styles.photoButton, { backgroundColor: colors.primary }]}
                  onPress={pickImage}
                  disabled={uploading}
                >
                  <Ionicons name="images-outline" size={20} color="white" />
                  <Text style={styles.photoButtonText}>Choose Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.photoButton, { backgroundColor: colors.primary }]}
                  onPress={takePhoto}
                  disabled={uploading}
                >
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>

              {uploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8 }}>Uploading...</Text>
                </View>
              )}
              
              <ThemedText style={[styles.name, { color: colors.text }]}>
                {plant.plantName}
              </ThemedText>

              {plant.scientificName && (
                <Text style={styles.italicText}>
                  <Ionicons name="book-outline" size={16} /> <Text style={{ fontStyle: 'italic' }}>{plant.scientificName}</Text>
                </Text>
              )}

              {plant.duration && (
                <View style={styles.iconRow}>
                    <Ionicons name="hourglass-outline" size={18} color={colors.text} />
                    <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Duration: {plant.duration.charAt(0).toUpperCase() + plant.duration.slice(1)}
                    </Text>
                </View>
              )}              

                {plant.growthRate && (
                <View style={styles.iconRow}>
                    <Ionicons name="leaf-outline" size={18} color={colors.text} />
                    <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Growth Rate: {plant.growthRate.charAt(0).toUpperCase() + plant.growthRate.slice(1)}
                    </Text>
                </View>
                )}
                <View style={styles.divider} />
                
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Watering Tips</Text>
                            
              {getWateringRange() && (
                <View style={styles.iconRow}>
                  <Ionicons name="water-outline" size={18} color={colors.text} />
                  <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                     {getWateringRange()} per square meter of soil
                  </Text>
                </View>
              )}

              {lastWatered && (
                <View style={styles.iconRow}>
                  <Ionicons name="time-outline" size={18} color={colors.text} />
                  <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Last Watered: {formatLastWatered(lastWatered)}
                  </Text>
                </View>
              )}

                {getNextWaterDate() && (
                <View style={styles.iconRow}>
                    <Ionicons name="calendar-outline" size={18} color={colors.text} />
                    <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    Water Next: {getNextWaterDate()}
                    </Text>
                </View>
                )}

            <TouchableOpacity onPress={handleWaterNow} style={styles.waterButton}>
                <Text style={styles.waterButtonText}>💧 Water Now</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
                
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Lighting Tips</Text>
            <View style={styles.iconRow}>
                <Ionicons name="sunny-outline" size={18} color={colors.text} />
                <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                  Light: {plant.light}/10
                </Text>
              </View>
            {plant.light && (
            <>
                <View style={styles.iconRow}>
                <Ionicons name="sunny-outline" size={18} color={colors.text} />
                <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                    {getReadableLight(plant.light)}
                </Text>
                </View>
                <Text style={[styles.tipText, { color: colors.text + 'CC' }]}>
                {getWindowPlacement(plant.light)}
                </Text>
            </>
            )}
            <View style={styles.divider} />
                
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Temperature Tips</Text>
            <View style={styles.iconRow}>
            <Ionicons name="thermometer-outline" size={18} color={colors.text} />
            <Text style={[styles.detailText, { color: colors.text + 'CC' }]}>
                Temp: {plant.minTemp}–{plant.maxTemp}°C
            </Text>
            </View>

            <Text style={[styles.tipText, { color: colors.text + 'CC' }]}>
                {getTempTip(plant.minTemp, plant.maxTemp)}
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={[styles.sectionHeader, { color: colors.text }]}>My Notes</Text>
            
            {editingNotes ? (
              <View style={styles.notesEditContainer}>
                <TextInput
                  style={[styles.notesInput, { borderColor: colors.border, color: colors.text }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add your notes about this plant..."
                  placeholderTextColor={colors.text + '80'}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <View style={styles.notesButtons}>
                  <TouchableOpacity 
                    style={[styles.noteButton, styles.cancelButton]} 
                    onPress={() => {
                      Keyboard.dismiss(); 
                      setEditingNotes(false);
                    }}
                  >
                    <Text style={styles.noteButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.noteButton, styles.saveButton, savingNotes && { opacity: 0.7 }]} 
                    onPress={saveNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.noteButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.notesContainer}>
                <Text style={[styles.notesText, { color: colors.text + 'CC' }]}>
                  {notes ? notes : "No notes added yet. Tap Edit to add your notes."}
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.editNotesButton, 
                    { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]} 
                  onPress={() => setEditingNotes(true)}
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  <Text style={[styles.editNotesText, { color: colors.primary }]}>
                    {notes ? "Edit Notes" : "Add Notes"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.divider} />
              <TouchableOpacity onPress={handleRemovePlant} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove from My Plants</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          </SafeAreaView>
        </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red' },
  header: { padding: 16, borderBottomWidth: 1 },
  backButton: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoContainer: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  logo: { width: 36, height: 36 },
  title: { fontSize: 24, fontWeight: '600' },
  scrollContent: { padding: 16, alignItems: 'center' },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    marginVertical: 8,
    opacity: 0.6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  userImageContainer: {
    width: '100%',
    position: 'relative',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 14,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  photoButtonText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'center',
  },
  tipText: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 26,
  },
  italicText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    color: '#666',
    alignSelf: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  detailText: {
    fontSize: 16,
  },
  removeButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  waterButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  waterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notesContainer: {
    width: '100%',
    minHeight: 100,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  notesEditContainer: {
    width: '100%',
  },
  notesInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  notesButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  noteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  noteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  editNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  editNotesText: {
    fontSize: 14,
    fontWeight: '500',
  },
});