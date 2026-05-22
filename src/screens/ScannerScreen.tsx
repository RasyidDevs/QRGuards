import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.72;

interface ScannerScreenProps {
  onScanned: (data: string) => void;
}

export default function ScannerScreen({ onScanned }: ScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cornerPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    // Scan line animation
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();

    // Corner pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(cornerPulse, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      scanLoop.stop();
      pulseLoop.stop();
    };
  }, [scanLineAnim, cornerPulse]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
  };

  const handleUploadImage = () => {
    Alert.alert(
      'Coming Soon',
      'Upload image feature coming soon.',
      [{ text: 'OK' }]
    );
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANNER_SIZE - 4],
  });

  // Reset scan state when component mounts (returning from result)
  useEffect(() => {
    setScanned(false);
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Header showInfo />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={60} color="#00F0FF" />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Header showInfo />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={60} color="#00F0FF" />
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <Text style={styles.permissionSubtext}>
            QRGuard needs camera access to scan QR codes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showInfo />

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Dark overlay with scanner cutout */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scannerFrame}>
              {/* Corner brackets - Top Left */}
              <Animated.View style={[styles.corner, styles.cornerTL, { opacity: cornerPulse }]} />
              {/* Corner brackets - Top Right */}
              <Animated.View style={[styles.corner, styles.cornerTR, { opacity: cornerPulse }]} />
              {/* Corner brackets - Bottom Left */}
              <Animated.View style={[styles.corner, styles.cornerBL, { opacity: cornerPulse }]} />
              {/* Corner brackets - Bottom Right */}
              <Animated.View style={[styles.corner, styles.cornerBR, { opacity: cornerPulse }]} />

              {/* Scanning line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />

              {/* Center circle hint */}
              <View style={styles.centerCircle} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>
      </View>

      {/* Instruction text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Point camera at QR code</Text>
        <View style={styles.instructionLine} />
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomButton, flashOn && styles.bottomButtonActive]}
          onPress={() => setFlashOn(!flashOn)}
        >
          <Ionicons
            name={flashOn ? 'flash' : 'flash-outline'}
            size={24}
            color={flashOn ? '#0A0E1A' : '#8A8A9A'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={handleUploadImage}>
          <Ionicons name="image-outline" size={24} color="#8A8A9A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#8A8A9A',
    marginTop: 8,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: '#00F0FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#00F0FF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: SCANNER_SIZE * 0.55,
    height: SCANNER_SIZE * 0.55,
    marginTop: -(SCANNER_SIZE * 0.55) / 2,
    marginLeft: -(SCANNER_SIZE * 0.55) / 2,
    borderRadius: SCANNER_SIZE * 0.55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderStyle: 'dashed',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
  },
  instructionText: {
    fontSize: 15,
    color: '#B0B8C8',
    letterSpacing: 0.5,
  },
  instructionLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#00F0FF',
    marginTop: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 28,
    paddingBottom: 40,
    backgroundColor: '#0A0E1A',
  },
  bottomButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonActive: {
    backgroundColor: '#00F0FF',
    borderColor: '#00F0FF',
  },
});
