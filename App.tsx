import React, { useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import ScannerScreen from './src/screens/ScannerScreen';
import ResultScreen from './src/screens/ResultScreen';
import { analyzeQrContent, AnalysisResult } from './src/utils/analyzeQrContent';

type Screen = 'scanner' | 'result';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('scanner');
  const [qrContent, setQrContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleScanned = useCallback((data: string) => {
    const result = analyzeQrContent(data);

    // If SAFE and it's a valid URL, redirect immediately
    if (result.status === 'SAFE') {
      try {
        const url = new URL(data);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          Linking.openURL(data);
          return;
        }
      } catch {
        // Not a URL, fall through to result screen
      }
    }

    // Show result screen for DANGEROUS or non-URL content
    setQrContent(data);
    setAnalysis(result);
    setCurrentScreen('result');
  }, []);

  const handleScanAgain = useCallback(() => {
    setQrContent('');
    setAnalysis(null);
    setCurrentScreen('scanner');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {currentScreen === 'scanner' ? (
        <ScannerScreen onScanned={handleScanned} />
      ) : (
        analysis && (
          <ResultScreen
            qrContent={qrContent}
            analysis={analysis}
            onScanAgain={handleScanAgain}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
});
