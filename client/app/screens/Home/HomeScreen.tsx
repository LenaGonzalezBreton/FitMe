import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../hooks/useCycle';

interface HomeScreenProps {
  navigation: NavigationProp<any, any>;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const { currentPhase, getPhaseLabel, getPhaseEmoji } = useCycle();
  const streakDays = 7;
  const nextWorkout = 'Squats + Cardio';

  const cyclePhases = [
    { name: 'Menstruelle', current: false, color: 'bg-border' },
    { name: 'Folliculaire', current: true, color: 'bg-primary-500' },
    { name: 'Ovulatoire', current: false, color: 'bg-border' },
    { name: 'Lutéale', current: false, color: 'bg-border' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView className="flex-1 px-6">
        {/* Header with proper spacing */}
        <View className="pt-16 pb-6">
          <Text className="text-lg text-secondary-600 mb-1">Bonjour !</Text>
          <Text className="text-3xl font-bold text-brand-text mb-6">Prête pour aujourd'hui ?</Text>
          
          {/* Streak Badge */}
          <View className="bg-surface rounded-xl p-4 mb-4 shadow-sm border border-border-light">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-secondary-600 mb-1">Série en cours</Text>
                <Text className="text-2xl font-bold text-brand-text">{streakDays} jours</Text>
              </View>
              <Text className="text-4xl">🔥</Text>
            </View>
          </View>
        </View>

        {/* Current Phase Card */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Phase actuelle</Text>
          <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
            {user?.isMenopausal ? (
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">Post-ménopause</Text>
                  <Text className="text-sm text-secondary-600">Entraînements adaptés à votre situation</Text>
                </View>
                <View className="bg-secondary-500 rounded-full w-12 h-12 items-center justify-center">
                  <Text className="text-surface text-xl">🌙</Text>
                </View>
              </View>
            ) : currentPhase ? (
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">{getPhaseLabel(currentPhase.phase)}</Text>
                  <Text className="text-sm text-secondary-600">Jour {currentPhase.cycleDay} de votre cycle</Text>
                </View>
                <View className="bg-primary-500 rounded-full w-12 h-12 items-center justify-center">
                  <Text className="text-surface text-xl">{getPhaseEmoji(currentPhase.phase)}</Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">Cycle non suivi</Text>
                  <Text className="text-sm text-secondary-600">Activez le suivi pour des recommandations personnalisées</Text>
                </View>
                <View className="bg-secondary-300 rounded-full w-12 h-12 items-center justify-center">
                  <Text className="text-surface text-xl">📅</Text>
                </View>
              </View>
            )}
            
            {/* Phase Timeline - only show for non-menopausal users with cycle tracking */}
            {!user?.isMenopausal && currentPhase && (
              <View className="flex-row space-x-2">
                {cyclePhases.map((phase: { name: string; current: boolean; color: string }) => (
                  <View key={phase.name} className="flex-1 h-2 rounded-full">
                    <View className={`h-full rounded-full ${phase.color}`} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Next Workout */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Prochain entraînement</Text>
          <TouchableOpacity 
            className="bg-primary-500 rounded-xl p-6 shadow-sm active:bg-primary-600"
            onPress={() => navigation.navigate('WorkoutSession')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-surface text-xl font-bold mb-2">{nextWorkout}</Text>
                <Text className="text-primary-100 text-sm">
                  {user?.isMenopausal 
                    ? 'Adapté à votre situation post-ménopause'
                    : currentPhase 
                      ? `Adapté à votre phase ${getPhaseLabel(currentPhase.phase).toLowerCase()}`
                      : 'Entraînement général recommandé'
                  }
                </Text>
              </View>
              <View className="bg-surface/20 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-surface text-xl">▶️</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 
