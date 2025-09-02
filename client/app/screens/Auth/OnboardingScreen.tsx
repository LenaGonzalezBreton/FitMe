import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import api, { cycleApi } from '../../services/api';

// Enums to match backend, with keys matching the values for reverse mapping
const ObjectiveType: { [key: string]: string } = {
  WEIGHT_LOSS: 'Perte de poids',
  MUSCLE_GAIN: 'Prise de masse',
  ENDURANCE: 'Endurance',
  STRENGTH: 'Force',
  FLEXIBILITY: 'Flexibilité',
  GENERAL_FITNESS: 'Fitness général',
  STRESS_REDUCTION: 'Réduction du stress',
  ENERGY_BOOST: 'Gain d’énergie',
};

const ExperienceLevel: { [key: string]: string } = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
};

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const { login, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for temporary input values to avoid re-renders
  const tempCycleLength = useRef<string>('');
  const tempPeriodLength = useRef<string>('');
  
  // State for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Refs for input focus management
  const cycleLengthRef = useRef<TextInput>(null);
  const periodLengthRef = useRef<TextInput>(null);
  
  const [formData, setFormData] = useState({
    objectives: ['GENERAL_FITNESS'] as string[], // Changed to array for multiple selection
    experienceLevel: 'BEGINNER',
    isMenopausal: null as boolean | null,
    averageCycleLength: '28',
    averagePeriodLength: '5',
    // New cycle tracking fields
    cycleTrackingEnabled: false,
    lastPeriodDate: '',
  });

  const totalSteps = formData.isMenopausal ? 3 : 5; // Added cycle tracking step

  const handleNext = () => {
    // Basic validation before going to next step
    if (step === 1 && formData.objectives.length === 0) {
      Alert.alert('Oups !', 'Veuillez choisir au moins un objectif.');
      return;
    }
    if (step === 2 && !formData.experienceLevel) {
      Alert.alert('Oups !', 'Veuillez choisir votre niveau.');
      return;
    }
    if (step === 3 && formData.isMenopausal === null) {
      Alert.alert('Oups !', 'Veuillez répondre à cette question.');
      return;
    }

    if (step === 3 && formData.isMenopausal) {
      // If menopausal, skip cycle tracking steps and submit
      handleSubmit();
    } else if (step === 4 && formData.isMenopausal === false) {
      // Validate basic cycle details step
      if (!formData.averageCycleLength || !formData.averagePeriodLength) {
        Alert.alert('Oups !', 'Veuillez remplir les informations de cycle.');
        return;
      }
      setStep(step + 1);
    } else if (step === 5 && formData.isMenopausal === false) {
      // Validate cycle tracking step and submit
      if (formData.cycleTrackingEnabled && !formData.lastPeriodDate) {
        Alert.alert('Oups !', 'Veuillez sélectionner la date de vos dernières règles ou désactiver le suivi.');
        return;
      }
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Erreur', 'Token d\'authentification manquant. Veuillez vous reconnecter.');
      return;
    }

    setIsLoading(true);
    try {
      // First, complete the basic onboarding (send averages if applicable)
      const onboardingPayload: any = {
        objective: (formData.objectives && formData.objectives.length > 0)
          ? formData.objectives[0]
          : 'GENERAL_FITNESS',
        experienceLevel: formData.experienceLevel,
        isMenopausal: formData.isMenopausal,
      };

      if (formData.isMenopausal === false) {
        // Capture final values from temp refs if they exist
        const finalCycleLength = tempCycleLength.current || formData.averageCycleLength;
        const finalPeriodLength = tempPeriodLength.current || formData.averagePeriodLength;
        
        onboardingPayload.averageCycleLength = parseInt(finalCycleLength, 10);
        onboardingPayload.averagePeriodLength = parseInt(finalPeriodLength, 10);
        
      }

      const response = await api.post('/auth/onboarding', onboardingPayload);
      
      if (response.data.success) {
        // The backend returns the updated user object with onboardingCompleted: true
        const updatedUser = response.data.user;
        
        if (__DEV__) {
          console.log('Onboarding completed - Updated user:', {
            id: updatedUser.id,
            email: updatedUser.email,
            onboardingCompleted: updatedUser.onboardingCompleted
          });
        }
        
        // Ensure onboardingCompleted is set to true
        const userWithCompletedOnboarding = {
          ...updatedUser,
          onboardingCompleted: true
        };
        
        // Update the user in context with the completed onboarding data
        await login(userWithCompletedOnboarding, token, token); // Using token for both access and refresh
        
        // If not menopausal and user provided last period date, log the period
        if (!formData.isMenopausal && formData.cycleTrackingEnabled && formData.lastPeriodDate) {
          try {
            const [day, month, year] = formData.lastPeriodDate.split('/');
            // Create date object and ensure it's in the correct format for the server
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            
            // Ensure the date is not in the future
            const today = new Date();
            if (dateObj > today) {
              console.warn('Last period date is in the future, adjusting to today');
              dateObj.setTime(today.getTime());
            }
            
            // Format as ISO date string (YYYY-MM-DD) in local timezone
            const startDate = dateObj.getFullYear() + '-' + 
                              String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(dateObj.getDate()).padStart(2, '0');
            
            if (__DEV__) {
              console.log('Logging period with date:', {
                original: formData.lastPeriodDate,
                parsed: startDate,
                dateObj: dateObj.toISOString()
              });
            }
            
            await cycleApi.logPeriod({
              startDate,
              flowIntensity: 3,
              notes: `Période initiale configurée lors de l'onboarding`
            });
          } catch (periodError) {
            console.warn('Failed to log initial period:', periodError);
          }
        }
        
        // Clear any temporary storage
        await SecureStore.deleteItemAsync('tempAccessToken');
        await SecureStore.deleteItemAsync('tempRefreshToken');
        await SecureStore.deleteItemAsync('tempUser');
        
        if (__DEV__) {
          console.log('Onboarding flow completed successfully - User should now go to main app');
        }
        
      } else {
        Alert.alert('Erreur', response.data.message || 'Une erreur est survenue.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue lors de la soumission.';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return formData.isMenopausal === false ? <Step4 /> : null;
      case 5:
        return formData.isMenopausal === false ? <Step5 /> : null;
      default:
        return <Step1 />;
    }
  };

  const Option = React.memo(({ label, value, selectedValue, onSelect, isMultiple = false }: any) => {
    const isSelected = isMultiple 
      ? selectedValue.includes(value)
      : selectedValue === value;
    
    const handlePress = () => {
      if (isMultiple) {
        const newSelection = selectedValue.includes(value)
          ? selectedValue.filter((item: string) => item !== value)
          : [...selectedValue, value];
        onSelect(newSelection);
      } else {
        onSelect(value);
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        className={`border rounded-xl p-4 mb-3 ${
          isSelected
            ? 'bg-primary-500 border-primary-500'
            : 'bg-surface border-border'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-lg font-semibold flex-1 ${
              isSelected ? 'text-surface' : 'text-brand-text'
            }`}
          >
            {label}
          </Text>
          {isMultiple && isSelected && (
            <Text className="text-surface text-xl ml-2">✓</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  });

  const Step1 = React.memo(() => {
    const handleObjectiveSelect = React.useCallback((val: any) => {
      setFormData(prev => ({ ...prev, objectives: val }));
    }, []);

    const objectiveEntries = Object.entries(ObjectiveType);

    const renderObjective = ({ item }: { item: [string, string] }) => {
      const [key, value] = item;
      return (
        <Option
          key={key}
          label={value}
          value={key}
          selectedValue={formData.objectives}
          onSelect={handleObjectiveSelect}
          isMultiple={true}
        />
      );
    };

    return (
      <View className="flex-1">
        <Text className="text-2xl font-bold text-center mb-4">
          Quels sont vos objectifs ?
        </Text>
        <Text className="text-base text-secondary-600 text-center mb-6">
          Sélectionnez tous ceux qui vous correspondent
        </Text>
        <FlatList
          data={objectiveEntries}
          renderItem={renderObjective}
          keyExtractor={(item) => item[0]}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    );
  });

  const Step2 = React.memo(() => {
    const handleExperienceSelect = React.useCallback((val: any) => {
      setFormData(prev => ({ ...prev, experienceLevel: val }));
    }, []);

    return (
      <View className="flex-1">
        <Text className="text-2xl font-bold text-center mb-8">
          Quel est votre niveau d'expérience ?
        </Text>
        <View className="flex-1">
          {Object.entries(ExperienceLevel).map(([key, value]) => (
            <Option
              key={key}
              label={value}
              value={key}
              selectedValue={formData.experienceLevel}
              onSelect={handleExperienceSelect}
            />
          ))}
        </View>
      </View>
    );
  });

  const Step3 = React.memo(() => {
    const handleMenopauseSelect = React.useCallback((val: any) => {
      setFormData(prev => ({ ...prev, isMenopausal: val }));
    }, []);

    return (
      <View className="flex-1">
        <Text className="text-2xl font-bold text-center mb-8">
          Êtes-vous en période de ménopause ?
        </Text>
        <View className="flex-1">
          <Option
            label="Oui"
            value={true}
            selectedValue={formData.isMenopausal}
            onSelect={handleMenopauseSelect}
          />
          <Option
            label="Non"
            value={false}
            selectedValue={formData.isMenopausal}
            onSelect={handleMenopauseSelect}
          />
        </View>
      </View>
    );
  });

  const Step4 = () => (
    <View className="flex-1">
      <Text className="text-2xl font-bold text-center mb-8">
        Quelques détails sur votre cycle
      </Text>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-brand-text mb-2">Durée moyenne de votre cycle (en jours)</Text>
        <TextInput
          ref={cycleLengthRef}
          className="bg-surface border border-border p-4 rounded-xl text-lg text-brand-text mb-6"
          placeholder="Ex: 28"
          placeholderTextColor="#A99985"
          keyboardType="number-pad"
          defaultValue={formData.averageCycleLength}
          onChangeText={(val) => {
            tempCycleLength.current = val;
          }}
          onEndEditing={() => {
            setFormData(prev => ({ ...prev, averageCycleLength: tempCycleLength.current || prev.averageCycleLength }));
          }}
          onSubmitEditing={() => {
            periodLengthRef.current?.focus();
          }}
          maxLength={2}
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
          selectTextOnFocus={false}
          caretHidden={false}
          returnKeyType="next"
        />
        <Text className="text-lg font-semibold text-brand-text mb-2">Durée moyenne de vos règles (en jours)</Text>
        <TextInput
          ref={periodLengthRef}
          className="bg-surface border border-border p-4 rounded-xl text-lg text-brand-text"
          placeholder="Ex: 5"
          placeholderTextColor="#A99985"
          keyboardType="number-pad"
          defaultValue={formData.averagePeriodLength}
          onChangeText={(val) => {
            tempPeriodLength.current = val;
          }}
          onEndEditing={() => {
            setFormData(prev => ({ ...prev, averagePeriodLength: tempPeriodLength.current || prev.averagePeriodLength }));
          }}
          maxLength={2}
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
          selectTextOnFocus={false}
          caretHidden={false}
          returnKeyType="done"
        />
      </View>
    </View>
  );

  const Step5 = React.memo(() => {
    const handleCycleTrackingSelect = React.useCallback((val: any) => {
      setFormData(prev => ({ ...prev, cycleTrackingEnabled: val }));
    }, []);

    return (
      <View className="flex-1">
        <Text className="text-2xl font-bold text-center mb-4">
          Suivi de votre cycle
        </Text>
        <Text className="text-base text-secondary-600 text-center mb-6">
          Voulez-vous activer le suivi de votre cycle pour des recommandations personnalisées ?
        </Text>
        <View 
          className="flex-1"






        >
          <Option
            label="Oui, activer le suivi"
            value={true}
            selectedValue={formData.cycleTrackingEnabled}
            onSelect={handleCycleTrackingSelect}
          />
          <Option
            label="Non, pas maintenant"
            value={false}
            selectedValue={formData.cycleTrackingEnabled}
            onSelect={handleCycleTrackingSelect}
          />

        {formData.cycleTrackingEnabled && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-brand-text mb-2">Date de vos dernières règles</Text>
            <TouchableOpacity
              className="bg-primary-50 border border-primary-200 p-4 rounded-xl"
              onPress={() => setShowDatePicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-primary-700 font-medium">
                    {formData.lastPeriodDate 
                      ? new Date(formData.lastPeriodDate.split('/').reverse().join('-')).toLocaleDateString('fr-FR', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : 'Sélectionner une date'
                    }
                  </Text>
                  {formData.lastPeriodDate && (
                    <Text className="text-primary-600 text-sm mt-1">
                      {(() => {
                        const selectedDate = new Date(formData.lastPeriodDate.split('/').reverse().join('-'));
                        const today = new Date();
                        const diffTime = Math.abs(today.getTime() - selectedDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 0) return "Aujourd'hui";
                        if (diffDays === 1) return "Hier";
                        return `Il y a ${diffDays} jours`;
                      })()}
                    </Text>
                  )}
                </View>
                <Text className="text-primary-600">📅</Text>
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
                      // Format date as DD/MM/YYYY for backend
                      const day = date.getDate().toString().padStart(2, '0');
                      const month = (date.getMonth() + 1).toString().padStart(2, '0');
                      const year = date.getFullYear().toString();
                      const formattedDate = `${day}/${month}/${year}`;
                      setFormData(prev => ({ ...prev, lastPeriodDate: formattedDate }));
                    }
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
    );
  });
  
  const ProgressBar = () => (
      <View className="flex-row w-full h-2 bg-secondary-200 rounded-full mb-6">
        <View 
            className="bg-primary-500 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%`}}
        />
      </View>
  )


  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1 px-5">
          <ProgressBar />
          
          <View className="flex-1">
            {renderStep()}
          </View>

          <View className="flex-row justify-between py-4">
            {step > 1 ? (
              <TouchableOpacity
                onPress={handleBack}
                className="bg-secondary-200 py-3 px-6 rounded-xl"
                disabled={isLoading}
              >
                <Text className="font-bold text-lg text-secondary-700">Retour</Text>
              </TouchableOpacity>
            ) : <View />}
            
            {step < totalSteps ? (
              <TouchableOpacity
                onPress={handleNext}
                className="bg-primary-500 py-3 px-6 rounded-xl"
                disabled={isLoading}
              >
                  {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-surface font-bold text-lg">Suivant</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-success-500 py-3 px-6 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-surface font-bold text-lg">Terminer</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OnboardingScreen; 