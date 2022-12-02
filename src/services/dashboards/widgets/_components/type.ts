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

type Handler = (item:any) => string;
type BoolHandler = (item:any) => boolean;

export interface Field {
    name: string;
    width?: string;
    label?: string;
    textAlign?: 'left' | 'right';
    textType?: 'number' | 'cost' | 'percent' | 'size';
    dataOptions?: CostOption | PercentOption | SizeOption;
    detailOptions?: {
        enabled?: boolean;
        type?: 'modal'|'popover';
    }
    tooltipText?: string;
    showLegend?: boolean;
    showLegendIndex?: boolean;
    icon?: string | Handler;
    link?: string | Handler;
    rapidIncrease?: boolean | BoolHandler;
}

export const TABLE_SIZE = {
    sm: 'sm',
    md: 'md',
} as const;

export type TableSize = typeof TABLE_SIZE[keyof typeof TABLE_SIZE];
