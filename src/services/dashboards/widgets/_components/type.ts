import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

interface TextOption {
    type: 'text';
    align?: 'left'|'right';
    icon?: string;
}

interface CostOption {
    type: 'cost';
    currencyLabel: string;
    currency: Currency;
    currencyRates: CurrencyRates;
}
interface PercentOption {
    type: 'percent';
}
interface SizeOption {
    type: 'size';
    display_unit?: 'BYTES | KB | MB | GB | TB | PB';
    source_unit?: 'BYTES | KB | MB | GB | TB | PB';
}

export interface Field {
    name: string;
    width?: string;
    label?: string;
    textAlign?: 'left'|'right'|'center';
    styleOptions: TextOption;
    dataOptions: CostOption | PercentOption | SizeOption;
    legendOptions?: {
        enabled: boolean;
        index: boolean;
    };
    detailOptions?: {
        enabled: boolean;
        type: 'modal'|'popover';
    }
    tooltipText?: string;
}
