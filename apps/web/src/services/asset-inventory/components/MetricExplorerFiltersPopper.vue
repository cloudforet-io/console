<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { cloneDeep, isEmpty } from 'lodash';

import type {
    ConsoleFilter,
} from '@cloudforet/core-lib/query/type';
import { PSelectDropdown, PTextButton } from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import type { MetricLabelKey } from '@/api-clients/inventory/metric/schema/type';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useMetricExampleGetQuery } from '@/services/asset-inventory/composables/use-metric-example-get-query';
import { useMetricGetQuery } from '@/services/asset-inventory/composables/use-metric-get-query';
import { PROJECT_GROUP_LABEL_INFO } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricFilter } from '@/services/asset-inventory/types/asset-analysis-type';


const props = defineProps<{
    visible: boolean;
}>();

const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;

const resourceMenuHandlerMap = useResourceMenuHandlerMap();

const state = reactive({
    loading: true,
    randomId: getRandomId(),
    refinedMetricLabelKeysWithProjectGroup: computed<MetricLabelKey[]>(() => {
        const _labelKeys = cloneDeep(labelKeys.value);
        const _projectLabelInfoIndex = _labelKeys.findIndex((d) => d.key === 'project_id');
        if (_projectLabelInfoIndex > -1) {
            _labelKeys.splice(_projectLabelInfoIndex, 0, PROJECT_GROUP_LABEL_INFO);
        }
        return _labelKeys;
    }),
    enabledFilters: computed<SelectDropdownMenuItem[]>(() => state.refinedMetricLabelKeysWithProjectGroup.map((d) => ({
        name: d.key,
        label: d.name,
    }))),
    selectedItemsMap: {} as Record<string, SelectDropdownMenuItem[]>,
    primaryMetricStatOptions: computed<ConsoleFilter[]>(() => [
        {
            k: 'metric_id',
            v: route.params.metricId,
            o: '=',
        },
    ]),
    handlerMap: computed<Record<string, AutocompleteHandler>>(() => {
        const handlerMaps = {};
        state.refinedMetricLabelKeysWithProjectGroup.forEach((labelKey: MetricLabelKey) => {
            handlerMaps[labelKey.key] = getMenuHandler(labelKey, state.primaryMetricStatOptions);
        });
        return handlerMaps;
    }),
    isSelectedInitiated: false,
});

/* Query */
const { labelKeys } = useMetricGetQuery({
    metricId: computed(() => route.params.metricId),
});
const { data: currentMetricExample } = useMetricExampleGetQuery({
    metricExampleId: computed(() => route.params.metricExampleId),
});

/* Util */
const getMenuHandler = (labelKey: MetricLabelKey, listQueryOptions: ConsoleFilter[]): MenuAttachHandler => {
    try {
        const queryOptions: ConsoleFilter[] = [];
        if (labelKey.key === RESOURCE_CONFIG_MAP.workspace.idKey) {
            queryOptions.push({
                k: 'is_dormant',
                v: false,
                o: '=',
            });
        }
        if (isEmpty(labelKey.reference)) {
            return resourceMenuHandlerMap.metricData({
                dataKey: labelKey.key,
                menuFilters: listQueryOptions,
            });
        }
        const resourceKey = Object.values(RESOURCE_CONFIG_MAP).find((d) => d.idKey === labelKey.reference?.reference_key)?.resourceKey;
        if (!resourceKey) return async () => ({ results: [] });
        return resourceMenuHandlerMap[resourceKey]?.({
            menuFilters: queryOptions,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return async () => ({ results: [] });
    }
};
const initSelectedFilters = (filters: MetricFilter) => {
    const _selectedItemsMap = {};
    Object.keys(filters ?? {}).forEach((groupBy) => {
        _selectedItemsMap[groupBy] = filters?.[groupBy].map((d) => ({ name: d })) ?? [];
    });
    state.selectedItemsMap = _selectedItemsMap;
    state.isSelectedInitiated = true;
};

/* Event */
const handleUpdateFiltersDropdown = (groupBy: string, selectedItems: SelectDropdownMenuItem[]) => {
    const selectedItemsMap = cloneDeep(state.selectedItemsMap);
    selectedItemsMap[groupBy] = selectedItems;
    state.selectedItemsMap = selectedItemsMap;

    metricExplorerPageStore.setFilters({
        ...metricExplorerPageState.filters,
        [groupBy]: selectedItems.map((d) => d.name as string),
    });
};
const handleClickResetFilters = () => {
    if (currentMetricExample.value) {
        const _originalFilters = cloneDeep(currentMetricExample.value?.options?.filters);
        initSelectedFilters(_originalFilters);
        metricExplorerPageStore.setFilters(_originalFilters);
    } else {
        metricExplorerPageStore.setFilters({});
        state.selectedItemsMap = {};
    }
    state.randomId = getRandomId();
};

watch(() => props.visible, (visible) => {
    if (!visible) return;
    initSelectedFilters(metricExplorerPageState.filters);
}, { immediate: true });

</script>

<template>
    <div class="metric-explorer-filters-popper">
        <p-select-dropdown
            v-for="groupBy in state.enabledFilters"
            :key="`filters-dropdown-${groupBy.name}-${state.randomId}`"
            class="filters-popper-dropdown"
            is-filterable
            :handler="state.handlerMap[groupBy.name]"
            :selected="state.selectedItemsMap[groupBy.name] ?? []"
            multi-selectable
            style-type="rounded"
            appearance-type="badge"
            show-select-marker
            use-fixed-menu-style
            selection-highlight
            :init-selected-with-handler="state.isSelectedInitiated"
            :selection-label="groupBy.label"
            :show-delete-all-button="false"
            :page-size="10"
            @update:selected="handleUpdateFiltersDropdown(groupBy.name, $event)"
        />
        <p-text-button icon-left="ic_refresh"
                       style-type="highlight"
                       class="reset-button"
                       @click="handleClickResetFilters"
        >
            {{ $t('INVENTORY.METRIC_EXPLORER.RESET') }}
        </p-text-button>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-filters-popper {
    @apply flex items-center flex-wrap;
    flex: 1;
    gap: 0.5rem;
    .filters-popper-dropdown {
        width: initial;
    }

    .reset-button {
        display: inline-block;
        vertical-align: middle;
        padding: 0.5rem 0;
    }
}
</style>
