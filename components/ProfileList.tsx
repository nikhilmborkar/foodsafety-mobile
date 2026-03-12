import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Profile } from '../types';
import { COLOURS } from '../constants/colours';
import { TYPOGRAPHY } from '../constants/typography';
import { AGE_GROUP_LABELS } from '../constants/ageGroups';

interface Props {
  profiles: Profile[];
  onEdit: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

function profileSummary(profile: Profile): string {
  const parts: string[] = [];
  if (profile.Profile_Type === 'Pet') {
    parts.push(profile.Pet_Species);
  } else {
    parts.push(AGE_GROUP_LABELS[profile.Age_Group] ?? profile.Age_Group);
  }
  const allergens = profile.Allergy_Block_Contains.split(';').filter(Boolean);
  if (allergens.length > 0) {
    const shown = allergens.slice(0, 2).join(', ');
    const extra = allergens.length > 2 ? ` +${allergens.length - 2}` : '';
    parts.push(`Blocks: ${shown}${extra}`);
  }
  return parts.join(' · ');
}

export function ProfileList({ profiles, onEdit, onDelete }: Props) {
  if (profiles.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No household members yet.</Text>
        <Text style={styles.emptySubtext}>Tap "Add member" to get started.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={profiles}
      keyExtractor={p => p.Profile_ID}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.Profile_Name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.Profile_Name}</Text>
            <Text style={styles.type}>
              {item.Profile_Type} · {item.Sensitivity_Level}
            </Text>
            <Text style={styles.summary}>{profileSummary(item)}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(item.Profile_ID)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 16,
    color: COLOURS.TEXT_MID,
    fontWeight: '500',
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLOURS.TEXT_FAINT,
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOURS.SURFACE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',               // shadow color — no semantic token
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOURS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...TYPOGRAPHY.heading,
    color: COLOURS.WHITE,
    fontWeight: '700',
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.subheading,
    fontSize: 16,
    fontWeight: '600',
    color: COLOURS.TEXT_PRIMARY,
  },
  type: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLOURS.TEXT_SECONDARY,
    marginTop: 2,
  },
  summary: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_FAINT,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'column',
    gap: 6,
    marginLeft: 8,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOURS.PRIMARY,
  },
  editText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLOURS.PRIMARY,
    fontWeight: '500',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOURS.BLOCK,
  },
  deleteText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLOURS.BLOCK,
    fontWeight: '500',
  },
});
