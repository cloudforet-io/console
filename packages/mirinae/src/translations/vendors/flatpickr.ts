

import { english } from 'flatpickr/dist/l10n/default.js';
import { Japanese } from 'flatpickr/dist/l10n/ja.js';
import { Korean } from 'flatpickr/dist/l10n/ko.js';
import type { CustomLocale, Locale } from 'flatpickr/dist/types/locale';

import type { SupportLanguage } from '@/translations';


const localeFiles: Record<SupportLanguage, Locale|CustomLocale> = {
    en: english,
    ko: Korean,
    ja: Japanese,
};

export const getLocaleFile = (locale: string) => localeFiles[locale];
