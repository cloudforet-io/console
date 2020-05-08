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
