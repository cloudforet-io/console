import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';
import { TranslateResult } from 'vue-i18n';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';

/* widget spec */
export interface ChartData {
    [key: string]: any;
}

export interface Legend {
    name: string;
    label: string | TranslateResult;
    disabled?: boolean;
}


/* component props */
export interface WidgetProps<Options = any> {
    options: Options;
    period: Period;
    filters: Record<string, string[]>;
    currency: CURRENCY;
    currencyRates: CurrencyRates;
}
