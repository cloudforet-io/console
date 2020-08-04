import { DynamicField } from '@/components/organisms/dynamic-field/type';

export interface DefinitionData {
    [key: string]: any;
}

export interface DefinitionTableProps {
    fields: DynamicField[];
    data?: DefinitionData;
    loading: boolean;
    skeletonRows: number;
}
