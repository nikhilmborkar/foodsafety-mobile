import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { Profile } from '../types';

const STORAGE_KEY = 'household_profiles';

// Migrate legacy Age_Group values from older app installs.
// Baby_0_12m was split into YoungInfant_0_6m / OlderInfant_7_12m.
// We map it to OlderInfant_7_12m (7–12m rules are the safer superset).
function migrateProfile(raw: unknown): Profile {
  const p = raw as Profile & { Age_Group: string };
  if ((p.Age_Group as string) === 'Baby_0_12m') {
    return { ...p, Age_Group: 'OlderInfant_7_12m' };
  }
  return p as Profile;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setProfiles([]);
        return;
      }
      const rawItems = JSON.parse(raw) as unknown[];
      const parsed = rawItems.map(migrateProfile);
      // Persist back if any profile was migrated so the fix is stored.
      const anyMigrated = parsed.some(
        (p, i) => p.Age_Group !== (rawItems[i] as Profile).Age_Group
      );
      if (anyMigrated) {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)).catch(() => {});
      }
      setProfiles(parsed);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProfile = useCallback(async (profile: Profile) => {
    setProfiles(prev => {
      const updated = [...prev, profile];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const updateProfile = useCallback(async (profile: Profile) => {
    setProfiles(prev => {
      const updated = prev.map(p =>
        p.Profile_ID === profile.Profile_ID ? profile : p
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const deleteProfile = useCallback(async (id: string) => {
    setProfiles(prev => {
      const updated = prev.filter(p => p.Profile_ID !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  return { profiles, loading, load, addProfile, updateProfile, deleteProfile };
}
