import { DynamicField } from '@/components/organisms/dynamic-field/type';
import { Options, QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';
import { DynamicLayoutProps } from '@/components/organisms/dynamic-layout/type';

export interface QuerySearchTableOptions {
    fields: DynamicField[];
}

/** Props type for Query Search Dynamic layout component */
export interface QuerySearchDynamicLayoutProps extends DynamicLayoutProps {
    data: any[];
    options: QuerySearchTableOptions;
    extra: QuerySearchTableProps;
    fetchHandler: (fetchOptions: Options) => Promise<any[]>;
}
