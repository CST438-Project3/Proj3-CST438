import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/lib/ThemeContext';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [localImagePath, setLocalImagePath] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // If there's an avatar URL, download and cache it locally
      if (data.avatar_url) {
        const fileName = `${user.id}.jpg`;
        const localPath = `${FileSystem.cacheDirectory}${fileName}`;
        
        try {
          // Check if we already have the image cached
          const fileInfo = await FileSystem.getInfoAsync(localPath);
          if (!fileInfo.exists) {
            // Download and cache the image
            const { uri } = await FileSystem.downloadAsync(
              data.avatar_url,
              localPath
            );
            setLocalImagePath(uri);
          } else {
            setLocalImagePath(localPath);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error caching avatar:', errorMessage);
          // If caching fails, just use the remote URL
          setLocalImagePath(null);
        }
      }

      setProfile(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      setShowOptions(true);
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
        aspect: [1, 1],
        quality: 0.5,
        base64: false,
        exif: false
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

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
        aspect: [1, 1],
        quality: 0.5,
        base64: false,
        exif: false
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const processAndUploadImage = async (uri: string) => {
    try {
      setUploading(true);
      console.log('Starting image upload process');

      // Get the user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First convert to JPEG if needed and resize to a smaller size
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 300, height: 300 } }
        ],
        { 
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      // Convert image to blob
      const response = await fetch(processedImage.uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileExt = 'jpg';
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // First, try to delete any existing avatar
      try {
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      } catch (error) {
        // Ignore error if no existing avatar
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile
      const { error: updateError } = await supabase
        .from('user')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state with the new avatar URL
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          avatar_url: publicUrl
        };
      });

      // Save the processed image locally
      const localPath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.copyAsync({
        from: processedImage.uri,
        to: localPath
      });
      setLocalImagePath(localPath);
      
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
      setShowOptions(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Delete the avatar from storage
      const fileExt = 'jpg';
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      try {
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      } catch (error: unknown) {
        console.log('No avatar to delete from storage');
      }

      // Update the profile to remove avatar
      const { error: updateError } = await supabase
        .from('user')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      setLocalImagePath(null);
      
      Alert.alert('Success', 'Profile picture removed!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any cached data or state
      setProfile(null);
      
      // Navigate to login screen
      router.replace('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scrollContainer, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={showImagePickerOptions}
            disabled={uploading}
          >
            {uploading ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : localImagePath ? (
              <Image
                source={{ uri: localImagePath }}
                style={styles.avatar}
                onError={(e) => {
                  console.error('Local image loading error:', e.nativeEvent.error);
                  setLocalImagePath(null);
                }}
              />
            ) : profile?.avatar_url ? (
              <Image
                source={{ 
                  uri: profile.avatar_url,
                  cache: 'reload'
                }}
                style={styles.avatar}
                onError={(e) => {
                  console.error('Remote image loading error:', e.nativeEvent.error);
                  // Clear the avatar URL to show the placeholder
                  setProfile(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      avatar_url: null
                    };
                  });
                }}
                onLoad={() => {
                  console.log('Remote image loaded successfully');
                  setUploading(false);
                }}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <Ionicons name="person" size={50} color={colors.primary} />
              </View>
            )}
            <View style={[styles.editOverlay, { backgroundColor: colors.primary, borderColor: colors.card }]}>
              {uploading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Ionicons name="camera" size={24} color={colors.card} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text }]}>{profile?.full_name || 'No name set'}</Text>
          <Text style={[styles.email, { color: colors.text + '80' }]}>{profile?.email}</Text>
          {profile?.avatar_url && (
            <TouchableOpacity 
              style={styles.removeAvatarButton}
              onPress={removeAvatar}
              disabled={uploading}
            >
              <Text style={[styles.removeAvatarText, { color: colors.accent }]}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[styles.button, { borderBottomColor: colors.border }]}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
            <Text style={[styles.buttonText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { borderBottomColor: colors.border }]}>
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.buttonText, { color: colors.text }]}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.lastButton]} onPress={signOut}>
            <Ionicons name="log-out-outline" size={24} color="#DB4437" />
            <Text style={[styles.buttonText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  lastButton: {
    borderBottomWidth: 0,
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 16,
  },
  signOutText: {
    color: '#DB4437',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  removeAvatarButton: {
    marginTop: 10,
    padding: 8,
  },
  removeAvatarText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 