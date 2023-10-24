import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

interface BaseItemOptions {
    label?: string;
}
export interface EnumModelOptions extends BaseItemOptions {
    type: 'ENUM';
    values: { key: string; label: string; }[];
}
export interface SearchResourceModelOptions extends BaseItemOptions {
    type: 'SEARCH_RESOURCE';
    resource_type: string;
    reference_key?: string;
    resource_id?: string;
    default_path?: string|number;
    filters?: ConsoleFilter[];
}
export interface ReferenceResourceModelOptions extends BaseItemOptions {
    type: 'REFERENCE_RESOURCE',
    reference_key: string;
}
