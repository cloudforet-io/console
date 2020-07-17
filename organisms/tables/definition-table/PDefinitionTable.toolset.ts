import { DefinitionProps } from '@/components/organisms/definition/PDefinition.toolset';
import { ComputedOrRef } from '@/lib/type';
import { computed } from '@vue/composition-api';
import _ from 'lodash';
import { DynamicFieldType } from '@/components/organisms/dynamic-view/dynamic-layout/toolset';

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
