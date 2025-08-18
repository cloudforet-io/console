
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableOperator } from '@/common/modules/widgets/types/widget-model';

export const DATA_TABLE_OPERATOR_INFO: { key: DataTableOperator, name: string; description: string; icon: string;}[] = [
    {
        key: DATA_TABLE_OPERATOR.CONCAT,
        name: 'Concatenate',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.CONCAT_DESC',
        icon: 'ic_db-concat',
    },
    {
        key: DATA_TABLE_OPERATOR.JOIN,
        name: 'Join',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.JOIN_DESC',
        icon: 'ic_join',
    },
    {
        key: DATA_TABLE_OPERATOR.EVAL,
        name: 'Evaluate',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.EVAL_DESC',
        icon: 'ic_db-evaluation',
    },
    {
        key: DATA_TABLE_OPERATOR.QUERY,
        name: 'Query',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.QUERY_DESC',
        icon: 'ic_db-where',
    },
    {
        key: DATA_TABLE_OPERATOR.AGGREGATE,
        name: 'Aggregate',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.AGGREGATE_DESC',
        icon: 'ic_db-dimensions',
    },
    {
        key: DATA_TABLE_OPERATOR.VALUE_MAPPING,
        name: 'Value Mapping',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.VALUE_MAPPING_DESC',
        icon: 'ic_db-value-mapping',
    },
    {
        key: DATA_TABLE_OPERATOR.ADD_LABELS,
        name: 'Additional Labels',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS_DESC',
        icon: 'ic_db-additional-labels',
    },
    {
        key: DATA_TABLE_OPERATOR.PIVOT,
        name: 'Pivot Table',
        description: 'COMMON.WIDGETS.DATA_TABLE.FORM.PIVOT_DESC',
        icon: 'ic_db-pivot-table',
    },
];
