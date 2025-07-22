import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, FlatList } from 'react-native';

interface Exercise {
  id: string;
  name: string;
  details: string;
}

const exercises: Exercise[] = [
  { id: '1', name: 'Shoulder Press Machine', details: '4x12 - poids conseillé: 2kg' },
  { id: '2', name: 'Shoulder Press Machine', details: '4x12 - poids conseillé: 2kg' },
  { id: '3', name: 'Shoulder Press Machine', details: '4x12 - poids conseillé: 2kg' },
  { id: '4', name: 'Shoulder Press Machine', details: '4x12 - poids conseillé: 2kg' },
  { id: '5', name: 'Shoulder Press Machine', details: '4x12 - poids conseillé: 2kg' },
];

const WorkoutSessionScreen = () => {
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <View className="bg-surface border border-border rounded-xl p-4 mb-4 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Image
          source={require('../../../assets/logo.png')}
          className="w-12 h-12 mr-4"
          resizeMode="contain"
        />
        <View>
          <Text className="text-brand-text font-semibold">{item.name}</Text>
          <Text className="text-text-secondary">{item.details}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => toggleCheck(item.id)}
        className={`w-8 h-8 rounded-lg border-2 ${checked[item.id] ? 'bg-primary-500 border-primary-500' : 'border-border'
          }`}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="pt-16 px-6 flex-1">
        <Text className="text-brand-text text-center text-xl font-bold">Bonjour User !</Text>
        <Text className="text-text-secondary text-center text-base mt-2 mb-8">
          Séance du jour : Push - Hypertrophie - 5 exos - ~45min
        </Text>
        <FlatList
          data={exercises}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          className="bg-primary-500 py-4 rounded-xl mt-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            Démarrer la séance
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WorkoutSessionScreen; 