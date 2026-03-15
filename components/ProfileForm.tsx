import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Profile } from '../types';
import { EU14_ALLERGENS, PET_DOG_ALLERGENS, PET_CAT_ALLERGENS } from '../constants/allergens';
import { COLOURS } from '../constants/colours';
import { AGE_GROUP_LABELS } from '../constants/ageGroups';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  initial?: Partial<Profile>;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}

const AGE_GROUPS: { value: Profile['Age_Group']; label: string }[] = [
  { value: 'YoungInfant_0_6m',  label: AGE_GROUP_LABELS['YoungInfant_0_6m'] },
  { value: 'OlderInfant_7_12m', label: AGE_GROUP_LABELS['OlderInfant_7_12m'] },
  { value: 'Toddler_1_3y',      label: 'Toddler (1–3 years)' },
  { value: 'Child',             label: 'Child (4–12 years)' },
  { value: 'Teen',              label: 'Teen (13–17 years)' },
  { value: 'Adult',             label: 'Adult' },
  { value: 'Senior',            label: 'Senior (65+)' },
  { value: 'Pregnant',          label: 'Pregnant' },
  { value: 'Breastfeeding',     label: 'Breastfeeding' },
];

const LIFE_STAGE_NOTES: Partial<Record<Profile['Age_Group'], string>> = {
  YoungInfant_0_6m:  '⚠️ Automatic safety rules apply for this age group — honey, alcohol, choking hazards',
  OlderInfant_7_12m: '⚠️ Automatic safety rules apply for this age group — honey, alcohol, choking hazards',
  Baby_0_12m:        '⚠️ Automatic safety rules apply for this age group — honey, alcohol, choking hazards',
  Toddler_1_3y:      '⚠️ Automatic safety rules apply for this age group — honey, alcohol, choking hazards',
  Pregnant:          '⚠️ Pregnancy safety rules apply — alcohol, raw fish, unpasteurised cheese, caffeine',
  Breastfeeding:     '⚠️ Breastfeeding rules apply — alcohol and caffeine flagged automatically',
};
const PET_SPECIES: Array<'Dog' | 'Cat'> = ['Dog', 'Cat'];
const SENSITIVITY: Profile['Sensitivity_Level'][] = ['Normal', 'Strict'];
const DIET_OPTIONS = ['None', 'Vegan', 'Vegetarian', 'Pescatarian'];
const FAITH_OPTIONS = ['None', 'Halal', 'Kosher', 'Hindu'];

export function ProfileForm({ initial, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initial?.Profile_Name ?? '');
  const [type, setType] = useState<'Human' | 'Pet'>(
    initial?.Profile_Type ?? 'Human'
  );
  const [species, setSpecies] = useState<'Dog' | 'Cat'>(
    (initial?.Pet_Species as 'Dog' | 'Cat') ?? 'Dog'
  );
  const [ageGroup, setAgeGroup] = useState<Profile['Age_Group']>(
    initial?.Age_Group ?? 'Adult'
  );
  const [sensitivity, setSensitivity] = useState<Profile['Sensitivity_Level']>(
    initial?.Sensitivity_Level ?? 'Normal'
  );
  const [allergyContains, setAllergyContains] = useState<string[]>(
    initial?.Allergy_Block_Contains
      ? initial.Allergy_Block_Contains.split(';').filter(Boolean)
      : []
  );
  const [allergyPAL, setAllergyPAL] = useState<string[]>(
    initial?.Allergy_Block_PAL
      ? initial.Allergy_Block_PAL.split(';').filter(Boolean)
      : []
  );
  const [diet, setDiet] = useState(initial?.Diet_Preference ?? 'None');
  const [faith, setFaith] = useState(initial?.Faith_Ruleset ?? 'None');

  const availableAllergens =
    type === 'Pet'
      ? species === 'Dog'
        ? PET_DOG_ALLERGENS
        : PET_CAT_ALLERGENS
      : EU14_ALLERGENS;

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    id: string
  ) => {
    setList(
      list.includes(id) ? list.filter(a => a !== id) : [...list, id]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const profile: Profile = {
      Profile_ID:
        initial?.Profile_ID ??
        (type === 'Pet' ? `PET${Date.now()}` : `P${Date.now()}`),
      Profile_Name: name.trim(),
      Profile_Type: type,
      Pet_Species: type === 'Pet' ? species : 'N/A',
      Age_Group: type === 'Human' ? ageGroup : 'Adult',
      Sensitivity_Level: sensitivity,
      Allergen_Framework: 'EU14',
      Allergen_Token_Version: 'EU14_v1',
      Allergy_Block_Contains: allergyContains.join(';'),
      Allergy_Block_PAL: allergyPAL.join(';'),
      Diet_Preference: diet,
      Faith_Ruleset: faith,
      Faith_Evaluated: faith !== 'None',
    };
    onSave(profile);
  };

  return (
    <>
      <View style={[styles.formHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.formTitle}>
          {initial?.Profile_ID ? 'Edit member' : 'Add member'}
        </Text>
      </View>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Emma or Max"
        placeholderTextColor={COLOURS.TEXT_FAINT}
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.segmentRow}>
        {(['Human', 'Pet'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.segment, type === t && styles.segmentActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === 'Pet' && (
        <>
          <View style={styles.toxinNote}>
            <Text style={styles.toxinNoteText}>
              Pet safety: common human food toxins (xylitol, grapes, onions,
              chocolate, etc.) are automatically checked for dogs and cats.
            </Text>
          </View>
          <Text style={styles.label}>Species</Text>
          <View style={styles.segmentRow}>
            {PET_SPECIES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.segment, species === s && styles.segmentActive]}
                onPress={() => setSpecies(s)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    species === s && styles.segmentTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {type === 'Human' && (
        <>
          <Text style={styles.label}>Age Group</Text>
          <View style={styles.chipRow}>
            {AGE_GROUPS.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                style={[styles.chip, ageGroup === value && styles.chipActive]}
                onPress={() => setAgeGroup(value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    ageGroup === value && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {LIFE_STAGE_NOTES[ageGroup] && (
            <View style={styles.lifeStageNote}>
              <Text style={styles.lifeStageNoteText}>
                {LIFE_STAGE_NOTES[ageGroup]}
              </Text>
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>Sensitivity Level</Text>
      <View style={styles.segmentRow}>
        {SENSITIVITY.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.segment, sensitivity === s && styles.segmentActive]}
            onPress={() => setSensitivity(s)}
          >
            <Text
              style={[
                styles.segmentText,
                sensitivity === s && styles.segmentTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Allergens — Block (Contains)</Text>
      <Text style={styles.helperText}>
        {type === 'Pet'
          ? 'Select ingredients your pet is allergic to.'
          : 'Select allergens as labelled on EU food packaging'}
      </Text>
      <View style={styles.chipRow}>
        {availableAllergens.map(a => (
          <TouchableOpacity
            key={a.id}
            style={[
              styles.chip,
              allergyContains.includes(a.id) && styles.chipActive,
            ]}
            onPress={() => toggleItem(allergyContains, setAllergyContains, a.id)}
          >
            <Text
              style={[
                styles.chipText,
                allergyContains.includes(a.id) && styles.chipTextActive,
              ]}
            >
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Allergens — Block (May Contain / PAL)</Text>
      <Text style={styles.helperText}>
        {type === 'Pet'
          ? 'Ingredients to flag as caution for your pet.'
          : 'Select allergens as labelled on EU food packaging'}
      </Text>
      <View style={styles.chipRow}>
        {availableAllergens.map(a => (
          <TouchableOpacity
            key={a.id}
            style={[
              styles.chip,
              allergyPAL.includes(a.id) && styles.chipActive,
            ]}
            onPress={() => toggleItem(allergyPAL, setAllergyPAL, a.id)}
          >
            <Text
              style={[
                styles.chipText,
                allergyPAL.includes(a.id) && styles.chipTextActive,
              ]}
            >
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === 'Human' && (
        <>
          <Text style={styles.label}>Diet Preference</Text>
          <View style={styles.chipRow}>
            {DIET_OPTIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, diet === d && styles.chipActive]}
                onPress={() => setDiet(d)}
              >
                <Text
                  style={[styles.chipText, diet === d && styles.chipTextActive]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Faith Ruleset</Text>
          <View style={styles.chipRow}>
            {FAITH_OPTIONS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, faith === f && styles.chipActive]}
                onPress={() => setFaith(f)}
              >
                <Text
                  style={[styles.chipText, faith === f && styles.chipTextActive]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  formHeader: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: COLOURS.BACKGROUND,
  },
  formTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    fontWeight: '700',
    color: COLOURS.TEXT_PRIMARY,
  },
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLOURS.BACKGROUND,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '600',
    color: COLOURS.TEXT_MID,
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLOURS.TEXT_PRIMARY,
    backgroundColor: COLOURS.CARD_BACKGROUND,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    backgroundColor: COLOURS.CARD_BACKGROUND,
  },
  segmentActive: {
    backgroundColor: COLOURS.PRIMARY,
    borderColor: COLOURS.PRIMARY,
  },
  segmentText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLOURS.TEXT_MID,
    fontWeight: '500',
  },
  segmentTextActive: {
    fontFamily: 'Inter_500Medium',
    color: COLOURS.WHITE,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLOURS.CARD_BACKGROUND,
  },
  chipActive: {
    backgroundColor: COLOURS.PRIMARY,
    borderColor: COLOURS.PRIMARY,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLOURS.TEXT_MID,
  },
  chipTextActive: {
    fontFamily: 'Inter_500Medium',
    color: COLOURS.WHITE,
    fontWeight: '600',
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
    marginBottom: 6,
  },
  lifeStageNote: {
    backgroundColor: COLOURS.INFO_BG,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLOURS.INFO_ACCENT,
  },
  lifeStageNoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLOURS.INFO_TEXT,
    lineHeight: 18,
  },
  toxinNote: {
    backgroundColor: COLOURS.WARN_BG,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLOURS.WARN,
  },
  toxinNoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLOURS.WARN_TEXT,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: COLOURS.TEXT_MID,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLOURS.PRIMARY,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: COLOURS.TEXT_FAINT,
  },
  saveText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: COLOURS.WHITE,
    fontWeight: '600',
  },
});
