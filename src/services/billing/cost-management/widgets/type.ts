import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';

export interface WidgetProps {
    currency: CURRENCY;
    currencyRates: CurrencyRates;
}

export interface ChartData {
    [key: string]: any;
}
