import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '../types';
import { COLOURS } from '../constants/colours';

const CHIPS: { label: string; value: Profile['Age_Group'] }[] = [
  { label: 'Young infant (0–6m)',  value: 'YoungInfant_0_6m' },
  { label: 'Older infant (7–12m)', value: 'OlderInfant_7_12m' },
  { label: 'Toddler (1–3 yrs)',    value: 'Toddler_1_3y' },
  { label: 'Child (4–12 yrs)',     value: 'Child' },
  { label: 'Pregnant',             value: 'Pregnant' },
  { label: 'Breastfeeding',        value: 'Breastfeeding' },
  { label: 'Senior (65+)',         value: 'Senior' },
];

const HINTS: Partial<Record<Profile['Age_Group'], string>> = {
  YoungInfant_0_6m:  'Honey, alcohol, raw egg and unpasteurised cheese are flagged automatically for this age group.',
  OlderInfant_7_12m: 'Honey, alcohol, whole nuts and added salt are flagged automatically for this age group.',
  Toddler_1_3y:      'Alcohol, whole nuts and high caffeine are flagged automatically for this age group.',
  Pregnant:          'Pregnancy safety rules apply — alcohol, raw fish, unpasteurised cheese, caffeine.',
  Breastfeeding:     'Breastfeeding rules apply — alcohol and caffeine flagged automatically.',
};

interface Props {
  visible: boolean;
  onComplete: (profile: Profile) => void;
}

export function OnboardingSheet({ visible, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const [quickest, setQuickest] = useState(false);
  const [selectedChip, setSelectedChip] = useState<Profile['Age_Group'] | null>(null);
  const [name, setName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  const canProceed = quickest || selectedChip !== null;
  const hintText = selectedChip ? HINTS[selectedChip] : null;

  function handleQuickest() {
    setQuickest(true);
    setSelectedChip(null);
    setName('');
  }

  function handleChip(value: Profile['Age_Group']) {
    setSelectedChip(value);
    setQuickest(false);
  }

  async function handleStart() {
    const chipLabel = CHIPS.find(c => c.value === selectedChip)?.label ?? 'Me';
    const profileName = quickest ? 'Me' : (name.trim() || chipLabel);

    const profile: Profile = {
      Profile_ID:            Date.now().toString(),
      Profile_Name:          profileName,
      Profile_Type:          'Human',
      Pet_Species:           'N/A',
      Age_Group:             quickest ? 'Adult' : selectedChip!,
      Sensitivity_Level:     'Normal',
      Allergen_Framework:    'EU14',
      Allergen_Token_Version: 'EU14_v1',
      Allergy_Block_Contains: '',
      Allergy_Block_PAL:     '',
      Diet_Preference:       'None',
      Faith_Ruleset:         'None',
      Faith_Evaluated:       false,
    };

    const raw = await AsyncStorage.getItem('household_profiles').catch(() => null);
    const existing: Profile[] = raw ? (JSON.parse(raw) as Profile[]) : [];
    await AsyncStorage.setItem('household_profiles', JSON.stringify([...existing, profile]));

    const enteredName = !quickest && name.trim() ? name.trim() : '';
    setSuccessName(enteredName);
    setShowSuccess(true);
    onComplete(profile);
  }

  return (
    <>
      {/* ── Main onboarding sheet ─────────────────────────────────────── */}
      <Modal
        visible={visible && !showSuccess}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalRoot}>
          {/* Overlay — no onPress so it cannot dismiss the sheet */}
          <View style={styles.overlay} />

          {/* Sheet */}
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Handle bar */}
            <View style={styles.handle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* 1 ── Indicator tag */}
              <View style={styles.indicatorTag}>
                <View style={styles.indicatorDot} />
                <Text style={styles.indicatorText}>one step to start scanning</Text>
              </View>

              {/* 2 ── Title */}
              <Text style={styles.title}>Who are you scanning for?</Text>

              {/* 3 ── Subtitle + credibility */}
              <Text style={styles.subtitle}>
                We check foods differently depending on who you're scanning for.
              </Text>
              <Text style={[styles.subtitle, styles.subtitleCredibility]}>
                {'Examples we detect:\n• Alcohol in kombucha\n• Unpasteurised cheese\n• Raw egg in sauces'}
              </Text>

              {/* 4 ── Quickest way card */}
              <TouchableOpacity
                style={[styles.quickCard, quickest && styles.quickCardSelected]}
                onPress={handleQuickest}
                activeOpacity={0.8}
              >
                <View style={styles.quickCardBody}>
                  <Text style={[styles.quickCardTitle, quickest && styles.quickCardTitleSelected]}>
                    Quickest way — scan for me
                  </Text>
                  <Text style={[styles.quickCardSub, quickest && styles.quickCardSubSelected]}>
                    Adult profile, no restrictions
                  </Text>
                </View>
                <Text style={[styles.quickCardIcon, quickest && styles.quickCardIconSelected]}>
                  {quickest ? '✓' : '→'}
                </Text>
              </TouchableOpacity>

              {/* 5 ── Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or choose a specific profile</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 6 ── Age group chips */}
              <View style={styles.chipRow}>
                {CHIPS.map(chip => (
                  <TouchableOpacity
                    key={chip.value}
                    style={[styles.chip, selectedChip === chip.value && styles.chipSelected]}
                    onPress={() => handleChip(chip.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selectedChip === chip.value && styles.chipTextSelected]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 7 ── Contextual hint */}
              {hintText && (
                <View style={styles.hint}>
                  <Text style={styles.hintText}>{hintText}</Text>
                </View>
              )}

              {/* 8 ── Optional name field */}
              {selectedChip !== null && (
                <TextInput
                  style={[styles.nameInput, nameFocused && styles.nameInputFocused]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Emma, Baby, Me"
                  placeholderTextColor={COLOURS.TEXT_FAINT}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              )}

              {/* 9 ── CTA button */}
              <TouchableOpacity
                style={[styles.cta, !canProceed && styles.ctaDisabled]}
                onPress={handleStart}
                disabled={!canProceed}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaText}>Start scanning</Text>
              </TouchableOpacity>

              {/* 10 ── Engine note */}
              <Text style={styles.engineNote}>
                fufu needs a profile to assess products. Add more in Household any time.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Success screen ────────────────────────────────────────────── */}
      <Modal
        visible={showSuccess}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.successScreen}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>
            {successName || 'Ready to scan'}
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => setShowSuccess(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.successBtnText}>Let's go</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Modal root ────────────────────────────────────────────────────────
  modalRoot: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLOURS.PRIMARY,
    opacity: 0.5,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLOURS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLOURS.BORDER,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },

  // ── 1 Indicator tag ───────────────────────────────────────────────────
  indicatorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLOURS.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLOURS.WARN,
    marginRight: 6,
  },
  indicatorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: COLOURS.TEXT_FAINT,
  },

  // ── 2 Title ───────────────────────────────────────────────────────────
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    color: COLOURS.TEXT_PRIMARY,
    marginBottom: 4,
  },

  // ── 3 Subtitle ────────────────────────────────────────────────────────
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLOURS.TEXT_FAINT,
    marginBottom: 8,
  },
  subtitleCredibility: {
    marginBottom: 12,
  },

  // ── 4 Quickest way card ───────────────────────────────────────────────
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOURS.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  quickCardSelected: {
    backgroundColor: COLOURS.PRIMARY,
    borderWidth: 1.5,
    borderColor: COLOURS.PRIMARY,
  },
  quickCardBody: {
    flex: 1,
  },
  quickCardTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLOURS.TEXT_PRIMARY,
  },
  quickCardTitleSelected: {
    color: COLOURS.BACKGROUND,
  },
  quickCardSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLOURS.TEXT_FAINT,
    marginTop: 2,
  },
  quickCardSubSelected: {
    color: COLOURS.BACKGROUND,
    opacity: 0.75,
  },
  quickCardIcon: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: COLOURS.TEXT_FAINT,
    marginLeft: 8,
  },
  quickCardIconSelected: {
    color: COLOURS.BACKGROUND,
  },

  // ── 5 Divider ─────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLOURS.BORDER,
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: COLOURS.TEXT_FAINT,
    marginHorizontal: 8,
  },

  // ── 6 Age group chips ─────────────────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    backgroundColor: 'transparent',
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: COLOURS.PRIMARY,
    borderWidth: 1.5,
    borderColor: COLOURS.PRIMARY,
  },
  chipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
  },
  chipTextSelected: {
    color: COLOURS.BACKGROUND,
  },

  // ── 7 Contextual hint ─────────────────────────────────────────────────
  hint: {
    backgroundColor: COLOURS.CARD_BACKGROUND,
    borderLeftWidth: 3,
    borderLeftColor: COLOURS.WARN,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  hintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
  },

  // ── 8 Name field ──────────────────────────────────────────────────────
  nameInput: {
    backgroundColor: COLOURS.CARD_BACKGROUND,
    borderWidth: 1.5,
    borderColor: COLOURS.BORDER,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLOURS.TEXT_PRIMARY,
  },
  nameInputFocused: {
    borderColor: COLOURS.PRIMARY,
  },

  // ── 9 CTA button ──────────────────────────────────────────────────────
  cta: {
    backgroundColor: COLOURS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaDisabled: {
    backgroundColor: COLOURS.BORDER,
    opacity: 0.6,
  },
  ctaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: COLOURS.BACKGROUND,
    fontWeight: '600',
  },

  // ── 10 Engine note ────────────────────────────────────────────────────
  engineNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLOURS.TEXT_FAINT,
    textAlign: 'center',
  },

  // ── Success screen ────────────────────────────────────────────────────
  successScreen: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLOURS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCheck: {
    fontSize: 28,
    color: COLOURS.BACKGROUND,
  },
  successTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 24,
    color: COLOURS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 32,
  },
  successBtn: {
    backgroundColor: COLOURS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  successBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: COLOURS.BACKGROUND,
    fontWeight: '600',
  },
});
