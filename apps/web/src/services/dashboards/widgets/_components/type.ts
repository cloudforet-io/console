import type { ReferenceType } from '@/store/reference/all-reference-store';

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
interface UsageOption {
    type: 'usage';
    unit?: string; // used at table column header and value formatting. this has higher priority than unitPath.
    unitPath?: string; // used at value formatting only
}

interface ReferenceOption {
    type: 'reference',
    referenceType: ReferenceType;
}

type Handler = (item:any) => string;
type BoolHandler = (item:any) => boolean;

export interface Field {
    name: string;
    width?: string;
    label?: string;
    textAlign?: 'left' | 'right';
    textOptions?: CostOption | PercentOption | NumberOption | UsageOption | ReferenceOption;
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

export interface WidgetTableData {
    [fieldName: string]: any;
}
