export const UNIT_MAP = {
    B: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    PB: 'PB',
    TB: 'TB',
} as const;

export type UnitMap = typeof UNIT_MAP[keyof typeof UNIT_MAP];

interface CostOption {
    type: 'cost';
}
interface PercentOption {
    type: 'percent';
}
interface NumberOption {
    type: 'number';
}
interface SizeOption {
    type: 'size';
    display_unit?: UnitMap;
    source_unit?: UnitMap;
    default?: number;
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
    textOptions?: CostOption | PercentOption | SizeOption | NumberOption;
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
