import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const CreateProgramScreen = () => {
  const [programTitle, setProgramTitle] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6">
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-secondary mb-2">Titre</Text>
          <TextInput
            className="bg-surface border border-border p-4 rounded-xl text-lg text-text-primary"
            placeholder="Mon super programme"
            value={programTitle}
            onChangeText={setProgramTitle}
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-secondary mb-2">Jours d'entraînement</Text>
          {DAYS.map((day) => (
             <View key={day} className="bg-surface border border-border p-4 rounded-xl mb-3">
               <Text className="text-lg font-semibold text-text-primary">{day}</Text>
               <Text className="text-text-secondary mt-1">Aucun exercice</Text>
             </View>
          ))}
        </View>

        <TouchableOpacity 
          className="bg-primary p-4 rounded-xl items-center active:opacity-80"
          onPress={() => console.log('Bouton "Ajouter un exercice" cliqué')}
        >
          <Text className="text-white text-lg font-bold">Ajouter un exercice</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateProgramScreen; 