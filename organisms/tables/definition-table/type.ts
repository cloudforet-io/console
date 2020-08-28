import { DefinitionProps } from '@/components/organisms/definition/type';

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
