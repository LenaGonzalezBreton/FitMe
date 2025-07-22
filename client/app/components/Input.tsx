import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="mb-1 text-sm font-medium text-brand-text">{label}</Text>}
      <TextInput
        className={`bg-surface border border-border p-4 rounded-xl ${
          error ? 'border-error' : ''
        }`}
        placeholderTextColor="#A99985"
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-error">{error}</Text>}
    </View>
  );
}
