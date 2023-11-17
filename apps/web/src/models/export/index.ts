import type { Query } from '@cloudforet/core-lib/space-connector/type';


// excel Export
export const QueryType = {
    ANALYZE: 'ANALYZE',
    SEARCH: 'SEARCH',
} as const;

export type QueryType = typeof QueryType[keyof typeof QueryType];


type SearchQueryField = {
    key: string;
    name: string;
    reference?: any;
    [key: string]: any;
} | string;

interface SearchQuery {
    filter?: Query['filter'];
    filter_or?: Query['filter_or'];
    sort?: Query['sort'];
    fields?: Array<SearchQueryField>;
    keyword?: string;
    unwind?: {
        path?: string;
    }
}

interface AnalyzeQuery {
    filter?: Query['filter'];
    filter_or?: Query['filter_or'];
    sort?: Query['sort'];
    fields?: any;
    labels?: string[];
    group_by?: string[];
    keyword?: string;
    select?: any;
}

export interface ExportOption {
    name: string; // name of the sheet
    title?: string;
    query_type: QueryType;
    search_query?: SearchQuery;
    analyze_query?: AnalyzeQuery;
}

export interface ExportParameter {
    file_name?: string;
    options: ExportOption[]
    timezone?: string;
    file_format?: 'Excel' | 'CSV'; // default: Excel
}

export interface ExportResponse {
    download_url: string;
}
