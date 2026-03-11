export const COLOURS = {
  // Brand
  PRIMARY:        '#0F172A',  // Midnight

  // Semantic outcomes
  ALLOW:          '#10B981',  // Emerald
  WARN:           '#F59E0B',  // Amber
  BLOCK:          '#E11D48',  // Rose Red
  INCONCLUSIVE:   '#64748B',  // Slate

  // Backgrounds
  BACKGROUND:     '#FBFBFA',  // Alabaster
  SURFACE:        '#FFFFFF',
  WHITE:          '#FFFFFF',

  // Text
  TEXT_PRIMARY:   '#0F172A',
  TEXT_SECONDARY: '#64748B',  // Slate
  TEXT_MID:       '#475569',
  TEXT_FAINT:     '#94A3B8',

  // Borders
  BORDER:         '#E2E8F0',
  BORDER_SUBTLE:  '#CBD5E0',

  // Surface tints
  INFO_BG:        '#EFF6FF',
  INFO_TEXT:      '#1E3A5F',
  INFO_ACCENT:    '#3B82F6',
  WARN_BG:        '#FFFBEB',
  WARN_TEXT:      '#78350F',

  // Low confidence surface
  LOW_CONF_BG:    '#F1F5F9',

  // Scan overlays
  SCAN_ERROR:     '#FECACA',
  SCAN_INFO:      '#BAE6FD',
} as const;
