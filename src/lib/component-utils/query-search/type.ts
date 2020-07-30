import { KeyItem, ValueItem } from '@/components/organisms/search/query-search/type';

/** Search schema types */
export interface SearchEnumItem {
    label: string;
    icon?: {
        image?: string;
        color?: string;
    };
}
export type SearchDataType = 'string'|'integer'|'float'|'boolean'|'datetime'|'timestamp'
export type SearchEnums = Record<string, SearchEnumItem>|string[]

export interface SearchKeyOptions {
    key: string; // Key to retrieve actual data
    name: string; // Name to display in search bar
    enums?: SearchEnums;
    // eslint-disable-next-line camelcase
    data_type?: SearchDataType;
    reference?: string;
    icon?: string;
}

export interface SearchKeyGroup {
    title: string;
    items: SearchKeyOptions[];
    options?: object;
}
