import type { QueryItem } from '@/inputs/search/query-search/type';


export interface QueryTag extends QueryItem {
    invalid?: boolean;
    description?: string;
}

export interface QueryTagValidator {
    (query: QueryTag, tags: QueryTag[]): boolean;
}

export interface QueryTagConverter {
    (query: QueryItem, timezone: string): QueryTag;
}

export interface QuerySearchTagsProps {
    tags: QueryTag[];
    timezone: string;
    validator?: QueryTagValidator;
    converter?: QueryTagConverter;
    readOnly: boolean;
}


export interface QuerySearchTagsFunctions {
    addTag(...queries: QueryItem[]): void;
    deleteTag(index: number): void;
    deleteAllTags(): void;
}

export interface QuerySearchTagsListeners {
    init: (props: QuerySearchTagsProps) => void|Promise<void>;
    add: (tags: QueryTag[]) => void|Promise<void>;
    delete: (tags: QueryTag[]) => void|Promise<void>;
    'delete:tag': (idx: number) => void|Promise<void>;
    'delete:all': () => void|Promise<void>;
    change: (tags: QueryTag[]) => void|Promise<void>;
}
