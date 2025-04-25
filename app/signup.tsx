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
import { useTheme } from '@/lib/ThemeContext';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting signup process');
      
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://aoybkwggbrkmrgubmccp.supabase.co/auth/v1/callback',
          data: {
            full_name: firstName.trim()
          }
        },
      });

      if (signUpError) {
        const errorMessage = signUpError instanceof Error ? signUpError.message : 'Unknown error';
        console.error('Signup error:', errorMessage);
        
        if (errorMessage.includes('already registered')) {
          Alert.alert(
            'Account Exists',
            'An account with this email already exists. Please try logging in instead.',
            [
              {
                text: 'Go to Login',
                onPress: () => router.replace('/login')
              },
              {
                text: 'Try Different Email',
                style: 'cancel'
              }
            ]
          );
          return;
        }
        throw signUpError;
      }

      if (user) {
        console.log('User created successfully');
        Alert.alert(
          'Account Created',
          'Your account has been created. Please check your email (including spam folder) for the verification link. If you don\'t receive it within a few minutes, try logging in to request a new verification email.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
      } else {
        console.log('Account creation in progress');
        Alert.alert(
          'Signup Status',
          'Your account creation is being processed. Please check your email for verification instructions.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Signup process error:', errorMessage);
      
      Alert.alert(
        'Error',
        errorMessage === 'User already registered'
          ? 'This email is already registered. Please try logging in instead.'
          : `Signup error: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'iWetMyPlants://login-callback',
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Image 
              source={require('@/assets/images/iWetMyPlants Logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.welcomeText, { color: colors.primary }]}>Create Account</Text>
          <Text style={[styles.taglineText, { color: colors.text }]}>Join our plant-loving community</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}>
            <Ionicons name="person-outline" size={22} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="First Name"
              placeholderTextColor={colors.text + '80'}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

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

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.text + '80'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.signupButton, { backgroundColor: colors.primary }]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="person-add-outline" size={24} color={colors.card} style={styles.buttonIcon} />
              <Text style={[styles.signupButtonText, { color: colors.card }]}>{loading ? 'Loading...' : 'Sign Up'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.googleButton, { 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }]}
            onPress={handleGoogleSignUp}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="logo-google" size={24} color="#DB4437" style={styles.buttonIcon} />
              <Text style={[styles.googleButtonText, { color: colors.text }]}>Sign in with Google</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.haveAccountText, { color: colors.text }]}>Already have an account? </Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="log-in-outline" size={18} color={colors.primary} style={styles.buttonIcon} />
                <Text style={[styles.loginText, { color: colors.primary }]}>Log In</Text>
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
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
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  signupButton: {
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
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButton: {
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  haveAccountText: {
    fontSize: 16,
  },
  loginButton: {
    marginLeft: 5,
  },
  loginText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 