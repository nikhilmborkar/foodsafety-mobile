import { Verdict } from '../types/verdict';

export const VERDICT_COLORS: Record<Verdict, string> = {
  ALLOW: '#10B981',
  WARN: '#D97706',
  BLOCK: '#BE123C',
  INCONCLUSIVE: '#64748B',
};

export const VERDICT_SORT_ORDER: Record<Verdict, number> = {
  BLOCK: 0,
  WARN: 1,
  INCONCLUSIVE: 2,
  ALLOW: 3,
};
