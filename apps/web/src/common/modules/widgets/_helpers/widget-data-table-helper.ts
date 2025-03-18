// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';

import { DATA_TABLE_OPERATOR, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableModel, DataTableReference } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    ConcatOptions, DataTableOperator, DataTableOptions, JoinOptions,
} from '@/common/modules/widgets/types/widget-model';

export const getDuplicatedDataTableName = (
    name: string,
    dataTables: Partial<PublicDataTableModel | PrivateDataTableModel>[],
): string => {
    let _name = name;
    const dataTableNames = dataTables.map((dataTable) => dataTable.name);

    while (dataTableNames.includes(_name)) {
        const lastOpenParenIndex = _name.lastIndexOf('(');
        const lastCloseParenIndex = _name.lastIndexOf(')');

        if (
            lastOpenParenIndex !== -1
            && lastCloseParenIndex === _name.length - 1
            && lastOpenParenIndex < lastCloseParenIndex
        ) {
            const baseName = _name.slice(0, lastOpenParenIndex).trim();
            const numberStr = _name.slice(lastOpenParenIndex + 1, lastCloseParenIndex);
            const number = parseInt(numberStr);

            if (!Number.isNaN(number)) {
                _name = `${baseName} (${number + 1})`;
            } else {
                _name = `${_name} (2)`;
            }
        } else {
            _name = `${_name} (2)`;
        }
    }

    return _name;
};

export const isFieldNameValid = (fieldName: string, dataTable?: PublicDataTableModel|PrivateDataTableModel): boolean => {
    if (!dataTable) return true;
    const _dataInfoKeys = Object.keys(dataTable.data_info || {});
    const _labelsInfoKeys = Object.keys(dataTable.labels_info || {});
    const _keys = _dataInfoKeys.concat(_labelsInfoKeys);
    return !_keys.includes(fieldName);
};

export const normalizeAndSerializeDataTableOptions = (
    data?: DataTableOptions | DataTableOptions[],
): string => {
    if (data === undefined || typeof data !== 'object') return JSON.stringify(data);

    const normalize = (obj: DataTableOptions): DataTableOptions => {
        const normalized = {} as DataTableOptions;
        Object.keys(obj)
            .sort()
            .forEach((key) => {
                // eslint-disable-next-line no-nested-ternary
                normalized[key] = Array.isArray(obj[key])
                    ? obj[key].map((item: any) => (typeof item === 'object' && item !== null ? normalize(item) : item))
                    : typeof obj[key] === 'object' && obj[key] !== null
                        ? normalize(obj[key])
                        : obj[key];
            });
        return normalized;
    };

    if (Array.isArray(data)) {
        const normalizedArray = data.map((item) => (typeof item === 'object' && item !== null ? normalize(item) : item));
        return JSON.stringify(normalizedArray, null, 2);
    }

    const normalizedObject = normalize(data);
    return JSON.stringify(normalizedObject, null, 2);
};


export const createDataTableReferenceMap = (dataTableList: DataTableModel[]): Record<string, DataTableReference> => {
    const referenceMap: Record<string, DataTableReference> = {};
    const MULTIPE_DATA_TABLE_OPERATORS = [DATA_TABLE_OPERATOR.CONCAT, DATA_TABLE_OPERATOR.JOIN] as DataTableOperator[];

    const savedDataTables = dataTableList.filter((dataTable) => dataTable.data_table_id && !dataTable.data_table_id.startsWith('UNSAVED-')) as DataTableModel[];

    const getOrCreateReference = (dataTableId: string): DataTableReference => {
        if (!referenceMap[dataTableId]) {
            referenceMap[dataTableId] = _setIniitialDataTableReferenceProperty(dataTableId);
        }
        return referenceMap[dataTableId];
    };

    savedDataTables.forEach((dataTable) => {
        const currentRef = getOrCreateReference(dataTable.data_table_id);

        if (dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED && dataTable.operator) {
            const operatorOptions = dataTable.options[dataTable.operator] as (ConcatOptions | JoinOptions | { data_table_id?: string });

            if (MULTIPE_DATA_TABLE_OPERATORS.includes(dataTable.operator)) {
                const [firstId, secondId] = operatorOptions?.data_tables ?? [];

                if (firstId && secondId) {
                    const firstRef = getOrCreateReference(firstId);
                    const secondRef = getOrCreateReference(secondId);

                    firstRef.children.push(dataTable.data_table_id);
                    secondRef.children.push(dataTable.data_table_id);
                    currentRef.parents.push(firstId, secondId);
                }
            } else {
                const referenceId = operatorOptions?.data_table_id;
                if (referenceId) {
                    const parentRef = getOrCreateReference(referenceId);
                    parentRef.children.push(dataTable.data_table_id);
                    currentRef.parents.push(referenceId);
                }
            }
        }
    });

    return referenceMap;
};

const _setIniitialDataTableReferenceProperty = (dataTableId: string): DataTableReference => ({
    data_table_id: dataTableId,
    parents: [],
    children: [],
});

export const getDataTableReferenceMapExecutionOrder = (referenceMap: Record<string, DataTableReference>): string[] => {
    const inDegree = Object.values(referenceMap).reduce<Record<string, number>>((acc, { children }) => {
        children.forEach((childId) => {
            acc[childId] = (acc[childId] || 0) + 1;
        });
        return acc;
    }, {});

    const initialQueue = Object.keys(referenceMap).filter((id) => !inDegree[id]);

    const processQueue = (queue: string[], order: string[]) => {
        if (queue.length === 0) return order;
        return processQueue(
            queue.flatMap((id) => {
                referenceMap[id]?.children.forEach((childId) => {
                    inDegree[childId] -= 1;
                });

                return referenceMap[id]?.children.filter((childId) => inDegree[childId] === 0) ?? [];
            }),
            [...order, ...queue],
        );
    };

    return processQueue(initialQueue, []);
};
