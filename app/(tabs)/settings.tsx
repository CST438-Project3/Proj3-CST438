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
  const { colors, theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    checkAuthProvider();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user')
          .select('username, full_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const currentUsername = data.username || '';
          setUsername(currentUsername);
          setNewUsername('');
          setNewName('');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkAuthProvider = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isGoogle = user.app_metadata.provider === 'google';
        setIsGoogleUser(isGoogle);
      }
    } catch (error) {
      console.error('Error checking auth provider:', error);
    }
  };

  const updateAccountInfo = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const updates = {};
      
      if (newUsername.trim() && newUsername.trim() !== username) {
        updates.username = newUsername.trim();
      }
      
      if (newName.trim() && newName.trim() !== newName) {
        updates.full_name = newName.trim();
      }

      if (Object.keys(updates).length === 0) {
        Alert.alert('Info', 'No changes to update');
        return;
      }

      const { error } = await supabase
        .from('user')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Account information updated successfully');
      if (updates.username) {
        setUsername(updates.username);
      }
      setNewUsername('');
      setNewName('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update account information');
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
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <Ionicons name="settings-outline" size={24} color={colors.text} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={[
        styles.cardsContainer,
        isGoogleUser && styles.googleUserCardsContainer
      ]}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Settings</Text>
          <View style={styles.themeGrid}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'light' && styles.selectedTheme,
                { borderColor: colors.border }
              ]}
              onPress={() => setTheme('light')}
            >
              <Ionicons name="sunny-outline" size={24} color={theme === 'light' ? colors.primary : colors.text} />
              <Text style={[
                styles.themeText,
                { color: theme === 'light' ? colors.primary : colors.text }
              ]}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'dark' && styles.selectedTheme,
                { borderColor: colors.border }
              ]}
              onPress={() => setTheme('dark')}
            >
              <Ionicons name="moon-outline" size={24} color={theme === 'dark' ? colors.primary : colors.text} />
              <Text style={[
                styles.themeText,
                { color: theme === 'dark' ? colors.primary : colors.text }
              ]}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'spring' && styles.selectedTheme,
                { borderColor: colors.border }
              ]}
              onPress={() => setTheme('spring')}
            >
              <Ionicons name="flower-outline" size={24} color={theme === 'spring' ? colors.primary : colors.text} />
              <Text style={[
                styles.themeText,
                { color: theme === 'spring' ? colors.primary : colors.text }
              ]}>Spring</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'summer' && styles.selectedTheme,
                { borderColor: colors.border }
              ]}
              onPress={() => setTheme('summer')}
            >
              <Ionicons name="sunny" size={24} color={theme === 'summer' ? colors.primary : colors.text} />
              <Text style={[
                styles.themeText,
                { color: theme === 'summer' ? colors.primary : colors.text }
              ]}>Summer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'autumn' && styles.selectedTheme,
                { borderColor: colors.border }
              ]}
              onPress={() => setTheme('autumn')}
            >
              <Ionicons name="leaf-outline" size={24} color={theme === 'autumn' ? colors.primary : colors.text} />
              <Text style={[
                styles.themeText,
                { color: theme === 'autumn' ? colors.primary : colors.text }
              ]}>Autumn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'winter' && styles.selectedTheme,
                { borderColor: colors.border }
              ]}
              onPress={() => setTheme('winter')}
            >
              <Ionicons name="snow-outline" size={24} color={theme === 'winter' ? colors.primary : colors.text} />
              <Text style={[
                styles.themeText,
                { color: theme === 'winter' ? colors.primary : colors.text }
              ]}>Winter</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
          
          <View style={styles.inputGroup}>
            {!isGoogleUser && (
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                placeholder="Username"
                placeholderTextColor={colors.text + '80'}
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}

            {isGoogleUser && !username && (
              <>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Set a username to make logging in easier
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border 
                  }]}
                  placeholder="Username"
                  placeholderTextColor={colors.text + '80'}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            {isGoogleUser && username && (
              <>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Current Username: {username}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border 
                  }]}
                  placeholder="Username"
                  placeholderTextColor={colors.text + '80'}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border 
              }]}
              placeholder="Name"
              placeholderTextColor={colors.text + '80'}
              value={newName}
              onChangeText={setNewName}
            />
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={updateAccountInfo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.card }]}>Update Account Info</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {!isGoogleUser && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
            <View style={styles.inputGroup}>
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
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
  },
  googleUserCardsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  section: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
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
  infoText: {
    fontSize: 16,
    textAlign: 'center',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  themeOption: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  selectedTheme: {
    backgroundColor: colors => colors.accent + '20',
    borderColor: colors => colors.primary,
  },
  themeText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
}); 