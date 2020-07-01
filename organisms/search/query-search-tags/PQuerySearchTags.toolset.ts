import { QueryItem } from '@/components/organisms/search/query-search/PQuerySearch.toolset';

export const querySearchTagsProps = {
    tags: {
        type: Array,
        required: true,
    },
};

export interface QueryTag extends QueryItem {
    invalid?: boolean;
    description?: string;
}

export interface QuerySearchTagsProps {
    tags: QueryTag[];
}
