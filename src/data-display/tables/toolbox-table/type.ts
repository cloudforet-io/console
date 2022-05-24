import { DataTableProps } from '@/data-display/tables/data-table/type';
import { ToolboxOptions, ToolboxProps } from '@/navigation/toolbox/type';

export interface ToolboxTableOptions extends ToolboxOptions {
    sortDesc?: boolean;
}

export interface ToolboxTableProps extends DataTableProps, ToolboxProps {}
