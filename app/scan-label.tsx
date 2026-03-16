import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { SafeScreen } from '../components/SafeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runOcr } from '../utils/runOcr';
import { API_BASE_URL } from '../constants/api';
import { EvaluateResponse, Profile } from '../types';

export default function ScanLabelScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const isFocused = useIsFocused();
  // Tracks whether the screen is currently active so async callbacks can
  // guard state updates after the screen has lost focus.
  const focusedRef = useRef(isFocused);

  useEffect(() => {
    focusedRef.current = isFocused;
    if (isFocused) {
      setCapturing(false);
      setErrorMsg(null);
    }
  }, [isFocused]);

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    setErrorMsg(null);

    try {
      // 1. Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
      });

      if (!focusedRef.current) return;

      if (!photo) {
        setErrorMsg('Could not capture photo. Try again.');
        setCapturing(false);
        return;
      }

      // 2. Run OCR
      const text = await runOcr(photo.uri);

      if (!focusedRef.current) return;

      if (!text) {
        setErrorMsg('Label not readable. Try better lighting or move closer.');
        setCapturing(false);
        return;
      }

      // 3. Load profiles
      let profiles: Profile[] = [];
      try {
        const raw = await AsyncStorage.getItem('household_profiles');
        if (raw) profiles = JSON.parse(raw) as Profile[];
      } catch {
        // proceed with empty profiles
      }

      if (!focusedRef.current) return;

      // 4. POST to /ocr-evaluate
      const response = await fetch(`${API_BASE_URL}/ocr-evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient_text: text,
          product_name: 'Scanned label',
          profiles,
        }),
      });

      if (!focusedRef.current) return;

      if (!response.ok) {
        setErrorMsg('Server error. Please try again.');
        setCapturing(false);
        return;
      }

      const result: EvaluateResponse = await response.json();

      if (!focusedRef.current) return;

      // 5. Navigate to result — same pattern as barcode scan
      router.push({
        pathname: '/result',
        params: {
          data: JSON.stringify(result),
          source: 'ocr_label',
        },
      });
    } catch {
      if (!focusedRef.current) return;
      setErrorMsg('Something went wrong. Please try again.');
      setCapturing(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan ingredient labels.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeScreen edges={['top']}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Point camera at ingredient label</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Error message */}
      {errorMsg && !capturing && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Loading overlay */}
      {capturing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F3E9DA" />
          <Text style={styles.loadingText}>Reading label...</Text>
        </View>
      )}

      {/* Capture button */}
      {!capturing && (
        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} />
        </View>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backBtn: {
    width: 36,
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    color: '#F3E9DA',
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#F3E9DA',
    textAlign: 'center',
    flex: 1,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 10,
    padding: 14,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#F3E9DA',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#F3E9DA',
  },
  captureRow: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E9DA',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F3E9DA',
  },
  permissionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#F3E9DA',
  },
});
