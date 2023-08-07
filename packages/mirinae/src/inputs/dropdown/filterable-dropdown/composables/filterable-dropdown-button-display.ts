import type { Ref } from 'vue';
import { computed } from 'vue';

import type {
    FilterableDropdownAppearanceType,
    FilterableDropdownMenuItem,
} from '@/inputs/dropdown/filterable-dropdown/type';
import type { InputAppearanceType } from '@/inputs/input/text-input/type';

interface UseDropdownButtonDisplay {
    multiSelectable: Ref<boolean|undefined>;
    selected: Ref<FilterableDropdownMenuItem[]>;
    appearanceType: Ref<FilterableDropdownAppearanceType|InputAppearanceType|undefined>;
}
export const useFilterableDropdownButtonDisplay = ({
    multiSelectable, selected, appearanceType,
}: UseDropdownButtonDisplay) => {
    const displayValueOnDropdownButton = computed(() => {
        if (multiSelectable.value) {
            if (appearanceType.value === 'badge') {
                if (selected.value[0]) return selected.value[0].label || selected.value[0].name;
                return undefined;
            }
            if (appearanceType.value === 'stack') {
                if (selected.value.length > 0) return '';
                return undefined;
            }
            // basic case
            if (selected.value.length) return selected.value.map((d) => d.label ?? d.name).join(', ');
            return undefined;
        }
        // single select case
        if (selected.value[0]) return selected.value[0].label || selected.value[0].name;
        return undefined;
    });
    const showTagsOnDropdownButton = computed(() => multiSelectable.value && appearanceType.value === 'stack');
    const displayBadgeValueOnDropdownButton = computed(() => {
        if (multiSelectable.value && appearanceType.value === 'badge') {
            if (selected.value.length > 1) return `+${selected.value.length - 1}`;
            return undefined;
        }
        return undefined;
    });
    return {
        displayValueOnDropdownButton,
        showTagsOnDropdownButton,
        displayBadgeValueOnDropdownButton,
    };
};
