import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileForm } from '../components/ProfileForm';
import { ProfileList } from '../components/ProfileList';
import { Profile } from '../types';
import { COLOURS } from '../constants/colours';

export default function ProfilesScreen() {
  const { profiles, load, addProfile, updateProfile, deleteProfile } =
    useProfiles();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (profile: Profile) => {
    if (editing) {
      await updateProfile(profile);
    } else {
      await addProfile(profile);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (profile: Profile) => {
    setEditing(profile);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Household</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Text style={styles.addBtnText}>+ Add member</Text>
          </TouchableOpacity>
        </View>
        <ProfileList
          profiles={profiles}
          onEdit={handleEdit}
          onDelete={deleteProfile}
        />
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editing ? 'Edit member' : 'Add member'}
            </Text>
          </View>
          <ProfileForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLOURS.TEXT_PRIMARY,
  },
  addBtn: {
    backgroundColor: COLOURS.PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: COLOURS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: COLOURS.SURFACE,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOURS.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLOURS.TEXT_PRIMARY,
  },
});
