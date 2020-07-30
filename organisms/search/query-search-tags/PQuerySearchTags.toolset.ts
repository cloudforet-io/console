import { QueryItem } from '@/components/organisms/search/query-search/type';

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

export interface QuerySearchTagsListeners {
    'delete:tag'?: (idx: number) => void|Promise<void>;
    'delete:all'?: () => void|Promise<void>;
}
