import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

const BUTTON_STYLES = {
  primary: 'bg-primary-500',
  secondary: 'bg-success',
  outline: 'border border-primary-500',
};

const TEXT_STYLES = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary-500',
};

export default function Button({
  title,
  variant = 'primary',
  style,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`${BUTTON_STYLES[variant]} py-4 rounded-xl ${style ?? ''}`}
      {...props}
    >
      <Text className={`text-center font-bold text-lg ${TEXT_STYLES[variant]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
