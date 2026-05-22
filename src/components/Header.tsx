import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onClose?: () => void;
  showInfo?: boolean;
}

export default function Header({ onClose, showInfo }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.shieldIcon}>
          <Ionicons name="shield-checkmark" size={20} color="#00F0FF" />
        </View>
        <Text style={styles.title}>QRGuard</Text>
      </View>
      <View style={styles.rightSection}>
        {showInfo && (
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="help-circle-outline" size={24} color="#00F0FF" />
          </TouchableOpacity>
        )}
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={24} color="#8A8A9A" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#0A0E1A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.08)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
});
