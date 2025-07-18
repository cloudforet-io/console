<script setup lang="ts">

import { onClickOutside } from '@vueuse/core/index';
import {
    computed, onMounted, reactive, ref,
} from 'vue';

import { isArray } from 'lodash';

import {
    PSelectDropdown, PContextMenu, PIconButton, PI, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';

import { useProxyValue } from '@/common/composables/proxy-state';
import {
    DATA_TABLE_QUERY_OPERATOR,
    KEYWORD_FILTER_DISABLED_KEYS,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { isGlobalVariableFormat } from '@/common/modules/widgets/_helpers/global-variable-helper';
import { useWidgetContextStore } from '@/common/modules/widgets/_store/widget-context-store';
import type { DataTableQueryFilterForDropdown } from '@/common/modules/widgets/types/widget-data-table-type';

import { blue, gray } from '@/styles/colors';

import { getOrderedGlobalVariables } from '@/services/_shared/dashboard/dashboard-detail/helpers/dashboard-global-variables-helper';


interface Props {
    filterItem: MenuItem;
    handler: AutocompleteHandler;
    selectedFilter?: DataTableQueryFilterForDropdown;
    loading?: boolean;
    initSelectedWithHandler?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'delete'): void;
    (e: 'update:selected-filter', filter: DataTableQueryFilterForDropdown): void;
}>();

const widgetContextStore = useWidgetContextStore();
const widgetContextState = widgetContextStore.state;

const operatorButtonRef = ref<HTMLElement | null>(null);

const state = reactive({
    visibleMenu: false,
    operatorMenu: computed<MenuItem[]>(() => {
        if (KEYWORD_FILTER_DISABLED_KEYS.includes(props.filterItem?.name)) {
            return [
                {
                    name: DATA_TABLE_QUERY_OPERATOR.in.operator,
                    label: DATA_TABLE_QUERY_OPERATOR.in.label,
                    key: DATA_TABLE_QUERY_OPERATOR.in.key,
                },
                {
                    name: DATA_TABLE_QUERY_OPERATOR.not_in.operator,
                    label: DATA_TABLE_QUERY_OPERATOR.not_in.label,
                    key: DATA_TABLE_QUERY_OPERATOR.not_in.key,
                },
                {
                    name: DATA_TABLE_QUERY_OPERATOR.use_global_variable.operator,
                    label: DATA_TABLE_QUERY_OPERATOR.use_global_variable.label,
                    key: DATA_TABLE_QUERY_OPERATOR.use_global_variable.key,
                },
            ];
        }
        return [
            // {
            //     name: DATA_TABLE_QUERY_OPERATOR.contain_in.operator,
            //     label: DATA_TABLE_QUERY_OPERATOR.contain_in.label,
            //     key: DATA_TABLE_QUERY_OPERATOR.contain_in.key,
            // },
            // {
            //     name: DATA_TABLE_QUERY_OPERATOR.not_contain_in.operator,
            //     label: DATA_TABLE_QUERY_OPERATOR.not_contain_in.label,
            //     key: DATA_TABLE_QUERY_OPERATOR.not_contain_in.key,
            // },
            {
                name: DATA_TABLE_QUERY_OPERATOR.in.operator,
                label: DATA_TABLE_QUERY_OPERATOR.in.label,
                key: DATA_TABLE_QUERY_OPERATOR.in.key,
            },
            {
                name: DATA_TABLE_QUERY_OPERATOR.not_in.operator,
                label: DATA_TABLE_QUERY_OPERATOR.not_in.label,
                key: DATA_TABLE_QUERY_OPERATOR.not_in.key,
            },
            {
                name: DATA_TABLE_QUERY_OPERATOR.use_global_variable.operator,
                label: DATA_TABLE_QUERY_OPERATOR.use_global_variable.label,
                key: DATA_TABLE_QUERY_OPERATOR.use_global_variable.key,
            },
        ];
    }),
    selectedOperator: [] as MenuItem[],
    proxySelectedFilter: useProxyValue<DataTableQueryFilterForDropdown>('selectedFilter', props, emit),
    globalVariableItems: computed<MenuItem[]>(() => {
        const _refinedProperties: DashboardGlobalVariable[] = Object.values(widgetContextState.dashboard?.vars_schema?.properties ?? {});
        const _orderedVariables = getOrderedGlobalVariables(_refinedProperties);
        return _orderedVariables.map((variable) => ({
            name: `{{ global.${variable.key} }}`,
            label: variable.name,
        }));
    }),
    selectedFilterValue: computed<MenuItem[]>(() => {
        if (state.selectedOperator[0]?.key === DATA_TABLE_QUERY_OPERATOR.use_global_variable.key) {
            const selected = state.globalVariableItems.find((item) => item.name === state.proxySelectedFilter?.v);
            return selected ? [selected] : [];
        }
        return state.proxySelectedFilter?.v;
    }),
});

const handleClickDropdown = () => {
    state.visibleMenu = !state.visibleMenu;
};
const handleSelectOperator = (operator: MenuItem) => {
    if (operator?.name === undefined) return;
    state.selectedOperator = [operator];

    const defaultFilterValue = operator?.name === DATA_TABLE_QUERY_OPERATOR.use_global_variable.operator ? undefined : [];
    const _operator = operator?.name === DATA_TABLE_QUERY_OPERATOR.use_global_variable.operator ? 'in' : operator.name;
    state.proxySelectedFilter = {
        ...state.proxySelectedFilter,
        o: _operator,
        v: defaultFilterValue,
    };
    state.visibleMenu = false;
};

const handleDeleteFilter = () => {
    emit('delete');
};

const handleUpdateFilterDropdown = (selected: string|MenuItem[], isGlobalVariable?: boolean) => {
    state.proxySelectedFilter = {
        ...state.proxySelectedFilter,
        v: isGlobalVariable ? selected[0]?.name : selected,
    };
};

const handleUpdateKeywordSelected = (selected: MenuItem[]) => {
    state.proxySelectedFilter = {
        ...state.proxySelectedFilter,
        v: selected,
    };
};

onClickOutside(operatorButtonRef, () => {
    state.visibleMenu = false;
});

onMounted(() => {
    const operator = state.operatorMenu.find((item) => props.selectedFilter?.v && !isGlobalVariableFormat(props.selectedFilter?.v) && item.name === props.selectedFilter.o);
    const isUseGlobalVariable = props.selectedFilter?.v
        && !isArray(props.selectedFilter?.v) // useGlobalVariableOperator's value is string like '{{ global.variable }}'
        && isGlobalVariableFormat(props.selectedFilter?.v) // useGlobalVariableOperator's value need to be formatted like '{{ global.variable }}'
        && props.selectedFilter.o === 'in'; // useGlobalVariableOperator's operator is 'in'
    const useGlobalVariableOperator = state.operatorMenu.find((item) => item.key === DATA_TABLE_QUERY_OPERATOR.use_global_variable.key);
    if (useGlobalVariableOperator || operator) {
        state.selectedOperator = isUseGlobalVariable ? [useGlobalVariableOperator] : [operator];
    }
});

</script>

<template>
    <div class="widget-form-data-table-card-filters-item">
        <div class="filter-header">
            <div class="content">
                <span class="filter-name">{{ props.filterItem.label }}</span>
                <div ref="operatorButtonRef"
                     class="operator-dropdown"
                >
                    <div class="operator-button"
                         @click="handleClickDropdown"
                    >
                        <span class="selected">{{ state.selectedOperator[0]?.label }}</span>
                        <p-i :name="state.visibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                             width="1.5rem"
                             height="1.5rem"
                             :color="state.visibleMenu ? blue[600] : gray[600]"
                        />
                    </div>
                    <p-context-menu v-if="state.visibleMenu"
                                    class="operator-menu"
                                    :visible.sync="state.visibleMenu"
                                    searchable
                                    :menu="state.operatorMenu"
                                    :selected="state.selectedOperator"
                                    @select="handleSelectOperator"
                    />
                </div>
            </div>
            <p-icon-button name="ic_delete"
                           style-type="transparent"
                           size="sm"
                           @click="handleDeleteFilter"
            />
        </div>
        <p-text-input v-if="state.selectedOperator[0]?.key === DATA_TABLE_QUERY_OPERATOR.contain_in.key
                          || state.selectedOperator[0]?.key === DATA_TABLE_QUERY_OPERATOR.not_contain_in.key"
                      :selected="state.proxySelectedFilter?.v"
                      multi-input
                      block
                      appearance-type="stack"
                      placeholder="Enter Value"
                      @update="handleUpdateKeywordSelected"
        />
        <p-select-dropdown v-else-if="state.selectedOperator[0]?.key === DATA_TABLE_QUERY_OPERATOR.use_global_variable.key"
                           is-filterable
                           :menu="state.globalVariableItems"
                           :selected="state.selectedFilterValue"
                           :loading="props.loading"
                           appearance-type="stack"
                           :init-selected-with-handler="props.initSelectedWithHandler"
                           :show-delete-all-button="false"
                           :page-size="10"
                           @update:selected="handleUpdateFilterDropdown($event, true)"
        />
        <p-select-dropdown v-else-if="state.selectedOperator[0]?.key === DATA_TABLE_QUERY_OPERATOR.in.key
                               || state.selectedOperator[0]?.key === DATA_TABLE_QUERY_OPERATOR.not_in.key"
                           is-filterable
                           :handler="props.handler"
                           :selected="state.proxySelectedFilter?.v"
                           :loading="props.loading"
                           multi-selectable
                           appearance-type="stack"
                           show-select-marker
                           :init-selected-with-handler="props.initSelectedWithHandler"
                           :show-delete-all-button="false"
                           :page-size="10"
                           @update:selected="handleUpdateFilterDropdown($event)"
        />
    </div>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-filters-item {
    @apply bg-white border border-gray-150 rounded-lg;
    width: 100%;
    padding: 0.125rem 0.5rem 0.5rem;
    .filter-header {
        @apply flex items-center justify-between;
        height: 2rem;

        .content {
            @apply flex items-center gap-2;
            .filter-name {
                @apply text-label-md font-bold text-gray-800;
            }
            .operator-dropdown {
                @apply relative;
                .operator-button {
                    @apply flex items-center cursor-pointer gap-1;
                    .selected {
                        @apply text-label-md text-gray-800;
                    }
                }
                .operator-menu {
                    @apply absolute;
                    top: 100%;
                    left: 0;
                    z-index: 10;
                    width: max-content;
                }
            }
        }
    }
}
</style>
