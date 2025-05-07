import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';

export default function ResetPasswordCallback() {
  const router = useRouter();
  const { token_hash, type } = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (type === 'recovery' && token_hash) {
          // Redirect to update password page with the token
          router.replace({
            pathname: '/update-password',
            params: { token_hash, type }
          });
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error handling password reset callback:', error);
        router.replace('/login');
      } finally {
        WebBrowser.maybeCompleteAuthSession();
      }
    };

    handleCallback();
  }, [token_hash, type]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
} 