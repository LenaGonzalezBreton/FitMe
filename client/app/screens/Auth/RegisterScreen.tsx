import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

interface RegisterScreenProps {
    navigation: NavigationProp<any, any>;
}

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !firstName) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
    }
    setIsLoading(true);
    try {
        const response = await api.post('/auth/register', {
            email: email.toLowerCase().trim(),
            password,
            firstName,
        });
        
        // Store registration data for onboarding completion
        const { user, tokens } = response.data;
        
        // Store tokens and user data temporarily for onboarding
        await SecureStore.setItemAsync('tempAccessToken', tokens.accessToken);
        await SecureStore.setItemAsync('tempRefreshToken', tokens.refreshToken);
        await SecureStore.setItemAsync('tempUser', JSON.stringify(user));
        
        // Navigate to onboarding with the user data
        await login(user, tokens.accessToken, tokens.refreshToken);
        
    } catch (error: any) {
        const message = error.response?.data?.message || 'Une erreur est survenue.';
        Alert.alert("Erreur d'inscription", message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="px-8">
            <Text className="text-3xl font-bold text-brand-text text-center mb-12">
              Créer un compte
            </Text>

            <View className="space-y-6">
              <TextInput
                className="bg-surface p-4 rounded-xl text-lg text-brand-text"
                placeholder="Prénom"
                placeholderTextColor="#A99985"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <TextInput
                className="bg-surface p-4 rounded-xl text-lg text-brand-text"
                placeholder="Entrez votre e-mail"
                placeholderTextColor="#A99985"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                className="bg-surface p-4 rounded-xl text-lg text-brand-text"
                placeholder="Créez un mot de passe (8+ caractères)"
                placeholderTextColor="#A99985"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className="bg-surface mt-8 py-4 rounded-xl"
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-brand-text text-center font-bold text-lg">
                  S'inscrire
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="mt-4" 
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text className="text-brand-text text-center underline">
                J'ai déjà un compte
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen; 