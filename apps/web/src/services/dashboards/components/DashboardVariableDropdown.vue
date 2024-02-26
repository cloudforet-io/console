<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed,
    reactive, ref, toRef, toRefs, watch,
} from 'vue';

import {
    PBadge, PContextMenu, PI, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type {
    AutocompleteHandler, SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import {
    cloneDeep, debounce, flattenDeep,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { DashboardVariableSchemaProperty } from '@/schema/dashboard/_types/dashboard-type';

import type { ReferenceMap } from '@/store/modules/reference/type';

import { VariableModelFactory } from '@/lib/variable-models';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    propertyName: string;
    referenceMap: ReferenceMap;
    disabled?: boolean;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any|null,
    searchText: '',
    variableProperty: computed<DashboardVariableSchemaProperty|undefined>(() => dashboardDetailGetters.refinedVariablesSchema.properties[props.propertyName]),
    variableName: computed<string|undefined>(() => state.variableProperty?.name),
    selected: [] as MenuItem[],
    // Options State
    searchResourceOptions: []as {key: string; name: string}[],
    autocompleteApi: computed<ReturnType<typeof getCancellableFetcher>>(() => {
        const api = (state.variableProperty?.options?.reference_key ?? state.variableProperty?.options?.resource_key) // NOTE: Compatibility code for version 1.12.
            ? SpaceConnector.client.addOns.autocomplete.distinct
            : SpaceConnector.client.addOns.autocomplete.resource;
        return getCancellableFetcher(api);
    }),
    menuHandler: computed<AutocompleteHandler|undefined>(() => {
        const options = state.variableProperty?.options;
        if (!Array.isArray(options)) return undefined;
        const variableModelInfoList = options.map((config) => ({
            variableModel: new VariableModelFactory({ type: config.type, managedModelKey: config.key }),
            dataKey: config.dataKey,
        }));
        return getVariableModelMenuHandler(variableModelInfoList);
    }),
});


const {
    visibleMenu,
    refinedMenu,
    contextMenuStyle,
    hideContextMenu,
    focusOnContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    targetRef: toRef(state, 'targetRef'),
    contextMenuRef: toRef(state, 'contextMenuRef'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'searchText'),
    selected: toRef(state, 'selected'),
    handler: toRef(state, 'menuHandler'),
    pageSize: 10,
});

const toggleMenu = () => {
    if (visibleMenu.value) hideContextMenu();
    else focusOnContextMenu();
};

const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideContextMenu);

// event
const handleSelectOption = () => {
    changeVariables(state.selected);
};
const handleClearSelection = () => {
    state.selected = [];
    changeVariables([]);
};

// helper
const changeVariables = (changedSelected: MenuItem[]) => {
    const variables = cloneDeep(dashboardDetailState.variables);
    const reconvertedSelected = changedSelected.map((d) => d.name) as string[];
    if (reconvertedSelected.length === 0) {
        delete variables[props.propertyName];
    } else if (state.variableProperty?.selection_type === 'SINGLE') {
        variables[props.propertyName] = reconvertedSelected[0];
    } else {
        variables[props.propertyName] = reconvertedSelected;
    }
    dashboardDetailStore.setVariables(variables);
};

const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);
const handleClickShowMore = (item: SelectDropdownMenuItem) => {
    showMoreMenu(item._resultIndex);
};

const loadOptionItems = async (selectedValues?: string[]): Promise<MenuItem[]> => {
    let foundItems: MenuItem[] = [];
    const responses = await state.menuHandler(
        state.searchText,
        undefined,
        undefined,
        selectedValues?.map((d) => ({ name: d, label: d })),
    );
    const results = responses.map((res) => res.results).flat();
    foundItems = foundItems.concat(results);
    return foundItems;
};
const initVariableAndSelected = async () => {
    const items = await loadOptionItems();
    const found = items[0];
    if (found) {
        state.selected = [found];
        changeVariables([found]);
    }
};
const initSelected = async (value: any) => {
    // Selected options data from backend can be undefined or string not string[]. Convert them to Array.
    const selectedValues = flattenDeep([value ?? []]);
    const items = await loadOptionItems(selectedValues);
    const selectedItems = items.filter((item) => selectedValues.includes(item.name));
    if (selectedItems.length) {
        state.selected = selectedItems;
    } else {
        await initVariableAndSelected();
    }
};

watch(visibleMenu, (_visibleMenu) => {
    if (_visibleMenu) {
        initiateMenu();
    } else state.searchText = '';
}, { immediate: true });

watch(() => state.variableProperty, async (property) => {
    dashboardDetailStore.setVariablesInitMap({
        ...dashboardDetailState.variablesInitMap,
        [props.propertyName]: false,
    });

    const value = dashboardDetailState.variables[props.propertyName];
    if (value) {
        await initSelected(value);
    } else if (property?.required) {
        await initVariableAndSelected();
    } else {
        state.selected = [];
    }

    dashboardDetailStore.setVariablesInitMap({
        ...dashboardDetailState.variablesInitMap,
        [props.propertyName]: true,
    });
}, { immediate: true });


const {
    targetRef,
    contextMenuRef,
    variableProperty,
    variableName,
} = toRefs(state);

</script>

<template>
    <div ref="containerRef"
         class="dashboard-variable-dropdown"
         :class="{ 'open-menu': visibleMenu }"
    >
        <button ref="targetRef"
                class="dropdown-box"
                :class="{ 'is-visible': visibleMenu, 'filled-value': state.selected.length,
                          invalid: dashboardDetailGetters.isAllVariablesInitialized && state.variableProperty?.required && !state.selected.length }"
                :disabled="state.variableProperty?.readonly || props.disabled"
                @click="toggleMenu"
        >
            <span class="variable-contents">
                <span class="variable-label">{{ variableName }}</span>
                <span v-if="state.selected.length"
                      class="item-for-display"
                >{{ state.selected[0].label }}</span>
            </span>
            <template v-if="state.selected.length">
                <p-badge v-if="state.selected.length > 1"
                         class="selected-count"
                         style-type="blue300"
                         badge-type="subtle"
                >
                    +{{ state.selected.length - 1 }}
                </p-badge>
                <button v-if="!state.variableProperty?.readonly && !state.variableProperty?.required"
                        :disabled="props.disabled"
                        class="option-delete-button"
                        :class="{'disabled': props.disabled}"
                        @click.stop="handleClearSelection"
                >
                    <p-i name="ic_close"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    />
                </button>
            </template>

            <p-i :name="visibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                 :activated="visibleMenu"
                 color="inherit"
                 class="dropdown-icon"
            />
        </button>
        <p-context-menu v-show="visibleMenu"
                        ref="contextMenuRef"
                        class="options-menu"
                        searchable
                        :search-text="state.searchText"
                        :style="contextMenuStyle"
                        :menu="refinedMenu"
                        :selected.sync="state.selected"
                        :multi-selectable="variableProperty?.selection_type === 'MULTI'"
                        show-select-marker
                        :show-clear-selection="variableProperty?.selection_type === 'MULTI' && !variableProperty?.fixed"
                        @click-show-more="handleClickShowMore"
                        @keyup:down:end="focusOnContextMenu()"
                        @select="handleSelectOption"
                        @update:search-text="handleUpdateSearchText"
                        @clear-selection="handleClearSelection"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variable-dropdown {
    @apply inline-block;
    max-width: 22.5rem;

    &.open-menu {
        @apply relative;
    }

    .dropdown-box {
        @apply flex items-center border border-solid border-gray-300 bg-white w-full;
        border-radius: 0.75rem;
        height: 2rem;
        padding: 0 0.25rem 0 0.75rem;

        &.invalid {
            @apply border-alert;
        }

        &[disabled=disabled] {
            @apply bg-gray-100;
            cursor: not-allowed;
        }

        .variable-contents {
            @apply inline-flex text-gray-900 text-label-md flex-shrink w-full;
            max-width: 16.375rem;

            .variable-label {
                @apply flex-shrink-0;
                max-width: 11rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .item-for-display {
                @apply font-bold flex-shrink;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-left: 0.5rem;
            }
        }

        .selected-count {
            @apply flex-shrink-0;
            margin-left: 0.25rem;
        }

        .option-delete-button {
            @apply flex items-center flex-shrink-0 justify-center text-gray-400 rounded-full;
            margin-left: 0.5rem;

            &:hover:not(.disabled) {
                @apply bg-gray-200 text-gray-900;
            }
            &.disabled {
                @apply cursor-not-allowed;
            }
        }

        .dropdown-icon {
            @apply flex-shrink-0;
        }

        &:hover:not([disabled=disabled]) {
            @apply border-blue-600 bg-blue-100;
        }

        &.filled-value:not([disabled=disabled]) {
            @apply border-blue-300 bg-blue-100;

            &.is-visible {
                @apply border-blue-600 bg-blue-200;
            }
        }
    }

    /* custom design-system component - p-context-menu */
    :deep(.options-menu) {
        z-index: 10;
        margin-top: -1px;
        .label-wrapper {
            min-width: 7rem;
            width: max-content;
            max-width: 22.5rem;
        }
    }
}
</style>
