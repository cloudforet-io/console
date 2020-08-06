import { DynamicLayoutTemplateProps, TableOptions } from '@/components/organisms/dynamic-layout/type';
import { ToolboxTableProps } from '@/components/organisms/tables/toolbox-table/PToolboxTable.toolset';

export interface SearchTableProps extends ToolboxTableProps {
    searchText: string;
}

export type TableDynamicLayoutProps = DynamicLayoutTemplateProps<
    SearchTableProps,
    TableOptions
    >
