import type { ReferenceType } from '@/store/reference/all-reference-store';

import type { DateRange } from '@/services/dashboards/config';
import type { WidgetSize } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';

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
    sourceUnit?: UnitMap;
    default?: number;
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
    textOptions?: CostOption | PercentOption | SizeOption | NumberOption | ReferenceOption;
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
    [fieldName: string]: string|number
}

export interface WidgetFrameProps {
    title: string;
    size: WidgetSize;
    width?: number;
    widgetLink?: string;
    widgetLocation?: RouteLocationRaw;
    widgetConfigId?: string;
    dateRange?: DateRange;
    noData?: boolean;
    printMode?: boolean;
    selectedDates?: string[];
    currency?: Currency;
    editMode?: boolean;
    errorMode?: boolean;
    disableExpandIcon?: boolean;
    disableEditIcon?: boolean;
    disableDeleteIcon?: boolean;
    disableFullSize?: boolean;
    disableViewMode?: boolean;
    isOnlyFullSize?: boolean;
    widgetKey: string;
    overflowY?: string;
    refreshOnResize?: boolean;
    theme?: WidgetTheme;
    nonInheritOptionsTooltipText?: string;
}
