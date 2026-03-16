import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { SafeScreen } from '../components/SafeScreen';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );
}

interface RowProps {
  label: string;
  value?: string;
  chevron?: boolean;
  labelColor?: string;
  isLast?: boolean;
  onPress?: () => void;
}

function Row({ label, value, chevron = false, labelColor, isLast = false, onPress }: RowProps) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {chevron ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Container>
  );
}

function RowGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.rowGroup}>{children}</View>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();

  function handleSignIn() {
    Alert.alert('Coming soon', 'Account sign in is coming soon.');
  }

  function handleSubscription() {
    Alert.alert('Coming soon', 'Subscriptions are coming soon.');
  }

  function handleLink(url: string) {
    Linking.openURL(url);
  }

  function handleResetHousehold() {
    Alert.alert(
      'Reset household data',
      'This will delete all household profiles. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('household_profiles');
            router.replace('/');
          },
        },
      ]
    );
  }

  return (
    <SafeScreen edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen title */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Settings</Text>
        </View>

        {/* ACCOUNT */}
        <SectionHeader label="ACCOUNT" />
        <RowGroup>
          <Row label="Sign in" chevron onPress={handleSignIn} />
          <Row
            label="Subscription"
            value="Free plan"
            chevron
            isLast
            onPress={handleSubscription}
          />
        </RowGroup>

        {/* LICENSES */}
        <SectionHeader label="LICENSES" />
        <RowGroup>
          <Row
            label="Open Food Facts"
            value="ODbL license"
            chevron
            onPress={() => handleLink('https://world.openfoodfacts.org')}
          />
          <Row label="EU Allergen Regulation" value="No 1169/2011" />
          <Row label="react-native-svg" value="MIT" />
          <Row
            label="Expo"
            value="MIT"
            chevron
            isLast
            onPress={() => handleLink('https://expo.dev')}
          />
        </RowGroup>

        {/* TERMS OF SERVICE */}
        <SectionHeader label="TERMS OF SERVICE" />
        <RowGroup>
          <Row
            label="Privacy policy"
            chevron
            onPress={() => handleLink('https://fufuapp.com/privacy')}
          />
          <Row
            label="Terms of use"
            chevron
            isLast
            onPress={() => handleLink('https://fufuapp.com/terms')}
          />
        </RowGroup>

        {/* HOUSEHOLD DATA */}
        <SectionHeader label="HOUSEHOLD DATA" />
        <RowGroup>
          <Row
            label="Reset household data"
            labelColor="#BE123C"
            isLast
            onPress={handleResetHousehold}
          />
        </RowGroup>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerWordmark}>fufu</Text>
          <Text style={styles.footerTagline}>Food, understood.</Text>
          <Text style={styles.footerAttribution}>
            {'Ingredient data provided by '}
            <Text
              style={styles.footerAttributionLink}
              onPress={() => handleLink('https://world.openfoodfacts.org')}
            >
              Open Food Facts
            </Text>
            {' licensed under ODbL.'}
          </Text>
          <Text style={styles.footerVersion}>
            v{Constants.expoConfig?.version}
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: '#F3E9DA',
  },
  screenHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  screenTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    color: '#0F172A',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 1.2,
  },
  rowGroup: {
    marginHorizontal: 16,
    backgroundColor: '#F6EFE4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A3B18A',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(163,177,138,0.4)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#0F172A',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
  },
  chevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    color: '#64748B',
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 4,
  },
  footerWordmark: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: '#0F172A',
    opacity: 0.25,
  },
  footerTagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    opacity: 0.6,
    marginTop: 4,
  },
  footerAttribution: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  footerAttributionLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#334155',
    textDecorationLine: 'underline',
  },
  footerVersion: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    opacity: 0.5,
    marginTop: 8,
  },
});
