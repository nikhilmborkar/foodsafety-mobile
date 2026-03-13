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
  const [cameraKey, setCameraKey] = useState(0);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanMode, setScanMode] = useState<'grocery' | 'restaurant'>('grocery');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  useFocusEffect(
    useCallback(() => {
      setCameraKey((k) => k + 1);
    }, [])
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
          ) : (
            <Text style={styles.statusText}>
              {profiles.length === 0
                ? 'Set up household to scan'
                : 'Point camera at barcode'}
            </Text>
          )}

          {/* Grocery mode button row */}
          {scanMode === 'grocery' && !loading && !error && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => console.log('scan label tapped')}
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
          <View style={styles.upgradeSheet}>
            <Text style={styles.upgradeTitle}>Unlock restaurant scanning</Text>
            <Text style={styles.upgradeBody}>
              Photograph any menu and fufu checks every dish against your household profiles.
            </Text>

            {/* Two-tier card row */}
            <View style={styles.cardRow}>
              {/* Household card */}
              <View style={styles.householdCard}>
                <View style={styles.cardInner}>
                  <View>
                    <Text style={styles.householdTierLabel}>HOUSEHOLD</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.householdPrice}>€7.99</Text>
                      <Text style={styles.householdPerMonth}>/mo</Text>
                    </View>
                    <View style={styles.featureList}>
                      <Text style={styles.householdFeature}>✓  Scan any ingredient label</Text>
                      <Text style={styles.householdFeature}>✓  Scan restaurant menus</Text>
                      <Text style={styles.householdFeature}>✓  Scan history</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.householdBtn}
                    onPress={() => console.log('household tapped')}
                  >
                    <Text style={styles.householdBtnText}>Get Household</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Guardian card */}
              <View style={styles.guardianCard}>
                <View style={styles.cardInner}>
                  <View>
                    <View style={styles.bestValueBadge}>
                      <Text style={styles.bestValueText}>BEST VALUE</Text>
                    </View>
                    <Text style={styles.guardianTierLabel}>GUARDIAN</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.guardianPrice}>€11.99</Text>
                      <Text style={styles.guardianPerMonth}>/mo</Text>
                    </View>
                    <View style={styles.featureList}>
                      <Text style={styles.guardianFeature}>✓  Scan labels & restaurant menus</Text>
                      <Text style={styles.guardianFeature}>✓  Scan history</Text>
                      <Text style={styles.guardianFeature}>✓  Advanced safety verification</Text>
                      <Text style={styles.guardianFeature}>✓  Recall & safety alerts — humans & pets</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.guardianBtn}
                    onPress={() => console.log('guardian tapped')}
                  >
                    <Text style={styles.guardianBtnText}>Get Guardian</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.annualNote}>€59.99/yr Household · €94.99/yr Guardian — save 35% with annual billing</Text>

            <TouchableOpacity
              onPress={() => {
                setShowUpgradeModal(false);
                setScanMode('grocery');
              }}
            >
              <Text style={styles.upgradeLaterText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    top: '18%',
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
    marginBottom: 6,
  },
  upgradeBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#334155',
    marginBottom: 20,
  },
  upgradePrimaryBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradePrimaryText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  upgradeLaterText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  householdCard: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#F3E9DA',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
  },
  householdTierLabel: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  householdPrice: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 26,
    color: '#0F172A',
  },
  householdPerMonth: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 3,
    marginLeft: 2,
  },
  householdFeature: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#334155',
    marginBottom: 6,
  },
  householdBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  householdBtnText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 13,
    color: '#F3E9DA',
  },
  guardianCard: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
  },
  bestValueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#A3B18A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  bestValueText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  guardianTierLabel: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 14,
    color: 'rgba(243,233,218,0.6)',
    marginBottom: 4,
  },
  guardianPrice: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 26,
    color: '#F3E9DA',
  },
  guardianPerMonth: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(243,233,218,0.5)',
    marginBottom: 3,
    marginLeft: 2,
  },
  guardianFeature: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(243,233,218,0.85)',
    marginBottom: 6,
  },
  guardianBtn: {
    backgroundColor: '#F3E9DA',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  guardianBtnText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 13,
    color: '#0F172A',
  },
  cardInner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featureList: {
    flex: 1,
  },
  annualNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
});
