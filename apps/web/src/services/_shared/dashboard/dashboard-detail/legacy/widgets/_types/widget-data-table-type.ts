import type { ReferenceType } from '@/services/dashboards/stores/all-reference-type-info-store';

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
    unit?: string|null; // used at table column header and value formatting. this has higher priority than unitPath.
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


export interface WidgetTableData {
    [fieldName: string]: any;
}
