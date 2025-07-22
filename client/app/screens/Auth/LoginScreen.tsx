import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import api from '../../services/api';

interface LoginScreenProps {
  navigation: NavigationProp<any, any>;
}

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      const { user, tokens } = response.data;
      await login(user, tokens.accessToken);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue.';
      Alert.alert("Erreur de connexion", message);
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
          <View className="pt-24 px-8">
            <Text className="text-3xl font-bold text-brand-text text-center mb-12">
              Bienvenue jeune go muscu, prêt à t'entrainer ?
            </Text>

            <View className="space-y-6">
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
                placeholder="Entrez votre mot de passe"
                placeholderTextColor="#A99985"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity className="mt-4">
              <Text className="text-brand-text text-center underline">
                Oups j'ai oublié mon mot de passe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface mt-8 py-4 rounded-xl"
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-brand-text text-center font-bold text-lg">
                  Poussez !
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-4"
                onPress={() => navigation.navigate('Register')}
                disabled={isLoading}
            >
                <Text className="text-brand-text text-center underline">
                    Pas de compte ? Créez-en un !
                </Text>
            </TouchableOpacity>
          </View>

          <View className="items-center pb-8">
            <Image
              source={require('../../../assets/logo.png')}
              className="w-48 h-48"
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen; 