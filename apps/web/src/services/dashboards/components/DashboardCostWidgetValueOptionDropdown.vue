<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    reactive, watch, ref, toRef,
} from 'vue';

import {
    PIconButton, PBadge, PContextMenu, PI, useContextMenuController,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useWidgetFormStore } from '@/services/dashboards/stores/widget-form-store';

const VARIABLE_MODEL_KEYS = {
    cost_tag_value: 'cost_tag_keys',
    cost_additional_info_value: 'cost_additional_info_keys',
} as const;

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

const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement|null>(null);
const containerRef = ref<HTMLElement|null>(null);

const state = reactive({
    visibleMenu: false,
    searchText: '',
    selectedItems: [] as SelectDropdownMenuItem[],
    selectedKey: undefined as SelectDropdownMenuItem|undefined,
    valueTarget: props.optionKey === 'cost_tag_value' ? 'tags' : 'additional_info',
});

/* Handler */
const menuHandler: AutocompleteHandler = async (inputText, pageStart, pageLimit = 6) => {
    // key handler
    if (!state.selectedKey) {
        const param = {
            data_source_id: widgetFormState.widgetOptions.cost_data_source,
            query: {
                only: [VARIABLE_MODEL_KEYS[props.optionKey]],
                filter: [
                    {
                        key: VARIABLE_MODEL_KEYS[props.optionKey],
                        value: null,
                        operator: 'not',
                    },
                ],
            },
        };
        try {
            const { results } = await SpaceConnector.clientV2.costAnalysis.dataSource.list(param);
            const refinedMenuItems = results[0][VARIABLE_MODEL_KEYS[props.optionKey]].reduce((result, d) => {
                if (d !== '' && d !== undefined && d !== null) result.push({ label: d, name: `${state.valueTarget}.${d}` });
                return result;
            }, []);

            const refinedMenuItemsFilteredByInputValue = refinedMenuItems.filter((d) => (d.label as string).toLowerCase().includes(inputText.toLowerCase()));
            const slicedResults = refinedMenuItemsFilteredByInputValue?.slice((pageStart ?? 1) - 1, pageLimit);

            return {
                results: slicedResults,
                more: pageLimit < refinedMenuItemsFilteredByInputValue.length,
            };
        } catch (e) {
            ErrorHandler.handleError(e);
            return {
                results: [],
            };
        }
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

    if (inputText !== '') {
        param.query.filter.push({
            key: state.selectedKey?.name,
            value: inputText,
            operator: 'contain',
        });
    }

    try {
        const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.cost.stat(param);
        const refinedResultsItems = results.reduce((result, d, index) => {
            if ((!pageStart || pageStart === 1) && index === 0) {
                result.push({ label: state.selectedKey?.label, type: 'header' });
            }
            if (d !== '' && d !== undefined && d !== null) result.push({ label: d, name: `${state.selectedKey?.name}.${d}` });
            return result;
        }, []);
        return {
            results: refinedResultsItems,
            totalCount: total_count,
            more: pageLimit - 1 < refinedResultsItems.length,
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
const updateSearchText = debounce(async (searchText: string) => {
    state.searchText = searchText;
    await reloadMenu();
}, 200);
const handleClickDropdownButton = () => {
    state.visibleMenu = !state.visibleMenu;
};
const handleSelectMenuItem = async (item: SelectDropdownMenuItem) => {
    if (item?.target !== 'value') {
        if (!state.selectedKey) {
            state.selectedKey = item;
            state.searchText = '';
            await reloadMenu();
        } else {
            const selectedItem = { name: item.name, label: `${state.selectedKey?.label}: ${item.label}`, target: 'value' };
            emit('update:selected', [...state.selectedItems, selectedItem]);
            await resetMenu();
        }
    } else {
        await reloadMenu();
    }
};
const handleClickShowMore = async () => {
    await showMoreMenu();
};
const handleDeleteButton = () => {
    emit('delete');
    emit('update:selected', []);
    resetMenu();
};

/* context menu controller */
const {
    contextMenuStyle,
    loading,
    refinedMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef,
    contextMenuRef: menuRef,
    visibleMenu: toRef(state, 'visibleMenu'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'searchText'),
    selected: toRef(state, 'selectedItems'),
    handler: ref(menuHandler),
    pageSize: 6,
});

const resetMenu = () => {
    state.visibleMenu = false;
    state.searchText = '';
    state.selectedKey = undefined;
};

onClickOutside(containerRef, resetMenu);

/* Watcher */
watch(() => state.visibleMenu, (visibleMenu) => {
    if (!visibleMenu) {
        resetMenu();
    } else {
        initiateMenu();
        reloadMenu();
    }
});
watch(() => props.selected, (selected) => {
    if (selected.length > 0) {
        // excluding the initial value
        state.selectedItems = selected.reduce((items, d) => {
            if (d?.target === 'value') {
                items.push({
                    name: d?.name,
                    label: d?.label,
                    target: d?.target || 'key',
                });
            }
            return items;
        }, [] as SelectDropdownMenuItem[]);
    }
});
</script>

<template>
    <div ref="containerRef"
         class="select-form-wrapper"
    >
        <div ref="targetRef"
             class="dropdown-button-wrapper"
        >
            <div :class="{
                     'dropdown-button': true,
                     invalid: props.invalid,
                     opened: state.visibleMenu,
                 }"
                 @click="handleClickDropdownButton"
            >
                <div class="selection-display-wrapper">
                    <div v-if="state.selectedItems.length > 0"
                         class="dropdown-inner"
                    >
                        <span class="item-label">{{ state.selectedItems[0].label }}</span>
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
                    >
                        {{ $t('COMPONENT.SELECT_DROPDOWN.SELECT') }}
                    </span>
                </div>
                <span class="arrow-button">
                    <p-i :name="state.visibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                         width="1.5rem"
                         height="1.5rem"
                         color="inherit"
                    />
                </span>
            </div>
            <p-icon-button class="delete-button"
                           shape="square"
                           style-type="negative-secondary"
                           name="ic_delete"
                           @click="handleDeleteButton"
            />
        </div>
        <p-context-menu v-if="state.visibleMenu"
                        ref="menuRef"
                        class="dropdown-context-menu"
                        searchable
                        show-select-marker
                        multi-selectable
                        :style="contextMenuStyle"
                        :selected="state.selectedItems"
                        :loading="loading"
                        :menu="refinedMenu"
                        :search-text="state.searchText"
                        :highlight-term="state.searchText"
                        @keyup:esc="resetMenu"
                        @update:search-text="updateSearchText"
                        @click-done="resetMenu"
                        @click-show-more="handleClickShowMore"
                        @select="handleSelectMenuItem"
        />
    </div>
</template>

<style scoped lang="postcss">
.select-form-wrapper {
    .dropdown-button-wrapper {
        @apply flex items-center;
        width: 100%;
        gap: 0.25rem;
        .dropdown-button {
            @apply flex justify-between items-center bg-white text-label-md font-normal border rounded border-gray-300 cursor-pointer;
            width: 100%;
            max-width: 15.25rem;
            min-height: 2rem;
            gap: 0.25rem;
            padding-left: 0.5rem;
            .selection-display-wrapper {
                @apply flex flex-grow flex-shrink items-center text-label-md;
                width: calc(100% - 3rem);
                padding-top: 0.375rem;
                padding-bottom: 0.375rem;
                .placeholder {
                    @apply text-gray-600;
                }
                .dropdown-inner {
                    @apply truncate flex items-center;
                    .item-label {
                        @apply truncate;
                        flex: 1;
                    }
                    .selected-item-badge {
                        margin-left: 0.25rem;
                    }
                }
            }
            .arrow-button {
                @apply inline-flex items-center text-gray-600 cursor-pointer;
                width: 1.75rem;
            }
            &:not(.invalid):hover {
                @apply border-secondary;
            }
            &.invalid {
                @apply border-alert;
            }
            &.opened {
                @apply border-secondary;
                .arrow-button {
                    @apply text-secondary;
                }
            }
        }
    }
    .dropdown-context-menu {
        @apply fixed;
        z-index: 1000;
        max-height: 15rem;
    }
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    .p-context-menu-item {
        &:not(.selected) {
            .select-marker {
                @apply hidden;
            }
        }
    }
}
</style>
