import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatusBadgeProps {
  status: 'SAFE' | 'DANGEROUS';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isSafe = status === 'SAFE';
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: isSafe
              ? 'rgba(0, 230, 118, 0.3)'
              : 'rgba(255, 59, 48, 0.3)',
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isSafe
              ? 'rgba(0, 230, 118, 0.15)'
              : 'rgba(255, 59, 48, 0.15)',
            borderColor: isSafe
              ? 'rgba(0, 230, 118, 0.5)'
              : 'rgba(255, 59, 48, 0.5)',
          },
        ]}
      >
        <Ionicons
          name={isSafe ? 'shield-checkmark' : 'alert-circle'}
          size={40}
          color={isSafe ? '#00E676' : '#FF3B30'}
        />
      </View>
      {/* Status badge label */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isSafe
              ? 'rgba(0, 230, 118, 0.2)'
              : 'rgba(255, 59, 48, 0.2)',
            borderColor: isSafe
              ? 'rgba(0, 230, 118, 0.4)'
              : 'rgba(255, 59, 48, 0.4)',
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: isSafe ? '#00E676' : '#FF3B30' },
          ]}
        >
          {isSafe ? 'SAFE' : 'DANGEROUS'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    top: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
