import type { DynamicFieldOptions } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';

import type { Reference } from '@/lib/reference/type';

interface Options {
    currency?: string;
    currencyRates?: Record<string, number>;
}

export interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime'|'enum'|'currency'|'size';
    enum_items?: any;
    reference?: Reference;
    options?: DynamicFieldOptions | Options;
}

interface HeaderMessage {
    title: string;
}

export interface ExcelPayload {
    url?: string;
    param?: any;
    data?: any[];
    fields: ExcelDataField[];
    sheet_name?: string;
    header_message?: HeaderMessage;
    file_name_prefix?: string;
    version?: string;
    timezone?: string;
}
