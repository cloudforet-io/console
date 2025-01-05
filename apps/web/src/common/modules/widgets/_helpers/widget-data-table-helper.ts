import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import type { DataTableOptions } from '@/common/modules/widgets/types/widget-model';

export const getDuplicatedDataTableName = (name: string, dataTables: Partial<PublicDataTableModel | PrivateDataTableModel>[]): string => {
    let _name = name;
    const _regex = /^(.*?)\s*\((\d+)\)$/i;
    const dataTableNames = dataTables.map((dataTable) => dataTable.name);

    while (dataTableNames.includes(_name)) {
        const match = _regex.exec(_name);
        if (match) {
            const baseName = match[1];
            const numberStr = match[2];
            const newNumber = numberStr ? parseInt(numberStr) + 1 : 2;
            _name = `${baseName} (${newNumber})`;
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
