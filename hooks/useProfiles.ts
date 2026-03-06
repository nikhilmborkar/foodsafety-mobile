import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { Profile } from '../types';

const STORAGE_KEY = 'household_profiles';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setProfiles(raw ? (JSON.parse(raw) as Profile[]) : []);
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
