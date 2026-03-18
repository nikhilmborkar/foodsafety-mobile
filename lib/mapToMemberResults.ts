import { EvaluateResponse, Profile } from '../types';
import { MemberResult, Verdict } from '../types/verdict';
import { VERDICT_SORT_ORDER } from './verdictUtils';

export function mapToMemberResults(
  response: EvaluateResponse,
  profiles: Profile[]
): MemberResult[] {
  const evaluations = Array.isArray(response.evaluations)
    ? response.evaluations
    : [];

  if (!Array.isArray(response.evaluations)) {
    console.warn('[fufu] mapToMemberResults: invalid evaluations', response);
  }

  const results: MemberResult[] = evaluations.map(evaluation => {
    const profile = profiles.find(p => p.Profile_ID === evaluation.Profile_ID);
    const memberName = profile?.Profile_Name ?? evaluation.Profile_ID;
    const verdict = (evaluation.Outcome as Verdict) ?? 'INCONCLUSIVE';

    return {
      memberId: evaluation.Profile_ID,
      memberName,
      memberInitial: memberName.charAt(0).toUpperCase(),
      verdict,
      explanation: evaluation.Output_State ?? '',
      reasoning: evaluation.Matched_Signals?.join(', ') ?? '',
      ageGroup: profile?.Age_Group ?? '',
      confidenceScore: evaluation.Confidence_Score,
    };
  });

  return results.sort(
    (a, b) => VERDICT_SORT_ORDER[a.verdict] - VERDICT_SORT_ORDER[b.verdict]
  );
}
