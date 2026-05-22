import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReasonCardProps {
  status: 'SAFE' | 'DANGEROUS';
  reasons: string[];
}

const REASON_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'URL does not use HTTPS.': 'lock-open-outline',
  'URL uses a shortlink or QR redirect service.': 'link-outline',
  'URL contains suspicious keywords.': 'warning-outline',
  'QR content is not a verifiable URL.': 'code-slash-outline',
  'URL uses an IP address instead of a normal domain.': 'globe-outline',
  'URL is unusually long.': 'resize-outline',
  'URL uses HTTPS and no suspicious pattern was detected.': 'checkmark-circle-outline',
};

export default function ReasonCard({ status, reasons }: ReasonCardProps) {
  const isSafe = status === 'SAFE';
  const iconColor = isSafe ? '#00E676' : '#FF6B6B';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Analysis</Text>
      {reasons.map((reason, index) => {
        const iconName = REASON_ICONS[reason] || (isSafe ? 'checkmark-circle-outline' : 'warning-outline');
        return (
          <View key={index} style={styles.reasonRow}>
            <Ionicons
              name={iconName}
              size={18}
              color={iconColor}
              style={styles.reasonIcon}
            />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 8,
  },
  reasonIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  reasonText: {
    fontSize: 13,
    color: '#B0B8C8',
    lineHeight: 19,
    flex: 1,
  },
});
