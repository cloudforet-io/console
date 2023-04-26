import type { Getter } from 'vuex';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { SettingsState } from '@/store/modules/settings/type';

export const currencySymbol: Getter<SettingsState, any> = (state): string => CURRENCY_SYMBOL[state.currency] ?? '$';
