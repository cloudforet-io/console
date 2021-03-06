import { Reference } from '@/lib/reference/type';

export interface FileState {
    downloadSource?: string;
}

interface Options {
    currency?: string;
    currencyRates?: Record<string, number>;
}

export interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime'|'enum'|'currency';
    enum_items?: object;
    reference?: Reference;
    options?: Options;
}
