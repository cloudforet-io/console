type Handler = (item:any) => string;

export interface TableWidgetField {
    name: string;
    width?: string;
    label?: string;
    fieldInfo?: TableFieldInfo;
    tooltipText?: string;
    link?: string | Handler;
}

interface TableFieldInfo {
    type: 'labelField' | 'dataField';
    additionalType?: 'comparison' | 'subTotal' | 'total' | 'progressBar';
}

export interface AdditionalLabel {
    key: string;
    name: string;
    value: string;
}

export interface WhereCondition {
    key: string;
    value: string;
}

export interface EvalFormula {
    key: string;
    name: string;
    value: string;
}

export interface TransformDataTableInfo {
    dataTables: string[];
    dataTableId: string|undefined;
}

export type DataTableAlertModalMode = 'DELETE'|'DELETE_UNABLED'|'RESET';

