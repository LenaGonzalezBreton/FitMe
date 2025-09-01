import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const BUTTON_STYLES = {
  primary: 'bg-primary-500 active:bg-primary-600 disabled:bg-primary-300',
  secondary: 'bg-secondary-500 active:bg-secondary-600 disabled:bg-secondary-300',
  outline: 'border-2 border-primary-500 bg-transparent active:bg-primary-50 disabled:border-primary-300',
  ghost: 'bg-transparent active:bg-primary-50 disabled:bg-transparent',
  danger: 'bg-error-500 active:bg-error-600 disabled:bg-error-300',
};

const TEXT_STYLES = {
  primary: 'text-surface disabled:text-surface/60',
  secondary: 'text-surface disabled:text-surface/60',
  outline: 'text-primary-500 disabled:text-primary-300',
  ghost: 'text-primary-500 disabled:text-primary-300',
  danger: 'text-surface disabled:text-surface/60',
};

const SIZE_STYLES = {
  sm: 'py-2 px-4',
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  style,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`${BUTTON_STYLES[variant]} ${SIZE_STYLES[size]} rounded-xl shadow-sm ${style ?? ''}`}
      disabled={disabled}
      {...props}
    >
      <Text className={`text-center font-bold text-lg ${TEXT_STYLES[variant]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
