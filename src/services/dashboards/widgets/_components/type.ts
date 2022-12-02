import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';


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

export interface LegendConfig {
    color?: string;
    disabled?: boolean;
    name?: string;
}

export interface Field {
    name: string;
    width?: string;
    label?: string;
    textAlign?: 'left' | 'right';
    dataOptions?: CostOption | PercentOption | SizeOption;
    detailOptions?: {
        enabled?: boolean;
        type?: 'modal'|'popover';
    }
    tooltipText?: string;
    showLegend?: boolean;
    showLegendIndex?: boolean;
}

export interface TableItemValueOptions {
    value?: string;
    name?: string;
    icon?: string;
    rapidIncrease?: boolean;
    link?: string;
}

export type TableItem = Record<string, TableItemValueOptions | string>;
