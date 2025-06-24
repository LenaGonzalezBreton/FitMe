import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-text-primary mb-8">Hello FitMe</Text>
      <TouchableOpacity
        className="bg-primary p-4 rounded-xl active:opacity-80"
        onPress={() => navigation.navigate('CreateProgram')}
      >
        <Text className="text-white text-lg font-bold">Créer un Programme</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen; 