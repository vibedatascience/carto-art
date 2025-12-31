import type { PosterStyle } from '@/types/poster';
import { minimalStyle } from './minimal';
import { darkModeStyle } from './dark-mode';
import { blueprintStyle } from './blueprint';

export const styles: PosterStyle[] = [
  minimalStyle,
  darkModeStyle,
  blueprintStyle,
];

export function getStyleById(id: string): PosterStyle | undefined {
  return styles.find(style => style.id === id);
}

export function getDefaultStyle(): PosterStyle {
  return minimalStyle;
}



