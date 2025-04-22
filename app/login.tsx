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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useTheme, Theme } from '@/lib/ThemeContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme, setTheme, colors } = useTheme();

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'iWetMyPlants://login-callback',
        },
      });

      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setShowThemeMenu(false);
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
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    theme === option.value && { backgroundColor: colors.accent + '20' }
                  ]}
                  onPress={() => {
                    setTheme(option.value);
                    setShowThemeMenu(false);
                  }}
                >
                  {option.value === 'light' && <Ionicons name="sunny-outline" size={20} color={colors.text} style={styles.themeIcon} />}
                  {option.value === 'dark' && <Ionicons name="moon-outline" size={20} color={colors.text} style={styles.themeIcon} />}
                  {option.value === 'spring' && <Ionicons name="flower-outline" size={20} color={colors.text} style={styles.themeIcon} />}
                  {option.value === 'summer' && <Ionicons name="sunny" size={20} color={colors.text} style={styles.themeIcon} />}
                  {option.value === 'autumn' && <Ionicons name="leaf-outline" size={20} color={colors.text} style={styles.themeIcon} />}
                  {option.value === 'winter' && <Ionicons name="snow-outline" size={20} color={colors.text} style={styles.themeIcon} />}
                  <Text style={[
                    styles.themeOptionText,
                    { color: colors.text },
                    theme === option.value && { color: colors.primary }
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
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

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
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
    alignSelf: 'flex-end',
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
}); 