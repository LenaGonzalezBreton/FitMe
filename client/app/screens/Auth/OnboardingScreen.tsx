import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
  const [formData, setFormData] = useState({
    objective: 'GENERAL_FITNESS',
    experienceLevel: 'BEGINNER',
    isMenopausal: null as boolean | null,
    averageCycleLength: '28',
    averagePeriodLength: '5',
  });

  const totalSteps = formData.isMenopausal ? 3 : 4;

  const handleNext = () => {
    // Basic validation before going to next step
    if (step === 1 && !formData.objective) {
      Alert.alert('Oups !', 'Veuillez choisir un objectif.');
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
      // If menopausal, skip step 4 and submit
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = {
        objective: formData.objective,
        experienceLevel: formData.experienceLevel,
        isMenopausal: formData.isMenopausal,
        averageCycleLength: !formData.isMenopausal ? parseInt(formData.averageCycleLength, 10) : undefined,
        averagePeriodLength: !formData.isMenopausal ? parseInt(formData.averagePeriodLength, 10) : undefined,
      };

      const response = await api.post('/auth/onboarding', payload);
      
      if (response.data.success) {
        // The backend returns the updated user object.
        // We use the login function to update the user in our context.
        await login(response.data.user, token!);
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
      default:
        return <Step1 />;
    }
  };

  const Option = ({ label, value, selectedValue, onSelect }: any) => (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      className={`border rounded-xl p-4 mb-3 ${
        selectedValue === value
          ? 'bg-primary-500 border-primary-500'
          : 'bg-surface border-border'
      }`}
    >
      <Text
        className={`text-lg font-semibold text-center ${
          selectedValue === value ? 'text-white' : 'text-brand-text'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const Step1 = () => (
    <View>
      <Text className="text-2xl font-bold text-center mb-8">
        Quel est votre objectif principal ?
      </Text>
      {Object.entries(ObjectiveType).map(([key, value]) => (
        <Option
          key={key}
          label={value}
          value={key}
          selectedValue={formData.objective}
          onSelect={(val: any) => setFormData({ ...formData, objective: val })}
        />
      ))}
    </View>
  );

  const Step2 = () => (
    <View>
      <Text className="text-2xl font-bold text-center mb-8">
        Quel est votre niveau d'expérience ?
      </Text>
      {Object.entries(ExperienceLevel).map(([key, value]) => (
        <Option
          key={key}
          label={value}
          value={key}
          selectedValue={formData.experienceLevel}
          onSelect={(val: any) => setFormData({ ...formData, experienceLevel: val })}
        />
      ))}
    </View>
  );

  const Step3 = () => (
    <View>
      <Text className="text-2xl font-bold text-center mb-8">
        Êtes-vous en période de ménopause ?
      </Text>
      <Option
        label="Oui"
        value={true}
        selectedValue={formData.isMenopausal}
        onSelect={(val: any) => setFormData({ ...formData, isMenopausal: val })}
      />
      <Option
        label="Non"
        value={false}
        selectedValue={formData.isMenopausal}
        onSelect={(val: any) => setFormData({ ...formData, isMenopausal: val })}
      />
    </View>
  );

  const Step4 = () => (
    <View>
      <Text className="text-2xl font-bold text-center mb-8">
        Quelques détails sur votre cycle
      </Text>
      <Text className="text-lg font-semibold text-brand-text mb-2">Durée moyenne de votre cycle (en jours)</Text>
      <TextInput
        className="bg-surface border border-border p-4 rounded-xl text-lg text-brand-text mb-6"
        placeholder="Ex: 28"
        placeholderTextColor="#A99985"
        keyboardType="number-pad"
        value={formData.averageCycleLength}
        onChangeText={(val) => setFormData({ ...formData, averageCycleLength: val })}
      />
      <Text className="text-lg font-semibold text-brand-text mb-2">Durée moyenne de vos règles (en jours)</Text>
      <TextInput
        className="bg-surface border border-border p-4 rounded-xl text-lg text-brand-text"
        placeholder="Ex: 5"
        placeholderTextColor="#A99985"
        keyboardType="number-pad"
        value={formData.averagePeriodLength}
        onChangeText={(val) => setFormData({ ...formData, averagePeriodLength: val })}
      />
    </View>
  );
  
  const ProgressBar = () => (
      <View className="flex-row w-full h-2 bg-gray-200 rounded-full mb-8">
        <View 
            className="bg-primary-500 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%`}}
        />
      </View>
  )


  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          padding: 20,
        }}
      >
        <View>
            <ProgressBar />
            {renderStep()}
        </View>

        <View className="flex-row justify-between mt-8">
          {step > 1 ? (
            <TouchableOpacity
              onPress={handleBack}
              className="bg-gray-200 py-3 px-6 rounded-xl"
              disabled={isLoading}
            >
              <Text className="font-bold text-lg">Retour</Text>
            </TouchableOpacity>
          ) : <View />}
          
          {step < totalSteps ? (
            <TouchableOpacity
              onPress={handleNext}
              className="bg-primary-500 py-3 px-6 rounded-xl"
              disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Suivant</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-green-500 py-3 px-6 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Terminer</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingScreen; 