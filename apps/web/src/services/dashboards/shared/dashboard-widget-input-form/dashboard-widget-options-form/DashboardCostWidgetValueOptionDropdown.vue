<script setup lang="ts">
import {
    reactive, watch, ref, computed,
} from 'vue';

import {
    PIconButton, PSelectDropdown, PBadge, PCheckbox,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';

interface Props {
    optionKey?: string;
    selected?: SelectDropdownMenuItem[];
    invalid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    optionKey: '',
    selected: undefined,
    invalid: false,
});

const emit = defineEmits<{(e: 'update:selected', selected: SelectDropdownMenuItem[]): void;
    (e: 'delete'): void;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;

const selectDropdownRef = ref<null|HTMLElement>(null);

const state = reactive({
    visibleMenu: false,
    selectedKey: undefined as SelectDropdownMenuItem|undefined,
    valueTarget: props.optionKey === 'cost_tag_value' ? 'tags' : 'additional_info',
    selectedItems: [] as SelectDropdownMenuItem[],
    selectedMenuList: computed<string[]>(() => {
        const selectedMenuListName = state.selectedItems.map((d) => d.name);
        return state.selectedItems.length > 0 ? selectedMenuListName : [] as string[];
    }),
});

const variableModelKeys = {
    cost_tag_value: 'cost_tag_keys',
    cost_additional_info_value: 'cost_additional_info_keys',
} as const;

/* Handler */
const menuHandler: AutocompleteHandler = async (inputText, pageStart, pageLimit = 10) => {
    // key handler
    if (!state.selectedKey) {
        const param = {
            data_source_id: widgetFormState.widgetOptions.cost_data_source,
            query: {
                only: [variableModelKeys[props.optionKey]],
                filter: [
                    {
                        key: variableModelKeys[props.optionKey],
                        value: null,
                        operator: 'not',
                    },
                    {
                        key: variableModelKeys[props.optionKey],
                        value: inputText,
                        operator: 'contain',
                    },
                ],
                page: {
                    start: pageStart,
                    limit: pageLimit,
                },
            },
        };
        const { results } = await SpaceConnector.clientV2.costAnalysis.dataSource.list(param);
        return {
            results: results[0][variableModelKeys[props.optionKey]].map((result) => (
                { label: result, name: `${state.valueTarget}.${result}` }
            )),
        };
    }
    // value handler
    const param = {
        query: {
            distinct: state.selectedKey?.name,
            filter: [
                {
                    key: state.selectedKey?.name,
                    value: null,
                    operator: 'not',
                },
            ],
            page: {
                start: pageStart,
                limit: pageLimit,
            },
        },
    };
    try {
        const res = await SpaceConnector.clientV2.costAnalysis.cost.stat(param);
        return {
            results: res.results.reduce((results, d) => {
                if (d !== '' && d !== undefined && d !== null) results.push({ label: d, name: `${state.selectedKey?.name}.${d}` });
                return results;
            }, [{ label: state.selectedKey?.label, type: 'header' }]),
            totalCount: res.total_count,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            totalCount: 0,
        };
    }
};

/* Components */
const handleUpdateSelected = (selected: SelectDropdownMenuItem) => {
    if (!state.selectedKey) {
        state.selectedKey = selected;
        menuHandler('');
        if (selectDropdownRef.value) {
            selectDropdownRef.value.reloadMenu();
        }
    } else {
        const selectedItem = { name: selected.name, label: `${state.selectedKey?.label}: ${selected.label}`, target: 'value' };
        emit('update:selected', [...state.selectedItems, selectedItem]);
        initMenu();
    }
};
const handleDeleteButton = () => {
    emit('delete');
    emit('update:selected', []);
    initMenu();
};
const handleChangeSelectedListItem = (list: (SelectDropdownMenuItem|string)[]) => {
    const selectedListItemIdx = state.selectedItems.findIndex((d) => d.name === list[list.length - 1]);
    state.selectedItems.splice(selectedListItemIdx, 1);
    emit('update:selected', state.selectedItems);
};
const initMenu = () => {
    state.visibleMenu = false;
    state.selectedKey = undefined;
};

/* Watcher */
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
        <!-- TODO: Applying selection list and 'Show more' button soon -->
        <p-select-dropdown ref="selectDropdownRef"
                           class="select-dropdown"
                           use-fixed-menu-style
                           is-fixed-width
                           multi-selectable
                           :visible-menu.sync="state.visibleMenu"
                           :handler="menuHandler"
                           :selected="state.selectedItems"
                           :invalid="props.invalid"
                           @select="handleUpdateSelected"
        >
            <template #menu-header>
                <div v-if="state.selectedItems.length > 0"
                     class="selected-menu-wrapper"
                >
                    <p-checkbox v-for="(item, idx) in state.selectedItems"
                                :key="idx"
                                v-model="state.selectedMenuList"
                                class="selected-menu-list-item"
                                :value="item.name"
                                @change="handleChangeSelectedListItem"
                    >
                        {{ item.label }}
                    </p-checkbox>
                </div>
            </template>
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
                <span>{{ item.label }}</span>
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
        .selected-menu-wrapper {
            @apply flex flex-col bg-blue-200 text-label-md;
            .selected-menu-list-item {
                width: 100%;
                padding: 0.5rem 0.25rem;
            }
        }
    }
    .selected-item-badge {
        margin-left: 0.25rem;
    }
}
</style>
