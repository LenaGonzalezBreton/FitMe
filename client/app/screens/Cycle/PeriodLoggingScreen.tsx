import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePeriods } from '../../hooks/usePeriods';
import { useCycleContext } from '../../context/CycleContext';
import { Ionicons } from '@expo/vector-icons';
import { LogPeriodRequest } from '../../types';

interface PeriodLoggingScreenProps {
  onClose?: () => void;
}

const PeriodLoggingScreen = ({ onClose }: PeriodLoggingScreenProps) => {
  const { logPeriod, loading } = usePeriods();
  const { refreshCycle } = useCycleContext();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flowIntensity, setFlowIntensity] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [isNewCycle, setIsNewCycle] = useState<boolean>(true);

  const handleLogPeriod = async () => {
    try {
      const periodData: LogPeriodRequest = {
        startDate: isNewCycle ? selectedDate.toISOString().split('T')[0] : undefined,
        flowIntensity,
        notes: notes.trim() || undefined,
        isNewCycle,
      };

      const success = await logPeriod(periodData);
      
      if (success) {
        Alert.alert(
          'Succès',
          isNewCycle 
            ? 'Votre nouveau cycle a été enregistré avec succès !'
            : 'Vos informations ont été mises à jour avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh cycle data
                refreshCycle();
                onClose?.();
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible d\'enregistrer vos règles. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error logging period:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement.');
    }
  };

  const getFlowIntensityLabel = (intensity: number): string => {
    switch (intensity) {
      case 1: return 'Très léger';
      case 2: return 'Léger';
      case 3: return 'Modéré';
      case 4: return 'Abondant';
      case 5: return 'Très abondant';
      default: return 'Modéré';
    }
  };

  const getFlowIntensityColor = (intensity: number): string => {
    switch (intensity) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-yellow-100 text-yellow-700';
      case 4: return 'bg-orange-100 text-orange-700';
      case 5: return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F5EFE6" />
      
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="mb-1 text-2xl font-bold text-brand-text">
                {isNewCycle ? 'Nouveau cycle' : 'Continuer mes règles'}
              </Text>
              <Text className="text-sm text-secondary-600">
                {isNewCycle 
                  ? 'Marquez le début de votre cycle menstruel'
                  : 'Mettez à jour vos informations quotidiennes'
                }
              </Text>
            </View>
            {onClose && (
              <TouchableOpacity
                onPress={onClose}
                className="justify-center items-center w-10 h-10 rounded-full border shadow-sm bg-surface border-border-light"
              >
                <Ionicons name="close" size={20} color="#8B5A3C" />
              </TouchableOpacity>
            )}
          </View>
        </View>
 
        <ScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cycle Type Selection */}
          <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
            <Text className="mb-3 text-lg font-bold text-brand-text">Type d'enregistrement</Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setIsNewCycle(true)}
                className={`p-3 rounded-lg border flex-row items-center ${
                  isNewCycle ? 'border-primary-500 bg-primary-50' : 'border-border-light bg-brand-background'
                }`}
              >
                <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  isNewCycle ? 'border-primary-500 bg-primary-500' : 'border-secondary-400'
                }`}>
                  {isNewCycle && <View className="w-2 h-2 bg-white rounded-full m-0.5" />}
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${
                    isNewCycle ? 'text-primary-700' : 'text-brand-text'
                  }`}>
                    Nouveau cycle (jour 1)
                  </Text>
                  <Text className="text-sm text-secondary-600">
                    Je commence un nouveau cycle menstruel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsNewCycle(false)}
                className={`p-3 rounded-lg border flex-row items-center ${
                  !isNewCycle ? 'border-primary-500 bg-primary-50' : 'border-border-light bg-brand-background'
                }`}
              >
                <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  !isNewCycle ? 'border-primary-500 bg-primary-500' : 'border-secondary-400'
                }`}>
                  {!isNewCycle && <View className="w-2 h-2 bg-white rounded-full m-0.5" />}
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${
                    !isNewCycle ? 'text-primary-700' : 'text-brand-text'
                  }`}>
                    Continuer mes règles
                  </Text>
                  <Text className="text-sm text-secondary-600">
                    Je suis déjà dans mon cycle actuel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Selection */}
          {isNewCycle && (
            <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
          <Text className="mb-4 text-lg font-bold text-brand-text">Date de début</Text>
          
          <TouchableOpacity
            className="p-4 mb-4 rounded-xl border bg-primary-50 border-primary-200"
            onPress={() => setShowDatePicker(true)}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-medium text-primary-700">
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text className="mt-1 text-sm text-primary-600">
                  {selectedDate.getTime() === new Date().getTime() 
                    ? 'Aujourd\'hui' 
                    : selectedDate.getTime() === new Date().getTime() - 24 * 60 * 60 * 1000
                    ? 'Hier'
                    : `${Math.floor((new Date().getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24))} jour(s)`
                  }
                </Text>
              </View>
              <Ionicons name="calendar" size={24} color="#8B5A3C" />
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <View className="p-4 rounded-xl bg-primary-50">
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event: any, date: any) => {
                  setShowDatePicker(false);
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                maximumDate={new Date()}
                minimumDate={new Date(2020, 0, 1)}
              />
            </View>
          )}
        </View>
          )}

          {/* Current Cycle Info */}
          {!isNewCycle && (
            <View className="p-4 mb-4 rounded-xl border bg-primary-50 border-primary-200">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#8B5A3C" />
                <Text className="ml-2 font-medium text-primary-700">Cycle en cours</Text>
              </View>
              <Text className="text-sm text-primary-600">
                Vous continuez l'enregistrement de vos règles actuelles. Les informations seront mises à jour automatiquement.
              </Text>
            </View>
          )}

          {/* Flow Intensity */}
        <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
          <Text className="mb-4 text-lg font-bold text-brand-text">Intensité du flux</Text>
          
          <View className="space-y-3">
            {[1, 2, 3, 4, 5].map((intensity) => (
              <TouchableOpacity
                key={intensity}
                onPress={() => setFlowIntensity(intensity)}
                className={`p-4 rounded-xl border-2 ${
                  flowIntensity === intensity
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-border bg-surface'
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className={`font-medium ${
                      flowIntensity === intensity ? 'text-primary-700' : 'text-brand-text'
                    }`}>
                      {getFlowIntensityLabel(intensity)}
                    </Text>
                    <Text className={`text-sm mt-1 ${
                      flowIntensity === intensity ? 'text-primary-600' : 'text-secondary-600'
                    }`}>
                      {intensity === 1 && 'Spotting, très peu de sang'}
                      {intensity === 2 && 'Flux léger, changement de protection peu fréquent'}
                      {intensity === 3 && 'Flux normal, changement toutes les 3-4 heures'}
                      {intensity === 4 && 'Flux abondant, changement toutes les 2-3 heures'}
                      {intensity === 5 && 'Flux très abondant, changement toutes les 1-2 heures'}
                    </Text>
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    flowIntensity === intensity
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-border'
                  }`}>
                    {flowIntensity === intensity && (
                      <View className="w-3 h-3 rounded-full bg-surface" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View className="p-4 mb-6 rounded-xl border shadow-sm bg-surface border-border-light">
          <Text className="mb-4 text-lg font-bold text-brand-text">Notes (optionnel)</Text>
          <TextInput
            className="p-4 rounded-xl border bg-primary-50 border-primary-200 text-brand-text min-h-24"
            placeholder="Ex: Crampes légères, fatigue, humeur irritable..."
            placeholderTextColor="#A99985"
            value={notes}
            onChangeText={setNotes}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            autoCorrect={true}
            autoCapitalize="sentences"
            returnKeyType="done"
            blurOnSubmit={true}
            style={{ 
              fontSize: 16,
              lineHeight: 22,
              minHeight: 96
            }}
          />
          <Text className="mt-2 text-xs text-secondary-500">
            Ces informations vous aideront à mieux comprendre votre cycle
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row mb-6 space-x-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 py-4 rounded-xl bg-secondary-200"
            disabled={loading}
          >
            <Text className="text-lg font-bold text-center text-secondary-700">Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogPeriod}
            className="flex-1 py-4 rounded-xl bg-primary-500"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-bold text-center text-surface">
                {isNewCycle ? 'Commencer le cycle' : 'Mettre à jour'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View className="p-4 mb-6 bg-blue-50 rounded-xl border border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="mb-1 font-medium text-blue-800">Pourquoi enregistrer ?</Text>
              <Text className="text-sm text-blue-700">
                Enregistrer vos règles nous aide à vous fournir des recommandations personnalisées 
                et à suivre votre cycle pour une meilleure compréhension de votre corps.
              </Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PeriodLoggingScreen;
