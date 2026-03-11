import { useState, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../constants/api';
import { Profile, EvaluateResponse } from '../types';

export interface InconclusiveResult {
  inconclusive: true;
  product_id: string;
  product_name: string;
}

type EvaluateResult = EvaluateResponse | InconclusiveResult;

interface EvaluateState {
  loading: boolean;
  slow: boolean;
  error: string | null;
  result: EvaluateResult | null;
}

export function useEvaluate() {
  const [state, setState] = useState<EvaluateState>({
    loading: false,
    slow: false,
    error: null,
    result: null,
  });
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const evaluate = useCallback(async (
    barcode: string,
    profiles: Profile[]
  ): Promise<EvaluateResult | null> => {
    setState({ loading: true, slow: false, error: null, result: null });

    slowTimer.current = setTimeout(() => {
      setState(prev => ({ ...prev, slow: true }));
    }, 3000);

    const clearTimer = () => {
      if (slowTimer.current) {
        clearTimeout(slowTimer.current);
        slowTimer.current = null;
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, profiles }),
      });

      clearTimer();

      if (response.status === 404) {
        setState({ loading: false, slow: false, error: 'Product not found — try scanning again', result: null });
        return null;
      }
      if (response.status === 400) {
        setState({ loading: false, slow: false, error: 'No profiles provided — set up your household first', result: null });
        return null;
      }
      if (!response.ok) {
        setState({ loading: false, slow: false, error: 'Something went wrong — check your connection', result: null });
        return null;
      }

      const data = await response.json() as EvaluateResponse;

      if (data.evaluations.length === 0) {
        const inconclusive: InconclusiveResult = {
          inconclusive: true,
          product_id: data.product_id,
          product_name: data.product_name,
        };
        setState({ loading: false, slow: false, error: null, result: inconclusive });
        return inconclusive;
      }

      setState({ loading: false, slow: false, error: null, result: data });
      return data;
    } catch {
      clearTimer();
      setState({ loading: false, slow: false, error: 'Something went wrong — check your connection', result: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    if (slowTimer.current) {
      clearTimeout(slowTimer.current);
      slowTimer.current = null;
    }
    setState({ loading: false, slow: false, error: null, result: null });
  }, []);

  return { ...state, evaluate, reset };
}
