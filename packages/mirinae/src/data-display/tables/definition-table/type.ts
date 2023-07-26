import type { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';
import type { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';

export interface DefinitionData {
    [key: string]: any;
}

export interface DefinitionTableProps {
    fields: DefinitionField[];
    data?: DefinitionData|DefinitionData[];
    loading?: boolean;
    skeletonRows?: number;
    disableCopy?: boolean;
    styleType?: DEFINITION_TABLE_STYLE_TYPE;
    block?: boolean;
    customWidth?: string;
}

export type DefinitionField = Omit<DefinitionProps, 'data'>;
