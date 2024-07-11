import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { get } from 'lodash';

import type { Granularity } from '@/schema/dashboard/_types/widget-type';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { WidgetFieldComponentProps, WidgetFieldOptions, WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { LabelsInfo } from '@/common/modules/widgets/types/widget-model';

interface UseGranularityMenuItemState {
    selectedValue: ComputedRef<WidgetFieldValues|undefined>;
    granularity: UnwrapRef<Granularity>;
    labelInfo: ComputedRef<LabelsInfo>;
    isDateSeparated: ComputedRef<boolean>;
    labelsMenuItem: ComputedRef<MenuItem[]|undefined>;
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
        currentSelectedValue: [] as string|string[],
        refinedSelectedValueList: computed(() => _state.selectedValueList.filter((item) => {
            if (Array.isArray(_state.currentSelectedValue)) {
                return !_state.currentSelectedValue.includes(item);
            }
            return item !== _state.currentSelectedValue;
        })),
        usedLabelsField: computed(() => {
            const usedLabelsInfo: DateField[] = [];
            _state.refinedSelectedValueList.forEach((item) => {
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
        isDateSeparated: computed(() => [DATE_FIELD.DAY, DATE_FIELD.MONTH, DATE_FIELD.YEAR].every((item) => Object.keys(state.labelInfo).includes(item))),
        labelsMenuItem: computed(() => {
            if (!state.labelInfo) return undefined;
            const originLabelsMenuItem = sortWidgetTableFields(Object.keys(state.labelInfo)).map((key) => {
                if (Object.values(DATE_FIELD).includes(key)) {
                    return ({
                        name: key,
                        label: key,
                        // disabled: _state.usedLabelsField.includes(key),
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
                    return dateRemovedLabelsMenuItem.filter((item) => item.name !== DATE_FIELD.DAY && item.name !== DATE_FIELD.YEAR);
                } if (state.granularity === 'YEARLY') {
                    return dateRemovedLabelsMenuItem.filter((item) => item.name !== DATE_FIELD.DAY && item.name !== DATE_FIELD.MONTH);
                }
                return dateRemovedLabelsMenuItem.filter((item) => item.name !== DATE_FIELD.MONTH && item.name !== DATE_FIELD.YEAR);
            }
            return originLabelsMenuItem;
        }),
    });
    watch(() => props.allValueMap, (formValueMap) => {
        const currentFieldValue: string|string[] = get(formValueMap, `${fieldName}.${labelsInfoValueRouteMap[fieldName ?? '']}`) ?? '';
        if (Array.isArray(currentFieldValue)) {
            // eslint-disable-next-line max-len
            const isSameValueWithBefore = !currentFieldValue.every((item) => ((Array.isArray(_state.currentSelectedValue)) ? _state.currentSelectedValue.includes(item) : _state.currentSelectedValue === item));
            const isSameLengthWithBefore = currentFieldValue.length === _state.currentSelectedValue.length;
            if (!isSameValueWithBefore || !isSameLengthWithBefore) {
                _state.currentSelectedValue = currentFieldValue;
            }
        } else if (_state.currentSelectedValue !== currentFieldValue) {
            _state.currentSelectedValue = currentFieldValue ?? [];
        }
        const newValueList:string[] = [];
        Object.entries(formValueMap ?? {}).forEach(([key, value]) => {
            const onlyFormValue = get(value, labelsInfoValueRouteMap[key]);
            if (Array.isArray(onlyFormValue)) {
                onlyFormValue.forEach((item) => {
                    newValueList.push(item);
                });
            } else newValueList.push(onlyFormValue);
        });
        const isSameValueListWithBefore = newValueList.every((item, index) => _state.selectedValueList[index] === item);
        if (!isSameValueListWithBefore) _state.selectedValueList = newValueList;
        if (state.granularity !== formValueMap?.granularity) state.granularity = formValueMap?.granularity ?? 'MONTHLY';
    });

    return {
        ...toRefs(state),
    };
};
