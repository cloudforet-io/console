<script setup lang="ts">


import { computed, reactive, watch } from 'vue';

import {
    cloneDeep, flattenDeep, isEqual, xor,
} from 'lodash';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type {
    DashboardGlobalVariable,
    ReferenceVariable,
} from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { VariableModelFactory } from '@/lib/variable-models';
import type {
    ManagedVariableModelKey,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import {
    MANAGED_VARIABLE_MODELS,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import type { VariableModelMenuHandlerInfo } from '@/lib/variable-models/variable-model-menu-handler';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';

import { useProxyValue } from '@/common/composables/proxy-state';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { getWorkspaceInfo } from '@/services/advanced/composables/refined-table-data';
import { useDashboardDetailQuery } from '@/services/dashboards/composables/use-dashboard-detail-query';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

interface Props {
    variable: DashboardGlobalVariable;
    vars?: DashboardVars;
}


const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:vars', val: DashboardVars): void}>();
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const { dashboard } = useDashboardDetailQuery({
    dashboardId: computed(() => dashboardDetailState.dashboardId),
});

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
});

const state = reactive({
    variable: computed(() => {
        const referenceVariable = props.variable as ReferenceVariable;
        return referenceVariable;
    }),
    multiSelectable: computed(() => state.variable.options.selectionType === 'multi'),
    menuHandler: computed<AutocompleteHandler>(() => {
        const listQueryOptions: Record<string, any> = {};
        const targetModelConfig = Object.values(MANAGED_VARIABLE_MODELS).find((d) => (d.meta?.resourceType === state.variable.reference.resourceType));

        const _variableModelKey = targetModelConfig?.meta.key as ManagedVariableModelKey;
        const _dataKey: string|undefined = state.variable.reference.dataKey;

        const isWorkspaceDropdown = _variableModelKey === MANAGED_VARIABLE_MODELS.workspace.meta.key;
        if (isWorkspaceDropdown) listQueryOptions.is_dormant = false;

        if (state.variable.reference.resourceType === MANAGED_VARIABLE_MODELS.cost.meta.resourceType) listQueryOptions.data_source_id = state.variable.reference.dataSourceId;
        if (state.variable.reference.resourceType === MANAGED_VARIABLE_MODELS.metric_data.meta.resourceType) listQueryOptions.metric_id = state.variable.reference.dataSourceId;

        const variableModel = new VariableModelFactory({ type: 'MANAGED', managedModelKey: _variableModelKey });
        const variableModelInfo = {
            variableModel,
            dataKey: _dataKey,
        } as VariableModelMenuHandlerInfo;

        if (_dataKey && !variableModel[_dataKey]) {
            variableModelInfo.variableModel[_dataKey] = variableModel.generateProperty({ key: _dataKey });
        }

        return getVariableModelMenuHandler([variableModelInfo], listQueryOptions);
    }),
    selected: [] as MenuItem[],
    proxyVars: useProxyValue<DashboardVars|undefined>('vars', props, emit),
});

// event
const handleSelectOption = () => {
    changeVariables(state.selected);
};

// helper
const changeVariables = (changedSelected: MenuItem[]) => {
    const _key = state.variable.key;
    const vars = cloneDeep(props.vars ?? {});
    const reconvertedSelected = changedSelected.map((d) => d.name) as string[];
    if (reconvertedSelected.length === 0) {
        delete vars[_key];
    } else if (state.multiSelectable) {
        vars[_key] = reconvertedSelected;
    } else {
        vars[_key] = reconvertedSelected[0];
    }
    state.proxyVars = vars;
};

const loadOptionItems = async (selectedValues?: string[]): Promise<MenuItem[]> => {
    let foundItems: MenuItem[] = [];
    const responses = await state.menuHandler(
        '',
        undefined,
        undefined,
        selectedValues?.map((d) => ({ name: d, label: d })),
    );
    const results = responses?.map((res) => res.results).flat();
    foundItems = foundItems.concat(results);
    return foundItems;
};
const initVariableAndSelected = (items: MenuItem[]) => {
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
        initVariableAndSelected(items);
    }
};

watch(() => dashboard.value?.vars_schema?.properties, async (varsSchema, prevVarsSchema) => {
    if (!varsSchema) return;
    const _variable = props.variable as ReferenceVariable;
    if (isEqual(varsSchema[_variable.key], prevVarsSchema?.[varsSchema[_variable.key]])) return;

    const value = dashboard.value?.vars?.[_variable.key];
    if (value) {
        await initSelected(value);
    } else {
        state.selected = [];
    }
}, { immediate: true });


// for reset
watch(() => props.vars, (_vars) => {
    const selectedValues = state.selected.map((d) => d.name);
    const _variable = props.variable as ReferenceVariable;
    const tempVarsValue = flattenDeep([(_vars?.[_variable.key] as string|string[]|undefined) ?? []]);
    const isNotSame = xor(selectedValues, tempVarsValue).length > 0;
    if (isNotSame) {
        initSelected(_vars?.[state.variable.key]);
    }
});


</script>

<template>
    <div class="dashboard-global-variable-filter-reference">
        <p-select-dropdown is-filterable
                           :handler="state.menuHandler"
                           :selected.sync="state.selected"
                           :multi-selectable="state.multiSelectable"
                           style-type="rounded"
                           appearance-type="badge"
                           show-select-marker
                           use-fixed-menu-style
                           selection-highlight
                           :selection-label="state.variable.name"
                           show-delete-all-button
                           :page-size="10"
                           @update:selected="handleSelectOption"
        >
            <template v-if="state.variable.key === 'workspace_id'"
                      #menu-item--format="{item}"
            >
                <div class="menu-item-wrapper">
                    <div class="label">
                        <workspace-logo-icon :text="item?.label || ''"
                                             :theme="getWorkspaceInfo(item?.name || '', storeState.workspaceList)?.tags?.theme"
                                             size="xs"
                        />
                        <span class="label-text">{{ item.label }}</span>
                    </div>
                </div>
            </template>
        </p-select-dropdown>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-global-variable-filter-reference {
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
    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 18rem;

        .label {
            @apply flex items-center gap-2;
        }
        .state {
            @apply text-label-sm;
        }
        .label-text {
            @apply truncate;
            max-width: 8.375rem;
        }
    }
}
</style>
