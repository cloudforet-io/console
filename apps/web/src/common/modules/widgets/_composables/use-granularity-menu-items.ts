import type { ComputedRef } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { get } from 'lodash';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import type { WidgetFieldComponentProps, WidgetFieldOptions, WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';

interface UseGranularityMenuItemState {
    selectedValue: ComputedRef<WidgetFieldValues|undefined>;
    granularity: ComputedRef<WidgetFieldValues>;
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

export const useGranularityMenuItem = (props: WidgetFieldComponentProps<WidgetFieldOptions>, fieldName?: WidgetFieldName): UseGranularityMenuItemState => {
    const _state = reactive({
        usedLabelsField: computed(() => {
            const usedLabelsInfo: DateField[] = [];
            Object.entries(props.allValueMap ?? {}).forEach(([key, value]) => {
                const fieldValue:string|string[] = get(value, labelsInfoValueRouteMap[key]);
                if (key !== fieldName) {
                    if (Array.isArray(fieldValue)) {
                        fieldValue.forEach((item) => {
                            if (Object.values(DATE_FIELD).includes(item)) {
                                usedLabelsInfo.push(item);
                            }
                        });
                    } else if (Object.values(DATE_FIELD).includes(fieldValue)) {
                        usedLabelsInfo.push(fieldValue);
                    }
                }
            });
            return usedLabelsInfo;
        }),
    });

    const state = reactive<UseGranularityMenuItemState>({
        selectedValue: computed(() => (fieldName ? props.allValueMap[fieldName] : undefined)),
        granularity: computed(() => props.allValueMap?.granularity),
        labelInfo: computed(() => props.dataTable?.labels_info ?? {}),
        isDateSeparated: computed(() => !Object.keys(state.labelInfo).includes(DATE_FIELD.DATE)),
        labelsMenuItem: computed<MenuItem[]>(() => {
            const originLabelsMenuItem = Object.keys(state.labelInfo).map((key) => {
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

    return {
        ...toRefs<UseGranularityMenuItemState>(state),
    };
};
