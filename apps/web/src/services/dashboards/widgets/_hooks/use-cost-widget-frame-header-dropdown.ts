import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import type { SelectorOptions, SelectorType } from '@/services/dashboards/widgets/_configs/config';

interface UseCostWidgetFrameHeaderDropdownOptions {
    selectorOptions: Ref<SelectorOptions>;
}
export const useCostWidgetFrameHeaderDropdown = ({ selectorOptions }: UseCostWidgetFrameHeaderDropdownOptions) => {
    const selectorItems = computed<MenuItem[]>(() => {
        if (!selectorOptions.value.enabled) return [];
        if (selectorOptions.value.type === 'cost-usage') {
            if (!selectedSelectorType.value) selectedSelectorType.value = 'cost';
            return [
                { type: 'item', name: 'cost', label: 'Cost' },
                { type: 'item', name: 'usage', label: 'Usage' },
            ];
        }
        if (!selectedSelectorType.value) selectedSelectorType.value = 'day';
        return [
            { type: 'item', name: 'day', label: 'Day' },
            { type: 'item', name: 'month', label: 'Month' },
        ];
    });
    const selectedSelectorType = ref<SelectorType|undefined>(undefined);

    return {
        selectorItems, selectedSelectorType,
    };
};
