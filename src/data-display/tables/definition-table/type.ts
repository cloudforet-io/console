import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';
import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';

export interface DefinitionData {
    [key: string]: any;
}

export interface DefinitionTableProps {
    fields: DefinitionField[];
    data?: DefinitionData;
    loading?: boolean;
    skeletonRows?: number;
    disableCopy?: boolean;
    styleType?: DEFINITION_TABLE_STYLE_TYPE;
}

export type DefinitionField = Omit<DefinitionProps, 'data'>
