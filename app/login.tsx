import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useTheme, Theme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showThemesMenu, setShowThemesMenu] = useState(false);
  const { theme, setTheme, colors, isSeasonalThemeEnabled, toggleSeasonalTheme } = useTheme();
  const { signInWithGoogle } = useAuth();
  const [toggleAnim] = useState(new Animated.Value(0));

  const themeOptions: { name: string; value: Theme }[] = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'Spring', value: 'spring' },
    { name: 'Summer', value: 'summer' },
    { name: 'Autumn', value: 'autumn' },
    { name: 'Winter', value: 'winter' },
  ];

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const newValue = !isSeasonalThemeEnabled;
    Animated.timing(toggleAnim, {
      toValue: newValue ? 20 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      toggleSeasonalTheme();
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setShowThemeMenu(false);
      setShowThemesMenu(false);
    }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.themeMenuContainer}>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: colors.card }]}
            onPress={() => setShowThemeMenu(!showThemeMenu)}
          >
            <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          {showThemeMenu && (
            <View style={[styles.themeDropdown, { 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }]}>
              <View style={styles.toggleContainer}>
                <View style={styles.seasonIconsContainer}>
                  <View style={styles.seasonIconsRow}>
                    <Ionicons name="flower-outline" size={14} color={colors.text} />
                    <Ionicons name="sunny-outline" size={14} color={colors.text} />
                  </View>
                  <View style={styles.seasonIconsRow}>
                    <Ionicons name="leaf-outline" size={14} color={colors.text} />
                    <Ionicons name="snow-outline" size={14} color={colors.text} />
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={handleToggle}
                  style={[
                    styles.toggleTrack,
                    { 
                      backgroundColor: isSeasonalThemeEnabled 
                        ? colors.primary 
                        : theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(0, 0, 0, 0.1)',
                      outlineWidth: 1,
                      outlineStyle: 'solid',
                      outlineColor: isSeasonalThemeEnabled 
                        ? colors.primary 
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.3)'
                          : 'rgba(0, 0, 0, 0.2)',
                      outlineOffset: 0
                    }
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: colors.card,
                        transform: [{ translateX: toggleAnim }],
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 1,
                        elevation: 2,
                      },
                    ]}
                  >
                    <Ionicons 
                      name="sync-outline" 
                      size={14} 
                      color={isSeasonalThemeEnabled ? colors.primary : colors.text + '40'} 
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity
                style={[styles.themeOption]}
                onPress={() => {
                  setShowThemeMenu(false);
                  setShowThemesMenu(true);
                }}
              >
                <Ionicons name="color-palette" size={20} color={colors.text} style={styles.themeIcon} />
                <Text style={[styles.themeOptionText, { color: colors.text }]}>Themes</Text>
              </TouchableOpacity>
            </View>
          )}

          {showThemesMenu && (
            <View style={[styles.themeDropdown, { 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }]}>
              <TouchableOpacity
                style={[styles.themeOption, theme === 'light' && { backgroundColor: colors.accent + '20' }]}
                onPress={() => { setTheme('light'); setShowThemesMenu(false); }}
              >
                <Ionicons name="sunny-outline" size={20} color={colors.text} style={styles.themeIcon} />
                <Text style={[
                  styles.themeOptionText,
                  { color: colors.text },
                  theme === 'light' && { color: colors.primary }
                ]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeOption, theme === 'dark' && { backgroundColor: colors.accent + '20' }]}
                onPress={() => { setTheme('dark'); setShowThemesMenu(false); }}
              >
                <Ionicons name="moon-outline" size={20} color={colors.text} style={styles.themeIcon} />
                <Text style={[
                  styles.themeOptionText,
                  { color: colors.text },
                  theme === 'dark' && { color: colors.primary }
                ]}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeOption, theme === 'spring' && { backgroundColor: colors.accent + '20' }]}
                onPress={() => { setTheme('spring'); setShowThemesMenu(false); }}
              >
                <Ionicons name="flower-outline" size={20} color={colors.text} style={styles.themeIcon} />
                <Text style={[
                  styles.themeOptionText,
                  { color: colors.text },
                  theme === 'spring' && { color: colors.primary }
                ]}>Spring</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeOption, theme === 'summer' && { backgroundColor: colors.accent + '20' }]}
                onPress={() => { setTheme('summer'); setShowThemesMenu(false); }}
              >
                <Ionicons name="sunny" size={20} color={colors.text} style={styles.themeIcon} />
                <Text style={[
                  styles.themeOptionText,
                  { color: colors.text },
                  theme === 'summer' && { color: colors.primary }
                ]}>Summer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeOption, theme === 'autumn' && { backgroundColor: colors.accent + '20' }]}
                onPress={() => { setTheme('autumn'); setShowThemesMenu(false); }}
              >
                <Ionicons name="leaf-outline" size={20} color={colors.text} style={styles.themeIcon} />
                <Text style={[
                  styles.themeOptionText,
                  { color: colors.text },
                  theme === 'autumn' && { color: colors.primary }
                ]}>Autumn</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeOption, theme === 'winter' && { backgroundColor: colors.accent + '20' }]}
                onPress={() => { setTheme('winter'); setShowThemesMenu(false); }}
              >
                <Ionicons name="snow-outline" size={20} color={colors.text} style={styles.themeIcon} />
                <Text style={[
                  styles.themeOptionText,
                  { color: colors.text },
                  theme === 'winter' && { color: colors.primary }
                ]}>Winter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.headerContainer}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Image 
              source={require('@/assets/images/iWetMyPlants Logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.taglineText, { color: colors.text }]}>Your personal plant care companion</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}>
            <Ionicons name="mail-outline" size={22} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.text + '80'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.text + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.forgotPasswordContainer, { alignSelf: 'center' }]}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Reset or Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="log-in-outline" size={24} color={colors.card} style={styles.buttonIcon} />
              <Text style={[styles.loginButtonText, { color: colors.card }]}>{loading ? 'Loading...' : 'Log In'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, styles.googleButton, { 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="logo-google" size={24} color="#DB4437" style={styles.buttonIcon} />
              <Text style={[styles.loginButtonText, { color: colors.text }]}>Sign in with Google</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.noAccountText, { color: colors.text }]}>Don't have an account? </Text>
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={() => router.push('/signup')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="person-add-outline" size={18} color={colors.primary} style={styles.buttonIcon} />
                <Text style={[styles.signupText, { color: colors.primary }]}>Sign Up</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  logo: {
    width: 160,
    height: 160,
  },
  taglineText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    height: 55,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#76A97F',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#76A97F',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#76A97F',
  },
  googleButtonText: {
    color: '#333333',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noAccountText: {
    color: '#666',
    fontSize: 16,
  },
  signupButton: {
    marginLeft: 5,
  },
  signupText: {
    color: '#76A97F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  themeMenuContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1000,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  themeDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 8,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  themeIcon: {
    marginRight: 10,
  },
  themeOptionText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  seasonIconsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginRight: 8,
  },
  seasonIconsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  toggleTrack: {
    width: 50,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 