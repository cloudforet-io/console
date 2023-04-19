import { notoSansConfigMap } from '@/styles/fonts';

export const fontLanguages = Object.freeze({
    en: 'en',
    ko: 'ko',
    ja: 'ja',
} as const);
export type Language = typeof fontLanguages[keyof typeof fontLanguages];

export const pdfFontFamily = Object.freeze({
    NotoSans: 'NotoSans',
    NotoSansJp: 'NotoSansJp',
    NotoSansKo: 'NotoSansKo',
} as const);
export type PdfFontFamily = typeof pdfFontFamily[keyof typeof pdfFontFamily];

interface PdfFontInfo {
    normal: string;
    bold: string;
    italics?: string;
    bolditalics?: string;
}
const getPdfSource = ({ urlPrefix, formats }, name) => `${window.location.origin}/${urlPrefix}${name}.${formats[1]}`;
export const pdfFontInfoMap: Record<PdfFontFamily, PdfFontInfo> = {
    [pdfFontFamily.NotoSans]: {
        normal: getPdfSource(notoSansConfigMap.en, 'regular'),
        bold: getPdfSource(notoSansConfigMap.en, '700'),
        italics: getPdfSource(notoSansConfigMap.en, 'italic'),
        bolditalics: getPdfSource(notoSansConfigMap.en, '700italic'),
    },
    [pdfFontFamily.NotoSansKo]: {
        normal: getPdfSource(notoSansConfigMap.ko, 'regular'),
        bold: getPdfSource(notoSansConfigMap.ko, '700'),
    },
    [pdfFontFamily.NotoSansJp]: {
        normal: getPdfSource(notoSansConfigMap.ja, 'regular'),
        bold: getPdfSource(notoSansConfigMap.ja, '700'),
    },
};
