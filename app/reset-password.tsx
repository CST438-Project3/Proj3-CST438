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

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/reset-password-callback`
      });
      
      if (error) throw error;

      Alert.alert(
        'Password Reset Link Sent',
        'Please check your email for the password reset link. You will need to open the link on the same device where the app is installed.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
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
          <Text style={[styles.title, { color: colors.primary }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Enter your email address and we'll send you a link to reset your password
          </Text>
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

          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: colors.primary }]} 
            onPress={handleSendCode}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="mail-outline" size={24} color={colors.card} style={styles.buttonIcon} />
              <Text style={[styles.resetButtonText, { color: colors.card }]}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="arrow-back-outline" size={18} color={colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.backButtonText, { color: colors.primary }]}>Back to Login</Text>
            </View>
          </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    height: 55,
    marginBottom: 20,
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
  resetButton: {
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
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 