import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileForm } from '../components/ProfileForm';
import { ProfileList } from '../components/ProfileList';
import { Profile } from '../types';
import { COLOURS } from '../constants/colours';
import { TYPOGRAPHY } from '../constants/typography';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { SafeScreen } from '../components/SafeScreen';

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
    <SafeScreen edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>fufu</Text>
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
        <SafeAreaViewRN style={{ flex: 1, backgroundColor: COLOURS.BACKGROUND }}>
          <View style={[styles.modal, { backgroundColor: COLOURS.BACKGROUND }]}>
            <ProfileForm
              initial={editing ?? undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </View>
        </SafeAreaViewRN>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 16,
  },
  wordmark: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 42,
    lineHeight: 48,
    color: COLOURS.PRIMARY,
    letterSpacing: -1.5,
    textAlign: 'left',
  },
  addBtn: {
    backgroundColor: COLOURS.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 15,
    color: COLOURS.WHITE,
    letterSpacing: -0.3,
  },
  modal: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOURS.BORDER,
  },
  modalTitle: {
    ...TYPOGRAPHY.subheading,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    fontWeight: '700',
    color: COLOURS.TEXT_PRIMARY,
  },
});
