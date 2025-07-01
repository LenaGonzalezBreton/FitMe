import React from 'react';
import { View, Text } from 'react-native';

const Tag = ({ text, color, textColor = 'white' }) => (
  <View className={`px-3 py-1 rounded-full ${color}`}>
    <Text className={`text-xs font-bold ${textColor}`}>{text}</Text>
  </View>
);

export default Tag; 