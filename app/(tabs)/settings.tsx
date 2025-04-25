import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    checkAuthProvider();
  }, []);

  const checkAuthProvider = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if the user logged in with Google
        const isGoogle = user.app_metadata.provider === 'google';
        setIsGoogleUser(isGoogle);
      }
    } catch (error) {
      console.error('Error checking auth provider:', error);
    }
  };

  const updateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user')
        .update({ full_name: newName.trim() })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Name updated successfully');
      setNewName('');
      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('No user found');

              // First, sign out to clear any active sessions
              await supabase.auth.signOut();

              // Delete user data from the database
              const { error: deleteError } = await supabase
                .from('user')
                .delete()
                .eq('id', user.id);

              if (deleteError) throw deleteError;

              // Delete the user's auth account
              const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
              if (authError) throw authError;

              // Clear any cached data
              await supabase.auth.signOut();
              
              // Navigate to login screen
              router.replace('/login');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again later.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        isGoogleUser && styles.centeredContent
      ]}
    >
      <View style={styles.headerContainer}>
        <Ionicons name="settings-outline" size={24} color={colors.text} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Update Name</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border 
          }]}
          placeholder="Enter new name"
          placeholderTextColor={colors.text + '80'}
          value={newName}
          onChangeText={setNewName}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={updateName}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.card }]}>Update Name</Text>
          )}
        </TouchableOpacity>
      </View>

      {!isGoogleUser && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="Current password"
            placeholderTextColor={colors.text + '80'}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="New password"
            placeholderTextColor={colors.text + '80'}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="Confirm new password"
            placeholderTextColor={colors.text + '80'}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={updatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.card }]}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#DC3545' }]}
          onPress={deleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.card }]}>Delete Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  section: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 