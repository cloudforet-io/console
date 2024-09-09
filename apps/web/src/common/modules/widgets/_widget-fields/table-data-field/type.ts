/** Value Type
 * Latest Version: v1
 * */
export interface TableDataFieldValueNoVersion {
    fieldType: 'dynamicField' | 'staticField';
    value?: string | string[];
    dynamicFieldValue?: string[];
    criteria?: string;
}

export interface TableDataFieldValueV1 {
    fieldType: 'dynamicField' | 'staticField';
    dynamicFieldInfo?: {
        criteria?: string;
        fieldValue?: string;
        valueType?: 'auto' | 'fixed';
        count?: number;
        fixedValue?: string[];
    };
    staticFieldInfo?: {
        fieldValue?: string[];
    };
    version: 'v1'; // required
}


/** Options Type */
export interface TableDataFieldOptions {
    max?: number; // This is a value for a possible max limit.
}


/** Latest Version */
export const LATEST_TABLE_DATA_FIELD_VERSION = 'v1';
