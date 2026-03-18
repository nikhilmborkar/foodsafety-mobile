import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '../components/SafeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEvaluate, InconclusiveResult } from '../hooks/useEvaluate';
import { Profile, EvaluateResponse } from '../types';
import { COLOURS } from '../constants/colours';
import { TYPOGRAPHY } from '../constants/typography';
import { ModalSheet } from '../components/ModalSheet';
import { OnboardingSheet } from '../components/OnboardingSheet';

const CORNER_SIZE = 26;
const CORNER_WIDTH = 3;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cameraKey, setCameraKey] = useState(0);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanMode, setScanMode] = useState<'grocery' | 'restaurant'>('grocery');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scanLocked = useRef(false);
  const router = useRouter();
  const { loading, slow, error, evaluate, reset } = useEvaluate();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (scanLocked.current) {
        setCameraKey((k) => k + 1);
      }
      scanLocked.current = false;
      reset();
      AsyncStorage.getItem('household_profiles')
        .then(raw => {
          if (cancelled) return;
          const loaded: Profile[] = raw ? (JSON.parse(raw) as Profile[]) : [];
          setProfiles(loaded);
          if (loaded.length === 0) setShowOnboarding(true);
        })
        .catch(() => {
          if (cancelled) return;
          setProfiles([]);
        });

      return () => {
        cancelled = true;
      };
    }, [reset])
  );

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/' && scanLocked.current) {
      setCameraKey((k) => k + 1);
      scanLocked.current = false;
    }
  }, [pathname]);

  function navigateResult(result: EvaluateResponse | InconclusiveResult) {
    if ((result as InconclusiveResult).inconclusive) {
      const r = result as InconclusiveResult;
      router.push({
        pathname: '/result',
        params: {
          state: 'INCONCLUSIVE',
          product_id: r.product_id,
          product_name: r.product_name,
          inconclusive_reason: (result as EvaluateResponse).inconclusive_reason,
        },
      });
    } else {
      router.push({ pathname: '/result-tier1', params: { data: JSON.stringify(result) } });
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

  function handleOnboardingComplete(profile: Profile) {
    setProfiles(prev => [...prev, profile]);
    setShowOnboarding(false);
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeScreen edges={['top']} style={styles.permissionScreen}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan barcodes.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top']}>
      <View style={styles.container}>
      <CameraView
        key={cameraKey}
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
        onBarcodeScanned={handleBarcode}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Wordmark */}
        <Text style={styles.wordmark}>fufu</Text>

        {/* Mode chips */}
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={scanMode === 'grocery' ? styles.chipActive : styles.chipInactive}
            onPress={() => setScanMode('grocery')}
          >
            <Text style={scanMode === 'grocery' ? styles.chipTextActive : styles.chipTextInactive}>
              🛒 Grocery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={scanMode === 'restaurant' ? styles.chipActive : styles.chipInactive}
            onPress={() => setShowUpgradeModal(true)}
          >
            <Text style={scanMode === 'restaurant' ? styles.chipTextActive : styles.chipTextInactive}>
              🍽 Restaurant
            </Text>
          </TouchableOpacity>
        </View>

        {/* Corner bracket viewfinder */}
        <View style={styles.viewfinderContainer}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Instruction text below scanner brackets */}
        {!loading && !error && (
          <Text style={styles.instructionText}>
            {profiles.length === 0
              ? 'Set up household to scan'
              : 'Point camera at barcode'}
          </Text>
        )}

        {/* Bottom status + controls */}
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
          ) : null}

          {/* Grocery mode button row */}
          {scanMode === 'grocery' && !loading && !error && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => router.push('/scan-label')}
              >
                <Text style={styles.manualBtnText}>Scan label</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => setManualVisible(true)}
              >
                <Text style={styles.manualBtnText}>Enter manually</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Fallback manual button when loading or error */}
          {(loading || !!error) && (
            <TouchableOpacity
              style={styles.manualBtn}
              onPress={() => setManualVisible(true)}
            >
              <Text style={styles.manualBtnText}>Enter manually</Text>
            </TouchableOpacity>
          )}
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
          <View style={[styles.manualModal, { paddingBottom: insets.bottom + 20 }]}>
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

      {/* Onboarding sheet */}
      <OnboardingSheet
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Upgrade modal */}
      <Modal
        visible={showUpgradeModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowUpgradeModal(false);
          setScanMode('grocery');
        }}
      >
        <View style={styles.upgradeOverlay}>
          <ModalSheet>
            <Text style={styles.upgradeTitle}>Unlock restaurant scanning</Text>
            <Text style={styles.upgradeBody}>
              Point your camera at any menu. fufu checks every dish against your household's allergies, diets, and faith-based requirements - instantly.
            </Text>

            {/* Feature list */}
            <View style={styles.upgradeFeatureList}>
              <Text style={styles.upgradeFeatureLine}>✓ Scan ingredient labels</Text>
              <Text style={styles.upgradeFeatureLine}>✓ Scan restaurant menus</Text>
              <Text style={styles.upgradeFeatureLine}>✓ Scan history</Text>
              <Text style={styles.upgradeFeatureLine}>✓ Advanced safety verification</Text>
              <Text style={styles.upgradeFeatureLine}>✓ Recall & safety alerts</Text>
              <Text style={styles.upgradeFeatureLine}>✓ Family coverage, from babies to fur babies</Text>
            </View>

            <TouchableOpacity
              style={styles.upgradePrimaryBtn}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.upgradePrimaryText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth')}>
              <Text style={styles.upgradeSignInText}>Already have an account? Sign in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUpgradeModal(false);
                setScanMode('grocery');
              }}
            >
              <Text style={styles.upgradeLaterText}>Maybe later</Text>
            </TouchableOpacity>
          </ModalSheet>
        </View>
      </Modal>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',          // camera backing — no semantic token
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '6%',
  },
  wordmark: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 36,
    color: '#F3E9DA',
    letterSpacing: -1.5,
    textAlign: 'center',
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    zIndex: 10,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  chipRow: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  chipActive: {
    backgroundColor: '#F3E9DA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(243,233,218,0.5)',
  },
  chipTextActive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F172A',
  },
  chipTextInactive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(243,233,218,0.7)',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)', // semi-transparent overlay — no token
    paddingTop: 20,
    paddingBottom: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  instructionText: {
    ...TYPOGRAPHY.body,
    color: COLOURS.WHITE,
    fontSize: 15,
    textAlign: 'center',
    position: 'absolute',
    alignSelf: 'center',
    top: '62%',
    zIndex: 10,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: '#F3E9DA',
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
  upgradeOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  upgradeSheet: {
    backgroundColor: '#F6EFE4',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 16,
  },
  upgradeTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 8,
  },
  upgradeBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#334155',
    marginBottom: 20,
  },
  upgradeFeatureList: {
    marginBottom: 24,
    gap: 10,
  },
  upgradeFeatureLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#0F172A',
  },
  upgradePrimaryBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  upgradePrimaryText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: '#F3E9DA',
  },
  upgradeSignInText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeLaterText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
