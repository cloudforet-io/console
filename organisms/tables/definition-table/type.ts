import { DynamicFieldOptions, DynamicFieldType } from '@/components/organisms/dynamic-field/type';

export interface DefinitionData {
    [key: string]: any;
}

export interface DefinitionTableProps {
    fields: DefinitionField[];
    data?: DefinitionData;
    loading: boolean;
    skeletonRows: number;
}

export interface DefinitionField {
    name: string;
    label?: string;
    type: DynamicFieldType;
    options?: DynamicFieldOptions;
}
