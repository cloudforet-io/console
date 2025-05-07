import type { TranslateResult } from 'vue-i18n';

export interface EmptyData {
  to?: { name: string };
  title: string | TranslateResult;
  buttonText?: string | TranslateResult;
  desc: string | TranslateResult;
}
