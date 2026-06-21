import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import ReasonCard from '../components/ReasonCard';
import { AnalysisResult } from '../utils/analyzeQrContent';

const { width } = Dimensions.get('window');

interface ResultScreenProps {
  qrContent: string;
  analysis: AnalysisResult;
  onScanAgain: () => void;
}

export default function ResultScreen({
  qrContent,
  analysis,
  onScanAgain,
}: ResultScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const isSafe = analysis.status === 'SAFE';
  const isUrl = (() => {
    try {
      const url = new URL(qrContent);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(qrContent);
    Alert.alert('Copied', 'QR content copied to clipboard.');
  };

  const handleOpenLink = () => {
    if (isUrl) {
      Linking.openURL(qrContent);
    } else {
      Alert.alert('Not a URL', 'The QR content is not a valid URL.');
    }
  };

  return (
    <View style={styles.container}>
      <Header onClose={onScanAgain} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Scan Result</Text>
          <Text style={styles.subtitle}>QR security analysis</Text>
        </View>

        {/* Main card */}
        <Animated.View
          style={[
            styles.resultCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <StatusBadge status={analysis.status} />

          {/* Detected content label */}
          <Text style={styles.contentLabel}>
            {isUrl ? 'DETECTED URL' : 'DETECTED CONTENT'}
          </Text>

          {/* URL/Content display */}
          <View style={styles.contentBox}>
            <Text style={styles.contentText} numberOfLines={3}>
              {qrContent}
            </Text>
          </View>

          {/* Reason card */}
          <ReasonCard status={analysis.status} reasons={analysis.reasons} />

          {/* Tags */}
          <View style={styles.tagContainer}>
            {isSafe ? (
              <>
                <View style={[styles.tag, styles.tagSafe]}>
                  <Text style={[styles.tagText, styles.tagTextSafe]}>HTTPS Valid</Text>
                </View>
                <View style={[styles.tag, styles.tagSafe]}>
                  <Text style={[styles.tagText, styles.tagTextSafe]}>No Threats</Text>
                </View>
                <View style={[styles.tag, styles.tagSafe]}>
                  <Text style={[styles.tagText, styles.tagTextSafe]}>Clean</Text>
                </View>
              </>
            ) : (
              <View style={[styles.tag, styles.tagDanger]}>
                <Text style={[styles.tagText, styles.tagTextDanger]}>
                  Threat Detected
                </Text>
              </View>
            )}
          </View>

          {/* Inline action buttons for dangerous */}
          {!isSafe && (
            <View style={styles.inlineActions}>
              {isUrl && (
                <TouchableOpacity style={styles.inlineBtn} onPress={handleOpenLink}>
                  <Ionicons name="open-outline" size={14} color="#B0B8C8" />
                  <Text style={styles.inlineBtnText}>Open Link</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.inlineBtn} onPress={handleCopyLink}>
                <Ionicons name="copy-outline" size={14} color="#B0B8C8" />
                <Text style={styles.inlineBtnText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Action buttons - only full-width for SAFE */}
        {isSafe && (
          <View style={styles.actionButtons}>
            {isUrl && (
              <TouchableOpacity style={styles.openLinkButton} onPress={handleOpenLink}>
                <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                <Text style={styles.openLinkText}>Open Link</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.copyLinkButton} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={20} color="#00F0FF" />
              <Text style={styles.copyLinkText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scan Again / Delete & Scan Again */}
        <TouchableOpacity
          style={[
            styles.scanAgainButton,
            !isSafe && styles.scanAgainButtonDanger,
          ]}
          onPress={onScanAgain}
        >
          <Ionicons
            name={isSafe ? 'qr-code-outline' : 'trash-outline'}
            size={18}
            color={isSafe ? '#00F0FF' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.scanAgainText,
              !isSafe && styles.scanAgainTextDanger,
            ]}
          >
            {isSafe ? 'SCAN AGAIN' : 'Delete & Scan Again'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#8A8A9A',
    marginTop: 4,
  },
  resultCard: {
    marginHorizontal: 20,
    backgroundColor: '#141928',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  contentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  contentBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  contentText: {
    fontSize: 13,
    color: '#B0B8C8',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagSafe: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  tagDanger: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tagTextSafe: {
    color: '#00E676',
  },
  tagTextDanger: {
    color: '#FF6B6B',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inlineBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B0B8C8',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  openLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#00E676',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  openLinkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  copyLinkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00F0FF',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
  },
  scanAgainButtonDanger: {
    backgroundColor: '#C62828',
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scanAgainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00F0FF',
    letterSpacing: 2,
  },
  scanAgainTextDanger: {
    color: '#FFFFFF',
    letterSpacing: 0,
    fontSize: 16,
  },
});
