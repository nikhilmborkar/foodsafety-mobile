export type Verdict = 'ALLOW' | 'WARN' | 'BLOCK' | 'INCONCLUSIVE';

export type MemberResult = {
  memberId: string;
  memberName: string;
  memberInitial: string;
  verdict: Verdict;
  explanation: string;
  reasoning: string;
  ageGroup: string;
  confidenceScore: number;
};
