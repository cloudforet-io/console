import { Reference } from '@/lib/reference/type';

export interface FileState {
    downloadSource?: string;
}

export interface ExcelDataField {
    key: string;
    name: string;
    type?: 'datetime';
    reference?: Reference;
}
