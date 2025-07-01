import React from 'react';
import { View, Text } from 'react-native';

interface TagProps {
  text: string;
  color: string;
  textColor?: string;
}

const Tag: React.FC<TagProps> = ({ text, color, textColor = 'white' }) => (
  <View className={`px-3 py-1 rounded-full ${color}`}>
    <Text className={`text-xs font-bold ${textColor}`}>{text}</Text>
  </View>
);

export default Tag; 