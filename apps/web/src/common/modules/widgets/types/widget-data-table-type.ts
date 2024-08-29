import type { EvaluateExpressionType } from '@/common/modules/widgets/types/widget-model';

type Handler = (item:any) => string;

export interface TableWidgetField {
    name: string;
    label: string;
    width?: string;
    fieldInfo?: TableFieldInfo;
    tooltipText?: string;
    link?: string | Handler;
}

interface TableFieldInfo {
    type: 'labelField' | 'dataField';
    additionalType?: 'comparison' | 'subTotal' | 'total' | 'progressBar' | 'dateFormat';
    reference?: string;
    unit?: string;
}

export interface AdditionalLabel {
    key: string;
    name: string;
    value: string;
}

export interface QueryCondition {
    key: string;
    value: string;
}

export interface EvalExpressions {
    key: string;
    isCollapsed: boolean;
    name: string;
    fieldType: EvaluateExpressionType;
    expression: string;
}

export interface TransformDataTableInfo {
    dataTables: string[];
    dataTableId: string|undefined;
}

export type DataTableAlertModalMode = 'DELETE'|'DELETE_UNABLED'|'RESET';

export type JoinRestrictedMap = Record<string, boolean>; // { {id}: true }
