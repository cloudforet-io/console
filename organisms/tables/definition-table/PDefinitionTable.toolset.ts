import { DefinitionProps } from '@/components/organisms/definition/PDefinition.toolset';

export const definitionTableProps = {
    items: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    skeletonRows: {
        type: Number,
        default: 5,
    },
};


export interface DefinitionTableProps {
    items: DefinitionProps[];
    loading: boolean;
    skeletonRows: number;
}

export interface DefinitionField {
    name: string;
    label?: string;
    options?: any;
    type?: string;
}

export interface DefinitionData {
    [key: string]: any;
}

export const makeDefItems = (fields: DefinitionField[], data?: DefinitionData) => fields.map(f => ({
    ...f,
    data: data ? data[f.name] : undefined,
}));
