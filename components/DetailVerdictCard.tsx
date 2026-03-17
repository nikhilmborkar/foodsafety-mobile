import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLOURS } from '../constants/colours';
import { TYPOGRAPHY } from '../constants/typography';
import { EvaluateResponse, EvaluationOutput } from '../types';
import { MemberResult } from '../types/verdict';
import { VERDICT_COLORS } from '../lib/verdictUtils';
import { OutcomeBadge } from './OutcomeBadge';
import { API_BASE_URL } from '../constants/api';

// ─── Signal → consumer-facing explanation ────────────────────────────────────
// Mirrors WhyPanel exactly — do NOT diverge from this source of truth.

const SIGNAL_EXPLANATIONS: Record<string, string> = {
  'milk.contains':             'Contains milk.',
  'peanuts.contains':          'Contains peanuts.',
  'gluten_cereals.contains':   'Contains gluten.',
  'tree_nuts.contains':        'Contains tree nuts.',
  'eggs.contains':             'Contains eggs.',
  'fish.contains':             'Contains fish.',
  'crustaceans.contains':      'Contains crustaceans.',
  'molluscs.contains':         'Contains molluscs.',
  'soybeans.contains':         'Contains soy.',
  'sesame.contains':           'Contains sesame.',
  'celery.contains':           'Contains celery.',
  'mustard.contains':          'Contains mustard.',
  'lupin.contains':            'Contains lupin.',
  'sulphur_dioxide.contains':  'Contains sulphur dioxide / sulphites.',

  'milk.may_contain':            'May contain milk (precautionary label).',
  'peanuts.may_contain':         'May contain peanuts (precautionary label).',
  'gluten_cereals.may_contain':  'May contain gluten (precautionary label).',
  'tree_nuts.may_contain':       'May contain tree nuts (precautionary label).',
  'eggs.may_contain':            'May contain eggs (precautionary label).',
  'fish.may_contain':            'May contain fish (precautionary label).',
  'crustaceans.may_contain':     'May contain crustaceans (precautionary label).',
  'molluscs.may_contain':        'May contain molluscs (precautionary label).',
  'soybeans.may_contain':        'May contain soy (precautionary label).',
  'sesame.may_contain':          'May contain sesame (precautionary label).',
  'celery.may_contain':          'May contain celery (precautionary label).',
  'mustard.may_contain':         'May contain mustard (precautionary label).',
  'lupin.may_contain':           'May contain lupin (precautionary label).',
  'sulphur_dioxide.may_contain': 'May contain sulphur dioxide / sulphites (precautionary label).',

  'xylitol.toxic.definite':        'Contains xylitol — highly toxic to dogs.',
  'grapes_raisins.toxic.definite': 'Contains grapes or raisins — toxic to dogs.',
  'chocolate.toxic.definite':      'Contains chocolate — toxic to pets.',
  'onion_garlic.toxic.definite':   'Contains onion or garlic — toxic to pets.',
  'macadamia_nuts.toxic.definite': 'Contains macadamia nuts — toxic to dogs.',
  'alcohol.toxic.definite':        'Contains alcohol — toxic to pets.',
  'hops.toxic.definite':           'Contains hops — highly toxic to dogs.',
  'caffeine.toxic.definite':       'Contains caffeine — toxic to pets.',
  'raw_dough_yeast.toxic.definite':'Contains raw dough or yeast — toxic to dogs.',
  'avocado_persin.toxic.definite': 'Contains avocado — possible toxicity risk for dogs.',

  'xylitol.definite':        'Contains xylitol — highly toxic to dogs.',
  'grapes_raisins.definite': 'Contains grapes or raisins — toxic to pets.',
  'chocolate.definite':      'Contains chocolate — toxic to pets.',
  'onion_garlic.definite':   'Contains onion or garlic — toxic to pets.',
  'macadamia_nuts.definite': 'Contains macadamia nuts — toxic to dogs.',
  'alcohol.definite':        'Contains alcohol — toxic to pets.',
  'hops.definite':           'Contains hops — highly toxic to dogs.',
  'caffeine.definite':       'Contains caffeine — toxic to pets.',
  'raw_dough_yeast.definite':'Contains raw dough or yeast — toxic to dogs.',
  'avocado_persin.definite': 'Contains avocado — possible toxicity risk for dogs.',

  'xylitol.probable':        'May contain xylitol — highly toxic to dogs.',
  'grapes_raisins.probable': 'May contain grapes or raisins — toxic to pets.',
  'chocolate.probable':      'May contain chocolate — toxic to pets.',
  'onion_garlic.probable':   'May contain onion or garlic — toxic to pets.',
  'macadamia_nuts.probable': 'May contain macadamia nuts — toxic to dogs.',
  'alcohol.probable':        'May contain alcohol — toxic to pets.',
  'caffeine.probable':       'May contain caffeine — toxic to pets.',
  'avocado_persin.probable': 'Contains avocado — possible toxicity risk for dogs.',
  'avocado_persin.caution':  'Contains avocado — possible toxicity risk for dogs.',
  'grapes_raisins.caution':  'Contains grapes or raisins — possible toxicity risk for cats.',

  'faith.pork':                   'Contains pork.',
  'faith.alcohol':                'Contains alcohol.',
  'faith.shellfish':              'Contains shellfish.',
  'faith.beef':                   'Contains beef.',
  'faith.root_vegetables':        'Contains root vegetables.',
  'faith.honey':                  'Contains honey.',
  'faith.fermentation_microbes':  'Contains fermentation-derived ingredients.',
  'faith.non_halal_gelatin':       'Contains gelatin of uncertain Halal suitability.',
  'faith.non_halal_enzymes':       'Contains enzymes of uncertain Halal suitability.',
  'faith.gelatin_unknown_source':  'Contains gelatin of uncertain Kosher suitability.',
  'faith.enzymes_unknown_source':  'Contains enzymes of uncertain Kosher suitability.',
  'faith.meat_dairy_mixture':      'Contains a meat and dairy combination.',

  'diet.animal_products':   'Contains animal-derived ingredients.',
  'diet.honey':             'Contains honey.',
  'diet.meat':              'Contains meat.',
  'diet.high_sugar':        'High in sugar.',
  'diet.grains':            'Contains grains.',
  'diet.legumes':           'Contains legumes.',
  'diet.added_sugar':       'Contains added sugar.',
  'diet.high_fodmap':       'May contain high-FODMAP ingredients.',
  'diet.ultra_processed':   'May be ultra-processed.',
  'diet.high_sodium':       'May be high in sodium.',
  'diet.plant_ingredients': 'Contains plant-based ingredients.',
  'diet.gelatin':           'Contains gelatin (animal-derived).',
  'diet.carmine':           'Contains carmine (insect-derived colorant).',
  'diet.casein':            'Contains casein or caseinate (dairy-derived).',
  'diet.whey':              'Contains whey (dairy-derived).',
  'diet.animal_derivatives':'Contains an animal-derived ingredient (not from meat).',

  'life_stage.honey_detected':           'Contains honey — not safe for infants under 12 months.',
  'life_stage.alcohol_detected':         'Contains alcohol.',
  'life_stage.added_salt':               'Contains added salt.',
  'life_stage.added_sugar':              'Contains added sugar.',
  'life_stage.whole_nuts':               'Contains whole nuts — choking hazard.',
  'life_stage.cows_milk_main_drink':     "Contains cow's milk — not suitable as a main drink under 12 months.",
  'life_stage.raw_egg_detected':         'Contains raw egg — Salmonella risk.',
  'life_stage.unpasteurised_soft_cheese':'Contains unpasteurised soft cheese — Listeria risk.',
  'life_stage.high_mercury_fish':        'Contains high-mercury fish.',
  'life_stage.raw_fish_sushi':           'Contains raw fish — avoid during pregnancy.',
  'life_stage.raw_undercooked_meat':     'Contains raw or undercooked meat — avoid during pregnancy.',
  'life_stage.liver_pate':              'Contains liver or pâté — high in vitamin A, avoid during pregnancy.',
  'life_stage.high_caffeine':            'High caffeine content.',
  'life_stage.liquorice_root':           'Contains liquorice root.',

  'tag.physical_hazard_bones':                    'Contains or may contain bones — handle with care.',
  'tag.physical_hazard_pits_shells_stones':       'Contains or may contain pits, shells, or stones.',
  'tag.choking_hazard_under_3':                   'Labelled as a choking hazard — not suitable for children under 3.',
  'tag.safe_handling_cook_thoroughly':            'Must be cooked thoroughly before eating.',
  'tag.safe_handling_keep_refrigerated':          'Requires refrigeration — check storage conditions.',
  'tag.safe_handling_consume_by_date':            'Check the consume-by date before eating.',
  'tag.high_caffeine_not_for_children':           'High caffeine — not suitable for children.',
  'tag.high_caffeine_pregnancy_breastfeeding':    'High caffeine — limit during pregnancy or breastfeeding.',
  'tag.polyols_laxative':                         'Contains sweeteners that may have a laxative effect.',
  'tag.artificial_colours_child_activity_warning':'Contains artificial colours linked to hyperactivity in children.',
  'tag.supplement_pregnancy_consult_doctor':      'This is a supplement — consult a doctor before use during pregnancy.',
  'tag.supplement_not_for_pregnancy':             'This supplement is not safe during pregnancy.',
  'tag.alcohol_pregnancy_warning':                'Contains alcohol — avoid during pregnancy.',

  'product_domain.pet_food': 'This is a pet food product — not intended for human consumption.',
};

const RULE_EXPLANATIONS: Record<string, string> = {
  PJ001: 'Contains an allergen listed in this profile.',
  PJ002: 'May contain an allergen, and this profile treats trace warnings as definite.',
  PJ003: 'May contain an allergen (precautionary warning on label).',
  PJ004: 'Contains an ingredient that is toxic to this pet.',
  PJ005: 'Contains an ingredient that may be harmful to this pet.',
  R020: 'Contains or may contain bones — handle with care.',
  R021: 'Contains or may contain bones — not suitable for babies or toddlers.',
  R022: 'Contains or may contain pits, shells, or stones — handle with care.',
  R023: 'Labelled as a choking hazard — not suitable for children under 3.',
  R030: 'Must be cooked thoroughly before eating.',
  R031: 'Requires refrigeration — check storage conditions.',
  R032: 'Check the consume-by date before eating.',
  R040: 'Contains high levels of caffeine — not suitable for children.',
  R041: 'Contains high levels of caffeine — limit during pregnancy or breastfeeding.',
  R042: 'Contains sweeteners that may have a laxative effect in large amounts.',
  R043: 'Contains artificial colours linked to hyperactivity in children.',
  R050: 'This is a supplement — consult a doctor before use during pregnancy.',
  R051: 'This supplement is not safe during pregnancy.',
  R060: 'Contains alcohol — avoid during pregnancy.',
  R200: 'Contains xylitol, which is highly toxic to dogs.',
  R201: 'Contains grapes or raisins, which are toxic to dogs.',
  R202: 'Contains chocolate, which is toxic to dogs.',
  R203: 'Contains onion or garlic, which are toxic to dogs.',
  R204: 'Contains macadamia nuts, which are toxic to dogs.',
  R205: 'Contains alcohol, which is toxic to dogs.',
  R206: 'Contains caffeine, which is toxic to dogs.',
  R207: 'Contains hops, which are highly toxic to dogs.',
  R208: 'Contains avocado, which may be harmful to dogs.',
  R209: 'Contains raw dough or yeast, which is toxic to dogs.',
  R210: 'May contain an ingredient that is toxic to dogs.',
  R220: 'Contains chocolate, which is toxic to cats.',
  R221: 'Contains onion or garlic, which are toxic to cats.',
  R222: 'Contains caffeine, which is toxic to cats.',
  R223: 'Contains alcohol, which is toxic to cats.',
  R224: 'Contains grapes or raisins, which may be harmful to cats.',
  R229: 'May contain an ingredient that is toxic to cats.',
  R300: 'Contains pork or alcohol, which conflicts with this Halal profile.',
  R301: 'Contains gelatin or enzymes of uncertain Halal suitability.',
  R302: 'Contains pork, shellfish, or a meat-and-dairy combination, which conflicts with this Kosher profile.',
  R303: 'Contains gelatin or enzymes of uncertain Kosher suitability.',
  R304: 'Contains beef, which conflicts with this Hindu profile.',
  R305: 'Contains root vegetables, which conflict with this Jain profile.',
  R306: 'Contains honey or fermentation-derived ingredients, which may conflict with this Jain profile.',
  R400: 'Contains an animal-derived ingredient, which conflicts with this Vegan profile.',
  R401: 'Contains an animal-derived ingredient, which conflicts with this Vegetarian profile.',
  R402: 'Contains meat, which conflicts with a Pescatarian diet.',
  R403: 'Contains high sugar, which conflicts with a Keto diet.',
  R404: 'Contains grains or legumes, which conflict with a Paleo diet.',
  R405: 'Contains added sugar, grains, or legumes, which conflict with a Whole30 diet.',
  R406: 'May contain high-FODMAP ingredients.',
  R407: 'Contains meat — flagged for a Flexitarian preference.',
  R408: 'May be ultra-processed, which conflicts with a Mediterranean diet.',
  R409: 'May be high in sodium, which conflicts with a DASH diet.',
  R410: 'Contains plant-based ingredients, which conflict with a Carnivore diet.',
  R500: 'This is a pet food product — not suitable for babies or toddlers.',
  R501: 'This is a pet food product — not intended for human consumption.',
  R600: 'Contains honey — not safe for infants under 12 months.',
  R601: 'Contains alcohol — not safe for infants.',
  R602: 'Contains added salt — not recommended for babies.',
  R603: 'Contains added sugar — not recommended for babies.',
  R604: 'Contains whole nuts — a choking hazard for babies.',
  R605: "Contains cow's milk — not suitable as a main drink for babies under 12 months.",
  R606: 'Contains raw egg — not safe for babies.',
  R607: 'Contains unpasteurised soft cheese — not safe for babies.',
  R608: 'Contains fish that may be high in mercury — limit for babies.',
  R610: 'Contains whole nuts — a choking hazard for toddlers.',
  R611: 'Contains added salt — limit for toddlers.',
  R612: 'Contains added sugar — limit for toddlers.',
  R613: 'Contains alcohol — not safe for toddlers.',
  R614: 'Contains raw egg — not safe for toddlers.',
  R615: 'Contains fish that may be high in mercury — limit for toddlers.',
  R616: 'Contains high levels of caffeine — not suitable for toddlers.',
  R620: 'Contains alcohol — avoid during pregnancy.',
  R621: 'Contains raw fish — avoid during pregnancy.',
  R622: 'Contains raw or undercooked meat — avoid during pregnancy.',
  R623: 'Contains raw egg — avoid during pregnancy.',
  R624: 'Contains unpasteurised soft cheese — avoid during pregnancy.',
  R625: 'Contains liver or pâté — avoid during pregnancy due to high vitamin A.',
  R626: 'Contains high levels of caffeine — limit during pregnancy.',
  R627: 'Contains liquorice root — avoid during pregnancy.',
  R628: 'Contains fish that may be high in mercury — limit during pregnancy.',
  R630: 'Contains alcohol — exercise caution while breastfeeding.',
  R631: 'Contains high levels of caffeine — limit while breastfeeding.',
};

function glutenExplanation(
  signal: 'gluten_cereals.contains' | 'gluten_cereals.may_contain',
  sources: string[] | undefined
): string {
  if (!sources || sources.length === 0) {
    return SIGNAL_EXPLANATIONS[signal];
  }
  const grainList = sources.join(', ');
  return signal === 'gluten_cereals.contains'
    ? `Contains ${grainList}.`
    : `May contain ${grainList} (precautionary label).`;
}

function buildExplanations(evaluation: EvaluationOutput): string[] {
  const signals = evaluation.Matched_Signals ?? [];
  const ruleIds = evaluation.Matched_Rule_IDs ?? [];
  const glutenSources = evaluation.Allergen_Source_Details?.gluten_cereals;
  const seen = new Set<string>();
  const results: string[] = [];

  function push(text: string): void {
    if (!seen.has(text)) {
      seen.add(text);
      results.push(text);
    }
  }

  for (const signal of signals) {
    if (signal === 'gluten_cereals.contains' || signal === 'gluten_cereals.may_contain') {
      push(glutenExplanation(signal, glutenSources));
    } else {
      const text = SIGNAL_EXPLANATIONS[signal];
      if (text) push(text);
    }
  }

  if (results.length === 0) {
    for (const id of ruleIds) {
      const text = RULE_EXPLANATIONS[id];
      if (text) push(text);
    }
  }

  return results;
}

function confidenceLabel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

const CONFIDENCE_COLOURS: Record<string, string> = {
  High:   COLOURS.ALLOW,
  Medium: COLOURS.WARN,
  Low:    COLOURS.BLOCK,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FlagState = 'idle' | 'sending' | 'confirmed' | 'error';

interface Props {
  member: MemberResult;
  evaluation: EvaluateResponse['evaluations'][number];
  isWarn: boolean;
  initiallyExpanded?: boolean;
  scanLogId?: number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

function DetailVerdictCardInner({ member, evaluation, isWarn, scanLogId }: Props) {
  const [flagState, setFlagState] = useState<FlagState>('idle');
  const borderColor = VERDICT_COLORS[member.verdict];
  const explanations = buildExplanations(evaluation);
  const score = evaluation.Confidence_Score;
  const confLabel = confidenceLabel(score);
  const signals = evaluation.Matched_Signals ?? [];

  async function handleFlag() {
    if (!scanLogId || flagState === 'sending') return;
    setFlagState('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/scan-logs/${scanLogId}/flag`, {
        method: 'POST',
      });
      setFlagState(res.ok ? 'confirmed' : 'error');
    } catch {
      setFlagState('error');
    }
  }

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      {/* Avatar + name + badge */}
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: borderColor }]}>
          <Text style={styles.avatarText}>{member.memberInitial}</Text>
        </View>
        <View style={styles.topInfo}>
          <Text style={styles.name}>{member.memberName}</Text>
          <OutcomeBadge outcome={evaluation.Outcome} />
        </View>
      </View>

      {/* Explanation summary */}
      {member.explanation ? (
        <Text style={styles.explanationText}>{member.explanation}</Text>
      ) : null}

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Based on available product data and your household profiles. Always check the label.
      </Text>

      {/* WARN advisory */}
      {isWarn && (
        <View style={styles.warnBox}>
          <Text style={styles.warnBoxText}>
            Review the flagged items below before giving this product to {member.memberName}.
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Decision section — always visible */}
      <Text style={styles.sectionLabel}>DECISION</Text>

      {explanations.length > 0 ? (
        explanations.map((text, i) => (
          <Text key={i} style={styles.ruleItem}>{'• '}{text}</Text>
        ))
      ) : signals.length === 0 && evaluation.Outcome === 'ALLOW' ? (
        <Text style={styles.ruleItem}>
          No known conflicts detected for this profile based on available data.
        </Text>
      ) : (evaluation.Outcome as string) === 'INCONCLUSIVE' ? (
        <Text style={styles.ruleItem}>
          Not enough ingredient data was available to complete this check.
        </Text>
      ) : (
        <Text style={styles.ruleItem}>
          A safety concern was detected for this profile.
        </Text>
      )}

      {/* Confidence section */}
      <View style={styles.confidenceSection}>
        <Text style={styles.sectionLabel}>DATA CONFIDENCE</Text>
        <View style={styles.confidenceRow}>
          <View style={[styles.confidenceBadge, { backgroundColor: CONFIDENCE_COLOURS[confLabel] }]}>
            <Text style={styles.confidenceBadgeText}>{confLabel}</Text>
          </View>
          {score < 50 && (
            <Text style={styles.confidenceNote}>
              Some product data was incomplete — check the label manually.
            </Text>
          )}
        </View>
      </View>

      {/* Flag button */}
      {scanLogId != null && (
        <View style={styles.flagRow}>
          {flagState === 'confirmed' ? (
            <Text style={styles.flagConfirmed}>Thanks — we'll review this result.</Text>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.flagBtn, flagState === 'sending' && styles.flagBtnDisabled]}
                onPress={handleFlag}
                disabled={flagState === 'sending'}
                activeOpacity={0.7}
              >
                <Text style={styles.flagBtnText}>Report incorrect result</Text>
              </TouchableOpacity>
              {flagState === 'error' && (
                <Text style={styles.flagError}>Couldn't send report — try again.</Text>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

export const DetailVerdictCard = React.memo(DetailVerdictCardInner);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLOURS.CARD_BACKGROUND,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...TYPOGRAPHY.subheading,
    fontSize: 15,
    color: COLOURS.WHITE,
  },
  topInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...TYPOGRAPHY.heading,
    fontSize: 20,
    color: COLOURS.TEXT_PRIMARY,
  },
  explanationText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLOURS.TEXT_MID,
    lineHeight: 20,
    marginBottom: 6,
  },
  disclaimer: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLOURS.TEXT_FAINT,
    lineHeight: 16,
    marginBottom: 10,
  },
  warnBox: {
    backgroundColor: COLOURS.WARN_BG,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  warnBoxText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLOURS.WARN_TEXT,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLOURS.BORDER,
    marginBottom: 12,
  },
  sectionLabel: {
    ...TYPOGRAPHY.subheading,
    fontSize: 11,
    color: COLOURS.TEXT_SECONDARY,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  ruleItem: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLOURS.TEXT_MID,
    lineHeight: 19,
    marginBottom: 3,
  },
  confidenceSection: {
    borderTopWidth: 1,
    borderTopColor: COLOURS.BORDER,
    marginTop: 12,
    paddingTop: 10,
    gap: 6,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
  },
  confidenceBadgeText: {
    ...TYPOGRAPHY.subheading,
    fontSize: 12,
    color: COLOURS.WHITE,
    letterSpacing: 0.3,
  },
  confidenceNote: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
    flex: 1,
  },
  flagRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLOURS.BORDER,
    paddingTop: 10,
  },
  flagBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOURS.BORDER_SUBTLE,
  },
  flagBtnDisabled: {
    opacity: 0.5,
  },
  flagBtnText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
  },
  flagConfirmed: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
  },
  flagError: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.BLOCK,
    marginTop: 4,
  },
});
