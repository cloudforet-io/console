import type { ToolboxOptions, ToolboxProps } from '@/controls/toolbox/type';
import type { DataTableProps } from '@/data-display/tables/data-table/type';

export interface ToolboxTableOptions extends ToolboxOptions {
    sortDesc?: boolean;
}

export interface ToolboxTableProps extends DataTableProps, ToolboxProps {}
