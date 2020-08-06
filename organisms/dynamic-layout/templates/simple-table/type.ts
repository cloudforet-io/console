import { DynamicLayoutTemplateProps, SimpleTableOptions } from '@/components/organisms/dynamic-layout/type';
import { DataTableProps } from '@/components/organisms/tables/data-table/PDataTable.toolset';

export type SimpleTableDynamicLayoutProps = DynamicLayoutTemplateProps<
    DataTableProps,
    SimpleTableOptions
    >
