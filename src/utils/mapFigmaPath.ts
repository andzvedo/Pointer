/**
 * Utility to map a Figma node path array to a valid React component name.
 * Example: ["Version 1","5","Data Extracted"] -> "DataExtracted"
 */
export function mapFigmaPathToComponentName(figmaPath: string[]): string {
  const last = figmaPath[figmaPath.length - 1] || '';
  return last
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}
