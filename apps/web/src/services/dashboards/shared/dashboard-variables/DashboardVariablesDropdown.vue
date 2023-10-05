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
import {
    cloneDeep, debounce, flattenDeep, get,
} from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ReferenceMap } from '@/store/modules/reference/type';

import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DashboardVariableSchemaProperty, SearchResourceOptions } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

interface Props {
    propertyName: string;
    referenceMap: ReferenceMap;
    disabled?: boolean;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any|null,
    searchText: '',
    variableProperty: computed<DashboardVariableSchemaProperty|undefined>(() => dashboardDetailState.variablesSchema.properties[props.propertyName]),
    variableName: computed<string|undefined>(() => state.variableProperty?.name),
    selected: computed<MenuItem[]>(() => {
        // Selected options data from backend can be undefined or string not string[]. Convert them to Array.
        const arrayOfSelectedOptions = flattenDeep([dashboardDetailState.variables[props.propertyName] ?? []]);

        if (state.variableProperty?.options?.type === 'REFERENCE_RESOURCE') {
            return arrayOfSelectedOptions.map((d) => ({ name: d, label: props.referenceMap[d]?.label ?? props.referenceMap[d]?.name ?? d }));
        }
        if (state.variableProperty?.options?.type === 'SEARCH_RESOURCE') {
            if (state.searchResourceOptions.length) {
                return arrayOfSelectedOptions.map((d) => ({
                    name: d,
                    label: state.searchResourceOptions.find((optionItem) => optionItem.key === d)?.name ?? d,
                }));
            }
            return arrayOfSelectedOptions.map((d) => ({ name: d, label: d }));
        }
        return arrayOfSelectedOptions.map((d) => ({ name: d, label: state.options.find((optionItem) => optionItem.name === d).label }));
    }),
    // Options State
    searchResourceOptions: []as {key: string; name: string}[],
    options: computed<MenuItem[]>(() => {
        let result;

        if (state.variableProperty?.options?.type === 'REFERENCE_RESOURCE') {
            result = Object.entries(props.referenceMap).map(([referenceKey, referenceItem]) => ({
                name: referenceKey, label: referenceItem?.label ?? referenceItem?.name ?? referenceKey,
            }));
        } else if (state.variableProperty?.options?.type === 'SEARCH_RESOURCE') {
            result = state.searchResourceOptions.map((d) => ({ name: d.key, label: d.name }));
        } else if (state.variableProperty?.options?.type === 'ENUM') {
            result = state.variableProperty?.options.values.map((d) => ({ name: d.key, label: d.label }));
        }
        return result ?? [];
    }),
    autocompleteApi: computed<ReturnType<typeof getCancellableFetcher>>(() => {
        const api = state.variableProperty?.options?.resource_key
            ? SpaceConnector.client.addOns.autocomplete.distinct
            : SpaceConnector.client.addOns.autocomplete.resource;
        return getCancellableFetcher(api);
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
    menu: toRef(state, 'options'),
    pageSize: 10,
});

const toggleMenu = () => {
    if (visibleMenu.value) hideContextMenu();
    else focusOnContextMenu();
};

const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideContextMenu);

// event
const handleClearSelected = () => {
    changeVariables([]);
};

const handleSelectOption = (_selected: MenuItem[]) => {
    changeVariables(_selected);
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
    dashboardDetailStore.$patch((_state) => {
        _state.variables = variables;
    });
};

const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);

const filtersHelper = new QueryHelper();

const getFilters = (variableProperty?: DashboardVariableSchemaProperty): QueryHelper['apiQuery']['filter']|undefined => {
    // NOTE: Some variables(asset) require specific API filters.
    if (variableProperty?.name === ASSET_VARIABLE_TYPE_INFO.asset_query_set.name) {
        filtersHelper.setFilters([{ k: 'ref_cloud_service_type.labels', o: '=', v: 'Compliance' }]);
    } else if (variableProperty?.name === ASSET_VARIABLE_TYPE_INFO.asset_account.name) {
        filtersHelper.setFilters([{ k: 'provider', o: '=', v: 'aws' }]);
    }

    const filters = filtersHelper.apiQuery.filter;
    if (filters.length) return filters;
    return undefined;
};
const loadSearchResourceOptions = async () => {
    try {
        const options = state.variableProperty?.options as SearchResourceOptions|undefined;
        if (options?.type !== 'SEARCH_RESOURCE') throw new Error('Invalid options type');
        const { status, response } = await state.autocompleteApi({
            resource_type: options.resource_type ?? 'cost_analysis.Cost',
            distinct_key: options.resource_key,
            options: {
                filter: getFilters(state.variableProperty),
            },
        });
        if (status === 'succeed') {
            state.searchResourceOptions = response.results;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const initVariable = () => {
    const variableSchema = dashboardDetailState.variablesSchema.properties[props.propertyName];
    if ((variableSchema.options as SearchResourceOptions)?.type === 'SEARCH_RESOURCE') {
        const path = (variableSchema.options as SearchResourceOptions).default_path;
        if (path !== undefined) {
            const found = get(state.searchResourceOptions, path, undefined);
            if (found) changeVariables([{ name: found.key, label: found.name }]);
        }
    }
    dashboardDetailStore.$patch((_state) => {
        _state.variablesInitMap = { ..._state.variablesInitMap, [props.propertyName]: true };
    });
};

watch(visibleMenu, (_visibleMenu) => {
    if (_visibleMenu) {
        initiateMenu();
    } else state.searchText = '';
}, { immediate: true });

watch(() => state.variableProperty, async (property) => {
    dashboardDetailStore.$patch((_state) => {
        _state.variablesInitMap = { ..._state.variablesInitMap, [props.propertyName]: false };
    });
    if (property.options?.type === 'SEARCH_RESOURCE') await loadSearchResourceOptions();
    initVariable();
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
                :class="{ 'is-visible': visibleMenu, 'filled-value': state.selected.length }"
                :disabled="state.variableProperty?.disabled || props.disabled"
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
                <button v-if="!state.variableProperty?.disabled && !state.variableProperty?.required"
                        :disabled="props.disabled"
                        class="option-delete-button"
                        :class="{'disabled': props.disabled}"
                        @click.stop="handleClearSelected"
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
                        :selected="state.selected"
                        :multi-selectable="variableProperty?.selection_type === 'MULTI'"
                        show-select-marker
                        :show-clear-selection="variableProperty?.selection_type === 'MULTI' && !variableProperty?.required"
                        @click-show-more="showMoreMenu"
                        @keyup:down:end="focusOnContextMenu()"
                        @update:selected="handleSelectOption"
                        @update:search-text="handleUpdateSearchText"
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
