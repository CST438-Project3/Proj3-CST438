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
  Animated,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useTheme } from '@/lib/ThemeContext';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);
      
      // First check if username already exists
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('user')
        .select('username')
        .eq('username', username.trim())
        .single();

      if (existingUser) {
        Alert.alert(
          'Username Taken',
          'This username is already in use. Please choose a different username.',
          [
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
        setLoading(false);
        return;
      }

      // Then try to sign up
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://aoybkwggbrkmrgubmccp.supabase.co/auth/v1/callback',
          data: {
            full_name: fullName.trim(),
            username: username.trim()
          }
        },
      });

      if (signUpError) {
        const errorMessage = signUpError instanceof Error ? signUpError.message : 'Unknown error';
        console.error('Signup error:', errorMessage);
        
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('taken')) {
          Alert.alert(
            'Email Already Registered',
            'An account with this email already exists.',
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
        } else {
          Alert.alert('Error', errorMessage);
        }
        return;
      }

      if (user) {
        const { error: updateError } = await supabase
          .from('user')
          .update({ 
            username: username.trim(),
            full_name: fullName.trim()
          })
          .eq('id', user.id);

        if (updateError) {
          if (updateError.message.toLowerCase().includes('username') && updateError.message.toLowerCase().includes('unique')) {
            Alert.alert(
              'Username Taken',
              'This username was just taken. Please choose a different username.',
              [
                {
                  text: 'OK',
                  style: 'default'
                }
              ]
            );
            // Delete the created auth user since we couldn't set the username
            await supabase.auth.admin.deleteUser(user.id);
            return;
          }
          throw updateError;
        }
      }

      Alert.alert(
        'Success',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
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
              placeholder="Username"
              placeholderTextColor={colors.text + '80'}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}>
            <Ionicons name="person-outline" size={22} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.text + '80'}
              value={fullName}
              onChangeText={setFullName}
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