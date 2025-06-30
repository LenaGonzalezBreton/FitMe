import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const currentPhase = 'Folliculaire'; 
  const streakDays = 7;
  const nextWorkout = 'Squats + Cardio';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Header with proper spacing */}
        <View className="pt-16 pb-6">
          <Text className="text-lg text-text-secondary mb-1">Bonjour !</Text>
          <Text className="text-3xl font-bold text-text-primary mb-6">Prête pour aujourd'hui ?</Text>
          
          {/* Streak Badge */}
          <View className="bg-primary-100 border border-primary-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-primary-700 mb-1">Série en cours</Text>
                <Text className="text-2xl font-bold text-primary-800">{streakDays} jours</Text>
              </View>
              <Text className="text-4xl">🔥</Text>
            </View>
          </View>
        </View>

        {/* Current Phase Card */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Phase actuelle</Text>
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold text-text-primary mb-1">{currentPhase}</Text>
                <Text className="text-sm text-text-secondary">Parfait pour les entraînements intensifs</Text>
              </View>
              <View className="bg-primary-500 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-white text-xl">💪</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Next Workout */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Prochain entraînement</Text>
          <TouchableOpacity className="bg-primary-500 rounded-xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-2">{nextWorkout}</Text>
                <Text className="text-primary-100 text-sm">Adapté à votre phase {currentPhase.toLowerCase()}</Text>
              </View>
              <View className="bg-white/20 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-white text-xl">▶️</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-text-primary mb-4">Actions rapides</Text>
          <View className="space-y-3">
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-surface border border-border rounded-xl p-4 items-center"
                onPress={() => navigation.navigate('CreateProgram')}
              >
                <Text className="text-2xl mb-2">🎯</Text>
                <Text className="text-text-primary font-medium text-center">Nouveau Programme</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-accent-50 border border-accent-200 rounded-xl p-4 items-center">
                <Text className="text-2xl mb-2">📊</Text>
                <Text className="text-accent-700 font-medium text-center">Mes Stats</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-1 bg-surface border border-border rounded-xl p-4 items-center">
                <Text className="text-2xl mb-2">🗓️</Text>
                <Text className="text-text-primary font-medium text-center">Calendrier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-primary-50 border border-primary-200 rounded-xl p-4 items-center">
                <Text className="text-2xl mb-2">💭</Text>
                <Text className="text-primary-700 font-medium text-center">Journal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 
