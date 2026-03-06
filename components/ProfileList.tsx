import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Profile } from '../types';

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
    parts.push(profile.Age_Group);
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
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2B6CB0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  type: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  summary: {
    fontSize: 12,
    color: '#A0AEC0',
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
    borderColor: '#2B6CB0',
  },
  editText: {
    fontSize: 13,
    color: '#2B6CB0',
    fontWeight: '500',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  deleteText: {
    fontSize: 13,
    color: '#E53E3E',
    fontWeight: '500',
  },
});
