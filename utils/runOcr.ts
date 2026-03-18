import TextRecognition from '@react-native-ml-kit/text-recognition';
import { preprocessImage } from './preprocessImage';

export type OcrReason =
  | 'success'
  | 'no_text'
  | 'non_latin'
  | 'no_ingredients'
  | 'low_quality';

export interface OcrResult {
  text: string;
  reason: OcrReason;
  confidence: number;
}

const INGREDIENT_KEYWORD_RE =
  /(ingredients?|ingrediënten|ingrédients|zutaten|ingredienti|składniki|consists of|bevat|contains)\s*:?\s*/i;

const SECTION_BREAK_RE =
  /(nutritional information|nutrition facts|voedingswaarden|nährwerte|bewaren|storage|best before|houdbaar|bereidingswijze|preparation|allergen advice)/i;

function containsNonLatin(text: string): boolean {
  return /[\u0600-\u06FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\u0E00-\u0E7F\u0590-\u05FF\u0400-\u04FF]/.test(text);
}

function averageConfidence(blocks: any[]): number {
  if (!blocks?.length) return 0;
  const scores = blocks
    .map(b => b.confidence ?? null)
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return 1;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export async function runOcr(uri: string): Promise<OcrResult> {
  try {
    const processedUri = await preprocessImage(uri);
    const result = await TextRecognition.recognize(processedUri);

    const confidence = averageConfidence(result.blocks);

    // 1. Combine all blocks and normalise whitespace
    let text = result.blocks.map(block => block.text).join(' ');
    text = text.replace(/\s+/g, ' ').trim();

    if (text.length === 0) {
      return { text: '', reason: 'no_text', confidence: 0 };
    }

    if (containsNonLatin(text)) {
      return { text, reason: 'non_latin', confidence };
    }

    // 2. Find ingredient keyword
    const keywordMatch = INGREDIENT_KEYWORD_RE.exec(text);

    let ingredientText: string;

    if (keywordMatch && keywordMatch.index !== undefined) {
      // 3. Slice text immediately after the matched keyword
      ingredientText = text.slice(keywordMatch.index + keywordMatch[0].length);

      // 4. Stop at the first section-break keyword
      const stopMatch = SECTION_BREAK_RE.exec(ingredientText);
      if (stopMatch && stopMatch.index !== undefined) {
        ingredientText = ingredientText.slice(0, stopMatch.index);
      }

      // 5. Final cleanup
      ingredientText = ingredientText.trim();
    } else {
      // 6. No keyword found — if text is substantial, flag as no_ingredients
      if (text.length > 200) {
        return { text: '', reason: 'no_ingredients', confidence };
      }
      ingredientText = text;
    }

    // 7. Minimum length guard
    if (ingredientText.length < 10) {
      return { text: '', reason: 'low_quality', confidence };
    }

    return { text: ingredientText, reason: 'success', confidence };
  } catch {
    return { text: '', reason: 'no_text', confidence: 0 };
  }
}
