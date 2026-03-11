import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEvaluate, InconclusiveResult } from '../hooks/useEvaluate';
import { Profile, EvaluateResponse } from '../types';
import { COLOURS } from '../constants/colours';
import { TYPOGRAPHY } from '../constants/typography';

const CORNER_SIZE = 26;
const CORNER_WIDTH = 3;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const scanLocked = useRef(false);
  const router = useRouter();
  const { loading, slow, error, evaluate, reset } = useEvaluate();

  useFocusEffect(
    useCallback(() => {
      scanLocked.current = false;
      reset();
      AsyncStorage.getItem('household_profiles')
        .then(raw => {
          setProfiles(raw ? (JSON.parse(raw) as Profile[]) : []);
        })
        .catch(() => setProfiles([]));
    }, [reset])
  );

  function navigateResult(result: EvaluateResponse | InconclusiveResult) {
    if ((result as InconclusiveResult).inconclusive) {
      const r = result as InconclusiveResult;
      router.push({
        pathname: '/result',
        params: {
          state: 'INCONCLUSIVE',
          product_id: r.product_id,
          product_name: r.product_name,
        },
      });
    } else {
      router.push({ pathname: '/result', params: { data: JSON.stringify(result) } });
    }
  }

  const handleBarcode = useCallback(
    async ({ data }: { data: string }) => {
      if (scanLocked.current || profiles.length === 0) return;
      scanLocked.current = true;
      const result = await evaluate(data, profiles);
      if (result) {
        navigateResult(result);
      } else {
        scanLocked.current = false;
      }
    },
    [profiles, evaluate, router]
  );

  const handleManualSubmit = async () => {
    const code = manualBarcode.trim();
    if (!code || profiles.length === 0) return;
    setManualVisible(false);
    setManualBarcode('');
    scanLocked.current = true;
    const result = await evaluate(code, profiles);
    if (result) {
      navigateResult(result);
    } else {
      scanLocked.current = false;
    }
  };

  const memberNames = profiles.map(p => p.Profile_Name).join(', ');
  const bannerText =
    profiles.length === 0
      ? 'No household set up — go to Household tab'
      : `${memberNames} · Scanning`;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan barcodes.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
        onBarcodeScanned={handleBarcode}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top banner */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerText}>{bannerText}</Text>
        </View>

        {/* Corner bracket viewfinder */}
        <View style={styles.viewfinderContainer}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Bottom status + manual entry */}
        <View style={styles.bottomContainer}>
          {loading ? (
            <Text style={styles.statusText}>
              {slow ? 'Taking longer than expected...' : 'Looking up product...'}
            </Text>
          ) : error ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  scanLocked.current = false;
                  reset();
                }}
              >
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.statusText}>
              {profiles.length === 0
                ? 'Set up household to scan'
                : 'Point camera at barcode'}
            </Text>
          )}

          <TouchableOpacity
            style={styles.manualBtn}
            onPress={() => setManualVisible(true)}
          >
            <Text style={styles.manualBtnText}>Enter manually</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual barcode modal */}
      <Modal
        visible={manualVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setManualVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.manualModal}>
            <Text style={styles.manualTitle}>Enter barcode</Text>
            <TextInput
              style={styles.manualInput}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="e.g. 8710339427403"
              placeholderTextColor={COLOURS.TEXT_FAINT}
              keyboardType="number-pad"
              autoFocus
            />
            <View style={styles.manualButtons}>
              <TouchableOpacity
                style={styles.manualCancelBtn}
                onPress={() => {
                  setManualVisible(false);
                  setManualBarcode('');
                }}
              >
                <Text style={styles.manualCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.manualSubmitBtn,
                  !manualBarcode.trim() && styles.manualSubmitBtnDisabled,
                ]}
                onPress={handleManualSubmit}
                disabled={!manualBarcode.trim()}
              >
                <Text style={styles.manualSubmitText}>Look up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',          // camera backing — no semantic token
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  bannerContainer: {
    backgroundColor: 'rgba(0,0,0,0.65)', // semi-transparent overlay — no token
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bannerText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLOURS.WHITE,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  viewfinderContainer: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLOURS.WHITE,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  bottomContainer: {
    backgroundColor: 'rgba(0,0,0,0.65)', // semi-transparent overlay — no token
    paddingTop: 20,
    paddingBottom: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  statusText: {
    ...TYPOGRAPHY.body,
    color: COLOURS.WHITE,
    fontSize: 15,
    textAlign: 'center',
  },
  errorBlock: {
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLOURS.SCAN_ERROR,
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLOURS.SCAN_INFO,
    fontSize: 14,
    fontWeight: '500',
  },
  manualBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)', // semi-transparent — no token
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  manualBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLOURS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLOURS.BACKGROUND,
  },
  permissionText: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLOURS.TEXT_MID,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionBtn: {
    backgroundColor: COLOURS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLOURS.WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  manualModal: {
    backgroundColor: COLOURS.SURFACE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 16,
  },
  manualTitle: {
    ...TYPOGRAPHY.subheading,
    fontSize: 18,
    fontWeight: '700',
    color: COLOURS.TEXT_PRIMARY,
  },
  manualInput: {
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    color: COLOURS.TEXT_PRIMARY,
    backgroundColor: COLOURS.BACKGROUND,
    letterSpacing: 2,
  },
  manualButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  manualCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  manualCancelText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLOURS.TEXT_MID,
    fontWeight: '500',
  },
  manualSubmitBtn: {
    flex: 1,
    backgroundColor: COLOURS.PRIMARY,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  manualSubmitBtnDisabled: {
    backgroundColor: COLOURS.TEXT_FAINT,
  },
  manualSubmitText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLOURS.WHITE,
    fontWeight: '600',
  },
});
