export interface NormalizedCoordinate {
  x: number; // 0–1 range
  y: number; // 0–1 range
}

export interface PixelCoordinate {
  x: number; // absolute pixel
  y: number; // absolute pixel
}

/**
 * Convert normalized coordinates (0–1) to absolute pixel coordinates
 * Assumes viewport dimensions of 1440x900 (standard browser)
 */
export function mapNormalizedToPage(
  normX: number,
  normY: number,
  pageWidth: number = 1440,
  pageHeight: number = 900
): PixelCoordinate {
  return {
    x: Math.round(normX * pageWidth),
    y: Math.round(normY * pageHeight),
  };
}

/**
 * Convert absolute pixel coordinates to normalized (0–1)
 */
export function mapPageToNormalized(
  pixelX: number,
  pixelY: number,
  pageWidth: number = 1440,
  pageHeight: number = 900
): NormalizedCoordinate {
  return {
    x: pixelX / pageWidth,
    y: pixelY / pageHeight,
  };
}

/**
 * Check if two coordinates are within a distance threshold
 */
export function areCoordinatesNear(
  coord1: PixelCoordinate,
  coord2: PixelCoordinate,
  threshold: number = 20
): boolean {
  const distance = Math.sqrt(
    Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2)
  );
  return distance <= threshold;
}

/**
 * Calculate midpoint between two coordinates
 */
export function getMidpoint(
  coord1: PixelCoordinate,
  coord2: PixelCoordinate
): PixelCoordinate {
  return {
    x: Math.round((coord1.x + coord2.x) / 2),
    y: Math.round((coord1.y + coord2.y) / 2),
  };
}
