import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';
import { TranslateResult } from 'vue-i18n';

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
export interface WidgetProps {
    currency: CURRENCY;
    currencyRates: CurrencyRates;
}
