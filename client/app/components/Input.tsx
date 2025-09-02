import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="mb-2 text-sm font-medium text-brand-text">{label}</Text>}
      <TextInput
        className={`bg-surface border p-4 rounded-xl text-brand-text placeholder:text-secondary-400 focus:border-primary-500 ${
          error ? 'border-error-500' : 'border-border'
        }`}
        placeholderTextColor="#A99985"
        {...props}
      />
      {error && <Text className="mt-2 text-xs text-error-600">{error}</Text>}
    </View>
  );
}
