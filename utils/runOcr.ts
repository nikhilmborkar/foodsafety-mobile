import TextRecognition from '@react-native-ml-kit/text-recognition';
import { preprocessImage } from './preprocessImage';

const INGREDIENT_KEYWORD_RE =
  /(ingredients?|ingrediënten|ingrédients|zutaten|ingredienti|składniki|consists of|bevat|contains)\s*:?\s*/i;

const SECTION_BREAK_RE =
  /(nutritional information|nutrition facts|voedingswaarden|nährwerte|bewaren|storage|best before|houdbaar|bereidingswijze|preparation|allergen advice)/i;

export async function runOcr(uri: string): Promise<string> {
  try {
    const processedUri = await preprocessImage(uri);
    const result = await TextRecognition.recognize(processedUri);

    // 1. Combine all blocks and normalise whitespace
    let text = result.blocks.map(block => block.text).join(' ');
    text = text.replace(/\s+/g, ' ').trim();

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
      // 6. Fallback: return full OCR text
      ingredientText = text;
    }

    // 7. Minimum length guard
    if (ingredientText.length < 10) {
      return '';
    }

    return ingredientText;
  } catch {
    return '';
  }
}
