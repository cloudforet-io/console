import type { Ref } from 'vue';
import { computed } from 'vue';

import type {
    FilterableDropdownAppearanceType,
    FilterableDropdownMenuItem,
} from '@/inputs/dropdown/filterable-dropdown/type';
import { i18n } from '@/translations';

interface UseDropdownButtonDisplay {
    multiSelectable: Ref<boolean|undefined>;
    selected: Ref<FilterableDropdownMenuItem[]>;
    appearanceType: Ref<FilterableDropdownAppearanceType|undefined>;
    placeholder: Ref<string|undefined>;
}
export const useFilterableDropdownButtonDisplay = ({
    multiSelectable, selected, appearanceType, placeholder,
}: UseDropdownButtonDisplay) => {
    const displayValueOnDropdownButton = computed(() => {
        if (multiSelectable.value) {
            if (appearanceType.value === 'badge') {
                if (selected.value[0]) return selected.value[0].label || selected.value[0].name;
                return placeholder.value ?? i18n.t('COMPONENT.FILTERABLE_DROPDOWN.PLACEHOLDER');
            }
            if (appearanceType.value === 'stack') {
                if (selected.value.length > 0) return '';
                return placeholder.value ?? i18n.t('COMPONENT.FILTERABLE_DROPDOWN.PLACEHOLDER');
            }
            // basic case
            if (selected.value.length) return selected.value.map((d) => d.label ?? d.name).join(', ');
            return placeholder.value ?? i18n.t('COMPONENT.FILTERABLE_DROPDOWN.PLACEHOLDER');
        }
        // single select case
        if (selected.value[0]) return selected.value[0].label || selected.value[0].name;
        return placeholder.value ?? i18n.t('COMPONENT.FILTERABLE_DROPDOWN.PLACEHOLDER');
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
