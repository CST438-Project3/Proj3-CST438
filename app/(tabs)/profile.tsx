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

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function ProfileScreen() {
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
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      Alert.alert('Error', error.message);
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
      console.log('Starting image upload process...');

      // Get the user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      console.log('User found:', user.id);

      // First convert to JPEG if needed and resize to a smaller size
      console.log('Converting and resizing image...');
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
      console.log('Image processed:', processedImage.uri);

      // Convert image to blob
      console.log('Converting image to blob...');
      const response = await fetch(processedImage.uri);
      if (!response.ok) {
        console.error('Fetch response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size);

      // Upload to Supabase Storage
      const fileExt = 'jpg';
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      console.log('Preparing to upload to:', filePath);

      // First, try to delete any existing avatar
      try {
        console.log('Attempting to delete existing avatar...');
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
        console.log('Existing avatar deleted');
      } catch (error) {
        console.log('No existing avatar to delete');
      }

      console.log('Uploading new avatar...');
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      console.log('Avatar uploaded successfully');

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      console.log('Public URL generated:', publicUrl);

      // Update the profile
      console.log('Updating user profile...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      console.log('Profile updated successfully');

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
      console.error('Upload error details:', error);
      Alert.alert('Error', error.message);
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
      } catch (error) {
        console.log('No avatar to delete from storage');
      }

      // Update the profile to remove avatar
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      setLocalImagePath(null);
      
      Alert.alert('Success', 'Profile picture removed!');
    } catch (error) {
      Alert.alert('Error', error.message);
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
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#76A97F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={showImagePickerOptions}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#76A97F" />
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
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
                onError={(e) => {
                  console.error('Remote image loading error:', e.nativeEvent.error);
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
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#76A97F" />
              </View>
            )}
            <View style={styles.editOverlay}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="camera" size={24} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{profile?.full_name || 'No name set'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          {profile?.avatar_url && (
            <TouchableOpacity 
              style={styles.removeAvatarButton}
              onPress={removeAvatar}
              disabled={uploading}
            >
              <Text style={styles.removeAvatarText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="settings-outline" size={24} color="#76A97F" />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Ionicons name="help-circle-outline" size={24} color="#76A97F" />
            <Text style={styles.buttonText}>Help & Support</Text>
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
    backgroundColor: '#f2f2e5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f2f2e5',
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#76A97F',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#eee',
  },
  lastButton: {
    borderBottomWidth: 0,
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  signOutText: {
    color: '#DB4437',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#76A97F',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeAvatarButton: {
    marginTop: 10,
    padding: 8,
  },
  removeAvatarText: {
    color: '#DB4437',
    fontSize: 14,
    fontWeight: '500',
  },
}); 