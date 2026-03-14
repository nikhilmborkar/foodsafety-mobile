import * as ImageManipulator from 'expo-image-manipulator';

const MAX_WIDTH = 1200;
const MIN_HEIGHT_FOR_CROP = 400;

export async function preprocessImage(uri: string): Promise<string> {
  // Step 1: Resize to max width, preserving aspect ratio
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
  );

  const { width, height } = resized;

  // Step 2: Skip crop if image is too short
  if (height < MIN_HEIGHT_FOR_CROP) {
    return resized.uri;
  }

  // Step 3: Crop the central 60% vertical band
  const cropOriginY = Math.floor(height * 0.20);
  const cropHeight = Math.floor(height * 0.60);

  const cropped = await ImageManipulator.manipulateAsync(
    resized.uri,
    [
      {
        crop: {
          originX: 0,
          originY: cropOriginY,
          width,
          height: cropHeight,
        },
      },
    ],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );

  return cropped.uri;
}
