import { ToolboxOptions, ToolboxProps } from '@/navigation/toolbox/type';
import { TOOLBOX_TABLE_STYLE_TYPE } from '@/data-display/tables/toolbox-table/config';
import { DataTableProps } from '@/data-display/tables/data-table/type';

export interface ToolboxTableOptions extends ToolboxOptions {
    sortDesc?: boolean;
}

export interface ToolboxTableProps extends DataTableProps, ToolboxProps {
    styleType?: TOOLBOX_TABLE_STYLE_TYPE;
}
