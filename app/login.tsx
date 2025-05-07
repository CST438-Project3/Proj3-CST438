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
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';

export default function LoginScreen() {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // First, try to find the user by username
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('email')
        .eq('username', loginIdentifier)
        .single();

      let emailToUse = loginIdentifier;
      
      // If we found a user by username, use their email
      if (userData && !userError) {
        emailToUse = userData.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
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
          <Text style={[styles.taglineText, { color: colors.text }]}>Your personal plant care companion</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}>
            <Ionicons name="person-outline" size={22} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Username or Email"
              placeholderTextColor={colors.text + '80'}
              value={loginIdentifier}
              onChangeText={setLoginIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
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

          <View style={styles.loginContainer}>
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

          <TouchableOpacity 
            style={[styles.forgotPasswordContainer, { alignSelf: 'center', marginTop: 20 }]}
            onPress={() => router.push('/reset-password')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="key-outline" size={18} color={colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.footerContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.plantIconsContainer}>
            <Ionicons 
              name="beaker-outline" 
              size={28} 
              color={colors.primary} 
              style={{ 
                transform: [
                  { rotate: '135deg' },
                  { scaleX: -1 }
                ] 
              }} 
            />
            <Ionicons 
              name="water" 
              size={32} 
              color={colors.primary} 
            />
            <Ionicons 
              name="flower-outline" 
              size={28} 
              color={colors.primary} 
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

type StylesType = {
  container: ViewStyle;
  headerContainer: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  taglineText: TextStyle;
  formContainer: ViewStyle;
  inputContainer: ViewStyle;
  inputIcon: TextStyle;
  input: TextStyle;
  eyeIcon: ViewStyle;
  loginButton: ViewStyle;
  buttonContent: ViewStyle;
  buttonIcon: TextStyle;
  loginButtonText: TextStyle;
  googleButton: ViewStyle;
  googleButtonText: TextStyle;
  loginContainer: ViewStyle;
  noAccountText: TextStyle;
  signupButton: ViewStyle;
  signupText: TextStyle;
  forgotPasswordContainer: ViewStyle;
  forgotPasswordText: TextStyle;
  footerContainer: ViewStyle;
  plantIconsContainer: ViewStyle;
};

const styles = StyleSheet.create<StylesType>({
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
  loginContainer: {
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
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#76A97F',
    fontWeight: '600',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  plantIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
}); 