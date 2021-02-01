import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';

export interface DefinitionData {
    [key: string]: any;
}

export interface DefinitionTableProps {
    fields: DefinitionField[];
    data?: DefinitionData;
    loading: boolean;
    skeletonRows: number;
}

export type DefinitionField = Omit<DefinitionProps, 'data'>
