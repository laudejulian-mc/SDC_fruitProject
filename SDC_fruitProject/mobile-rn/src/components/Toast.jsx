import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing } from '../theme';

const ICONS = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

export default function Toast({ type = 'info', message, onClose, duration = 3000 }) {
  const { dark } = useTheme();
  const c = useColors(dark);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const iconName = ICONS[type] || ICONS.info;

  // Use theme-aware status colors
  const colorMap = {
    success: { bg: c.successBg, border: c.successBorder, text: c.successText, icon: c.green },
    error:   { bg: c.errorBg,   border: c.errorBorder,   text: c.errorText,   icon: c.red },
    warning: { bg: c.warningBg, border: c.warningBorder, text: c.warningText, icon: c.amber },
    info:    { bg: c.infoBg,    border: c.infoBorder,    text: c.infoText,    icon: c.blue },
  };
  const color = colorMap[type] || colorMap.info;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]).start(() => onClose?.());
    }, duration);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: color.bg,
          borderColor: color.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          shadowColor: dark ? color.icon : '#000',
          shadowOpacity: dark ? 0.3 : 0.1,
        },
      ]}
    >
      <Ionicons name={iconName} size={18} color={color.icon} />
      <Text style={[styles.message, { color: color.text }]} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={16} color={color.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
