export const textEditorModes = ['readOnly', 'edit'] as const;
export type TextEditorMode = typeof textEditorModes[number]
