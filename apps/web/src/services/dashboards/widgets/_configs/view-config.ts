export const WIDGET_THEMES = ['violet', 'blue', 'coral', 'yellow', 'gray', 'green', 'indigo', 'peacock'] as const;
export type WidgetTheme = typeof WIDGET_THEMES[number];
export type WidgetColorSetType = 'basic'|'massive';
