import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { get } from 'lodash';

import type { Granularity } from '@/schema/dashboard/_types/widget-type';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { WidgetFieldComponentProps, WidgetFieldOptions, WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';

interface UseGranularityMenuItemState {
    selectedValue: ComputedRef<WidgetFieldValues|undefined>;
    granularity: UnwrapRef<Granularity>;
    labelInfo: ComputedRef<Record<string, string>>;
    isDateSeparated: ComputedRef<boolean>;
    labelsMenuItem: ComputedRef<MenuItem[]>;
}

const labelsInfoValueRouteMap: {
    [key in WidgetFieldName]?: string;
} = {
    tableDataField: 'value',
    xAxis: 'value',
    yAxis: 'value',
    stackBy: 'value',
    lineBy: 'value',
    groupBy: 'value',
    categoryBy: 'value',
};

type DateField = typeof DATE_FIELD[keyof typeof DATE_FIELD];

export const useGranularityMenuItem = (props: WidgetFieldComponentProps<WidgetFieldOptions>, fieldName?: WidgetFieldName) => {
    const _state = reactive({
        selectedValueList: [] as string[],
        usedLabelsField: computed(() => {
            const usedLabelsInfo: DateField[] = [];
            _state.selectedValueList.forEach((item) => {
                if (Object.values(DATE_FIELD).includes(item)) {
                    usedLabelsInfo.push(item);
                }
            });
            return usedLabelsInfo;
        }),
    });

    const state = reactive<UseGranularityMenuItemState>({
        selectedValue: computed(() => (fieldName ? props.allValueMap[fieldName] : undefined)),
        granularity: 'MONTHLY',
        labelInfo: computed(() => props.dataTable?.labels_info ?? {}),
        isDateSeparated: computed(() => !Object.keys(state.labelInfo).includes(DATE_FIELD.DATE)),
        labelsMenuItem: computed<MenuItem[]>(() => {
            const originLabelsMenuItem = sortWidgetTableFields(Object.keys(state.labelInfo)).map((key) => {
                if (Object.values(DATE_FIELD).includes(key)) {
                    return ({
                        name: key,
                        label: key,
                        disabled: _state.usedLabelsField.includes(key),
                    });
                }
                return ({
                    name: key,
                    label: key,
                });
            });
            if (state.isDateSeparated) {
                const dateRemovedLabelsMenuItem = originLabelsMenuItem.filter((item) => item.name !== DATE_FIELD.DATE);
                if (state.granularity === 'MONTHLY') {
                    return dateRemovedLabelsMenuItem.filter((item) => item.name !== DATE_FIELD.DAY);
                } if (state.granularity === 'YEARLY') {
                    return dateRemovedLabelsMenuItem.filter((item) => item.name !== DATE_FIELD.DAY && item.name !== DATE_FIELD.MONTH);
                }
                return dateRemovedLabelsMenuItem;
            }
            return originLabelsMenuItem;
        }),
    });
    watch(() => props.allValueMap, (valueMap) => {
        const valueList:string[] = [];
        const currentFieldValue = get(valueMap, `${fieldName}.${labelsInfoValueRouteMap[fieldName ?? '']}`);
        Object.entries(valueMap ?? {}).forEach(([key, value]) => {
            const fieldValue:string|string[] = get(value, labelsInfoValueRouteMap[key]);
            if (Array.isArray(fieldValue)) {
                fieldValue.forEach((item) => {
                    if (Array.isArray(currentFieldValue)) {
                        currentFieldValue.forEach((currentItem) => {
                            if (item !== currentItem) {
                                valueList.push(item);
                            }
                        });
                    } else if (item !== currentFieldValue) {
                        valueList.push(item);
                    }
                });
            } else if (fieldValue !== currentFieldValue) {
                valueList.push(fieldValue);
            }
        });
        const isSameValueListWithBefore = valueList.every((item) => _state.selectedValueList.includes(item));
        if (!isSameValueListWithBefore) {
            _state.selectedValueList = valueList;
        }
        if (state.granularity !== valueMap?.granularity) {
            state.granularity = valueMap?.granularity ?? 'MONTHLY';
        }
    });

    return {
        ...toRefs(state),
    };
};
