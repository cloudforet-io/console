<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import { PIconButton, PSelectDropdown, PBadge } from '@spaceone/design-system';
import type { KeyItem } from '@spaceone/design-system/src/inputs/search/query-search/type';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { ValueHandler } from '@cloudforet/core-lib/component-util/query-search/type';

import { COST_VALUE_WIDGET_OPTION_CONFIGS } from '@/services/dashboards/widgets/_configs/widget-options-schema';

interface Props {
    schemaKey?: string;
    selected?: SelectDropdownMenuItem[];
    handler?: AutocompleteHandler[];
    invalid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    schemaKey: '',
    selected: undefined,
    handler: undefined,
    invalid: false,
});

const emit = defineEmits<{(e: 'update:selected', selected: SelectDropdownMenuItem[]): void;
    (e: 'delete'): void;
}>();

const state = reactive({
    visibleMenu: false,
    replaceHandler: false,
    valueTarget: props.schemaKey === COST_VALUE_WIDGET_OPTION_CONFIGS.cost_tag_value.key ? 'tags' : 'additional_info',
    handler: props.handler[0] as ValueHandler|AutocompleteHandler|undefined,
    selectedItems: [] as SelectDropdownMenuItem[],
    selectedItem: {} as SelectDropdownMenuItem,
    selectedKey: {} as KeyItem,
});

const handleUpdateSelected = (selected: SelectDropdownMenuItem) => {
    if (!state.replaceHandler) {
        const displayKey = selected.name?.split('.')[1].replace(' ', '_') as string;
        state.selectedKey = { name: selected.name as string, label: displayKey };
        state.handler = makeDistinctValueHandler('cost_analysis.Cost', state.selectedKey.name);
        state.replaceHandler = true;
    } else {
        state.selectedItem = { name: `${state.selectedKey.name}.${selected.name}`, label: `${state.selectedKey.label}: ${selected.label}`, target: 'value' };
        emit('update:selected', [...state.selectedItems, state.selectedItem]);
        initMenu();
    }
};
const handleDeleteButton = () => {
    emit('delete');
    emit('update:selected', []);
    initMenu();
};
const initMenu = () => {
    state.visibleMenu = false;
    state.replaceHandler = false;
    state.handler = props.handler[0];
    state.selectedItem = {} as SelectDropdownMenuItem;
    state.selectedKey = {} as KeyItem;
};

watch(() => state.visibleMenu, (visibleMenu) => {
    if (!visibleMenu) {
        initMenu();
    }
});
watch(() => props.selected, (selected) => {
    if (selected.length > 0) {
        // excluding the initial value
        state.selectedItems = selected.reduce((items, d) => {
            if (d.target === 'value') {
                items.push({
                    name: d.name,
                    label: d.label,
                    target: d.target || 'key',
                });
            }
            return items;
        }, [] as SelectDropdownMenuItem[]);
    }
});
</script>

<template>
    <div class="select-form-wrapper">
        <p-select-dropdown class="select-dropdown"
                           use-fixed-menu-style
                           is-fixed-width
                           multi-selectable
                           :visible-menu.sync="state.visibleMenu"
                           :handler="state.handler"
                           :selected="state.selectedItems"
                           :invalid="props.invalid"
                           :replace-handler="state.replaceHandler"
                           @select="handleUpdateSelected"
        >
            <template #dropdown-button="item">
                <div v-if="item.target === 'value'"
                     class="dropdown-inner"
                >
                    <span class="item-label">{{ item.label }}</span>
                    <p-badge v-if="state.selectedItems.length > 1"
                             class="selected-item-badge"
                             style-type="blue200"
                             badge-type="Subtle"
                    >
                        + {{ state.selectedItems.length - 1 }}
                    </p-badge>
                </div>
                <span v-else
                      class="placeholder"
                >{{ $t('COMPONENT.SELECT_DROPDOWN.SELECT') }}</span>
            </template>
            <template #menu-item--format="{item}">
                <span>{{ state.replaceHandler ? item.label : item.name.split('.')[1] }}</span>
            </template>
            <template v-if="state.selectedItem.label"
                      #menu-header
            >
                <span class="key-item-header">{{ state.selectedItem.label }}</span>
            </template>
        </p-select-dropdown>
        <p-icon-button class="delete-button"
                       shape="square"
                       style-type="negative-secondary"
                       name="ic_delete"
                       @click="handleDeleteButton"
        />
    </div>
</template>

<style scoped lang="postcss">
.select-form-wrapper {
    @apply flex;
    gap: 0.25rem;
    .select-dropdown {
        flex: 1;
        .placeholder {
            @apply text-label-md text-gray-600;
        }
        .key-item-header {
            @apply text-label-sm text-gray-500 font-bold;
            margin-left: 0.5rem;
        }
    }
    .selected-item-badge {
        margin-left: 0.25rem;
    }
}
</style>
