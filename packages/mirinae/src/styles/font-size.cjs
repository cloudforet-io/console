
const lineHeight = {
    long: '1.5',
    short: '1.25'
}
const letterSpacing = {
    tight: '-0.02em',
    wide: '0.02em'
}
const fontSize = {
    '6xl': '4rem',
    '5xl': '3rem',
    '4xl': '2rem',
    '3xl': '1.5rem',
    '2xl': '1.375rem',
    xl: '1.125rem',
    lg: '1rem',
    md: '0.875rem',
    sm: '0.75rem',
    xs: '0.625rem',
}

const semanticFontSize = {
    'display-2xl': [fontSize["6xl"], {lineHeight: lineHeight.short, letterSpacing: letterSpacing.tight}],
    'display-xl': [fontSize["5xl"], {lineHeight: lineHeight.short, letterSpacing: letterSpacing.tight}],
    'display-lg': [fontSize["4xl"], {lineHeight: lineHeight.short}],
    'display-md': [fontSize["3xl"], {lineHeight: lineHeight.short}],
    'display-sm': [fontSize["2xl"], {lineHeight: lineHeight.short}],
    'label-xl': [fontSize["xl"], {lineHeight: lineHeight.short}],
    'label-lg': [fontSize["lg"], {lineHeight: lineHeight.short}],
    'label-md': [fontSize["md"], {lineHeight: lineHeight.short}],
    'label-sm': [fontSize["sm"], {lineHeight: lineHeight.short, letterSpacing: letterSpacing.wide,}],
    'label-xs': [fontSize["sm"], {lineHeight: lineHeight.short, letterSpacing: letterSpacing.wide,}],
    'paragraph-lg': [fontSize["lg"], {lineHeight: lineHeight.long}],
    'paragraph-md': [fontSize["md"], {lineHeight: lineHeight.long}],
    'paragraph-sm': [fontSize["sm"], {lineHeight: lineHeight.long}],
    'code-lg': [fontSize["lg"], {lineHeight: lineHeight.long}],
    'code-md': [fontSize["md"], {lineHeight: lineHeight.long}],
};

module.exports = {
    lineHeight,
    letterSpacing,
    fontSize,
    semanticFontSize,
}
