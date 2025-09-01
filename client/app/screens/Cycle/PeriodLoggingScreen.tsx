import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePeriods } from '../../hooks/usePeriods';
import { useCycle } from '../../hooks/useCycle';
import { Ionicons } from '@expo/vector-icons';
import { LogPeriodRequest } from '../../types';

interface PeriodLoggingScreenProps {
  onClose?: () => void;
}

const PeriodLoggingScreen = ({ onClose }: PeriodLoggingScreenProps) => {
  const { logPeriod, loading } = usePeriods();
  const { refreshPhase } = useCycle();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flowIntensity, setFlowIntensity] = useState<number>(3); // Default medium
  const [notes, setNotes] = useState('');

  const handleLogPeriod = async () => {
    try {
      const startDate = selectedDate.toISOString().split('T')[0];
      
      const periodData: LogPeriodRequest = {
        startDate,
        flowIntensity,
        notes: notes.trim() || undefined,
      };

      const success = await logPeriod(periodData);
      
      if (success) {
        Alert.alert(
          'Succès',
          'Vos règles ont été enregistrées avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh cycle phase data
                refreshPhase();
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
      
      {/* Header */}
      <View className="px-4 pt-4 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-brand-text mb-1">Enregistrer mes règles</Text>
            <Text className="text-sm text-secondary-600">
              Marquez le début de votre cycle menstruel
            </Text>
          </View>
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="bg-surface rounded-full w-10 h-10 items-center justify-center shadow-sm border border-border-light"
            >
              <Ionicons name="close" size={20} color="#8B5A3C" />
            </TouchableOpacity>
          )}
        </View>
      </View>
 
              <View className="flex-1 px-4">
        {/* Date Selection */}
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
          <Text className="text-lg font-bold text-brand-text mb-4">Date de début</Text>
          
          <TouchableOpacity
            className="bg-primary-50 border border-primary-200 p-4 rounded-xl mb-4"
            onPress={() => setShowDatePicker(true)}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-primary-700 font-medium">
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text className="text-primary-600 text-sm mt-1">
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
            <View className="bg-primary-50 rounded-xl p-4">
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

        {/* Flow Intensity */}
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
          <Text className="text-lg font-bold text-brand-text mb-4">Intensité du flux</Text>
          
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
                <View className="flex-row items-center justify-between">
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
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-6">
          <Text className="text-lg font-bold text-brand-text mb-4">Notes (optionnel)</Text>
          <View className="bg-primary-50 border border-primary-200 p-4 rounded-xl">
            <Text className="text-primary-600 text-sm">
              Ajoutez des notes sur votre cycle : symptômes, humeur, douleurs, etc.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3 mb-6">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-secondary-200 py-4 rounded-xl"
            disabled={loading}
          >
            <Text className="text-secondary-700 font-bold text-center text-lg">Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogPeriod}
            className="flex-1 bg-primary-500 py-4 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-surface font-bold text-center text-lg">Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-medium mb-1">Pourquoi enregistrer ?</Text>
              <Text className="text-blue-700 text-sm">
                Enregistrer vos règles nous aide à vous fournir des recommandations personnalisées 
                et à suivre votre cycle pour une meilleure compréhension de votre corps.
              </Text>
            </View>
          </View>
        </View>
              </View>
    </SafeAreaView>
  );
};

export default PeriodLoggingScreen;
