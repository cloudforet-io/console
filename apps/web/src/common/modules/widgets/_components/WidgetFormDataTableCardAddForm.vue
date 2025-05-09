<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep, range } from 'lodash';

import {
    makeDistinctValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import {
    PFieldGroup, PSelectDropdown, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';
import {
    MANAGED_VARIABLE_MODELS, type ManagedVariableModelKey,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import { useCostDataSourceFilterMenuItems } from '@/common/composables/data-source/use-cost-data-source-filter-menu-items';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardFilters from '@/common/modules/widgets/_components/WidgetFormDataTableCardFilters.vue';
import {
    DATA_SOURCE_DOMAIN,
    GROUP_BY_INFO_ITEMS_FOR_TAGS,
} from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableQueryFilter } from '@/common/modules/widgets/types/widget-model';

import { PROJECT_GROUP_LABEL_INFO } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';

const TAGS_DATA_KEY = 'tags';


interface Props {
    filterFormKey: string;
    dataTableId: string;
    sourceType?: string;
    sourceId?: string;
    sourceKey?: string;
    sourceItems: SelectDropdownMenuItem[];
    selectedGroupByItems: any[];
    selectedGroupByTagsMap: Record<string, string[]>;
    filter: Record<string, DataTableQueryFilter>;
    dataFieldName: string;
    dataUnit: string;

    /* Advanced Options */
    selectedTimeDiff: string;
    selectedTimeDiffDate?: string;
    timeDiffDataName: string;

    /* Validation */
    formInvalid: boolean;
}
const MAX_GROUP_BY_COUNT = 5;
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:filter', value: Record<string, string[]>): void;
    (e: 'update:selected-group-by-items', value: any[]): void;
    (e: 'update:selected-group-by-tags-map', value: Record<string, string[]>): void;
    (e: 'update:data-field-name', value: string): void;
    (e: 'update:data-unit', value: string): void;
    (e: 'update:selected-time-diff', value: string): void;
    (e: 'update:selected-time-diff-date', value: string): void;
    (e: 'update:time-diff-data-name', value: string): void;
    (e: 'update:form-invalid', value: boolean): void;
}>();

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();

const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const { allItems: costDataSourceMenuItems } = useCostDataSourceFilterMenuItems({
    isAdminMode: computed(() => storeState.isAdminMode),
    costDataSource: computed(() => storeState.costDataSources[props.sourceId ?? '']),
});

const state = reactive({
    proxySelectedGroupByItems: useProxyValue('selectedGroupByItems', props, emit),
    proxySelectedGroupByTagsMap: useProxyValue('selectedGroupByTagsMap', props, emit),
    proxyDataFieldName: useProxyValue('dataFieldName', props, emit),
    proxyDataUnit: useProxyValue('dataUnit', props, emit),
    proxyFilter: useProxyValue<Record<string, DataTableQueryFilter>>('filter', props, emit),
});

const advancedOptionsState = reactive({
    advancedOptionsCollapsed: false,
    proxySelectedTimeDiff: useProxyValue('selectedTimeDiff', props, emit),
    proxySelectedTimeDiffDate: useProxyValue('selectedTimeDiffDate', props, emit),
    proxyTimeDiffDataName: useProxyValue('timeDiffDataName', props, emit),
    timeDiffList: computed<SelectDropdownMenuItem[]>(() => [
        { label: 'None', name: 'none' },
        { label: 'Year', name: 'years' },
        { label: 'Month', name: 'months' },
    ]),
    timeDiffDateMap: computed<Record<string, SelectDropdownMenuItem[]>>(() => ({
        years: range(2).map((i) => ({
            label: i === 0 ? 'Last 1 Year' : `Last ${i + 1} Years`,
            name: String(i + 1),
        })),
        months: range(12).map((i) => ({
            label: i === 0 ? 'Last 1 Month' : `Last ${i + 1} Months`,
            name: String(i + 1),
        })),
    })),
});

const validationState = reactive({
    proxyFormInvalid: useProxyValue('formInvalid', props, emit),
    dataFieldNameInvalid: computed<boolean>(() => state.proxyDataFieldName.length === 0 || reservedLabelState.reservedLabelKeys.includes(state.proxyDataFieldName)),
    dataFieldNameInvalidText: computed<string|TranslateResult>(() => {
        if (state.proxyDataFieldName.length === 0) return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.DATA_FIELD_NAME_INVALID_TEXT');
        if (reservedLabelState.reservedGroupByKeys.includes(state.proxyDataFieldName)) return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.FIELD_NAME_GROUP_BY_INVALID_TEXT');
        if (reservedLabelState.reservedDateKeys.includes(state.proxyDataFieldName)) return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.FIELD_NAME_DATE_INVALID_TEXT');
        return '';
    }),
    additionalFieldInvalidMap: {} as Record<string, boolean>,
});

const reservedLabelState = reactive({
    reservedDateKeys: computed(() => ['Year', 'Month', 'Day', 'Date']),
    reservedGroupByKeys: computed(() => [
        ...groupByState.items.map((item) => item.label),
        'Project', 'Workspace', 'Region', 'Service Account',
    ]),
    reservedLabelKeys: computed(() => [
        ...reservedLabelState.reservedDateKeys,
        ...reservedLabelState.reservedGroupByKeys,
    ]),
});

const groupByState = reactive({
    items: computed(() => {
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return costDataSourceMenuItems.value.filter((d) => d.name !== 'project_group_id');
        }
        if (props.sourceType === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
            const groupByItemValueList = Object.values(GROUP_BY_ITEM_MAP);
            if (!storeState.isAdminMode) return groupByItemValueList.filter((d) => d.name !== 'workspace_id').map((d) => ({ name: d.name, label: d.label }));
            return groupByItemValueList.map((d) => ({ name: d.name, label: d.label }));
        }
        return [...assetFilterState.metricItems];
    }),
    filterItems: computed<MenuItem[]>(() => {
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return costDataSourceMenuItems.value;
        }
        if (props.sourceType === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
            return groupByState.items;
        }
        return [...assetFilterState.metricFilterItems];
    }),
});

const groupByTagsState = reactive({
    tagsAreaVisible: computed(() => state.proxySelectedGroupByItems.some((d) => GROUP_BY_INFO_ITEMS_FOR_TAGS.some((item) => item.key === d.name))),
    tagsAreaItems: computed(() => state.proxySelectedGroupByItems.filter((d) => GROUP_BY_INFO_ITEMS_FOR_TAGS.some((item) => item.key === d.name))),
    loading: false,
    valueHandlerMap: computed(() => {
        const handlerMaps = {};
        state.proxySelectedGroupByItems.forEach(({ name }) => {
            const groupByItemInfo = GROUP_BY_INFO_ITEMS_FOR_TAGS.find((d) => d.key === name);
            if (groupByItemInfo) {
                handlerMaps[groupByItemInfo.key] = getValueHandlerMap(groupByItemInfo.name);
            }
        });
        return handlerMaps;
    }),
    selectedMap: computed(() => {
        const selectedMap = {};
        state.proxySelectedGroupByItems.forEach((item) => {
            const groupByItemInfo = GROUP_BY_INFO_ITEMS_FOR_TAGS.find((d) => d.key === item.name);
            if (groupByItemInfo) {
                selectedMap[item.name] = item.tags || [];
            }
        });
        return selectedMap;
    }),
});

const assetFilterState = reactive({
    refinedLabelKeys: computed(() => {
        const metricLabelsInfo = storeState.metrics[props.sourceId ?? '']?.data?.labels_info;
        return metricLabelsInfo ? metricLabelsInfo.filter((labelInfo) => {
            if (storeState.isAdminMode) return true;
            return labelInfo.key !== 'workspace_id';
        }) : [];
    }),
    metricItems: computed<MenuItem[]>(() => assetFilterState.refinedLabelKeys.map((d) => ({ name: d.key, label: d.name }))),
    metricFilterItems: computed<MenuItem[]>(() => {
        const _refinedLabelKeys = cloneDeep(assetFilterState.refinedLabelKeys);
        const projectLabelInfoIndex = _refinedLabelKeys.findIndex((d) => d.key === 'project_id');
        if (projectLabelInfoIndex > -1) {
            _refinedLabelKeys.splice(projectLabelInfoIndex, 0, PROJECT_GROUP_LABEL_INFO);
        }
        return _refinedLabelKeys.map((d) => ({
            name: d.key,
            label: d.name,
        }));
    }),
});

/* Events */
const handleClickTimeDiff = (timeDiff: string) => {
    advancedOptionsState.proxySelectedTimeDiff = timeDiff;
    advancedOptionsState.proxySelectedTimeDiffDate = undefined;
    if (timeDiff === 'none') advancedOptionsState.proxyTimeDiffDataName = '';
};

const handleClickTimeDiffDate = (timeDiffDate: string) => {
    advancedOptionsState.proxySelectedTimeDiffDate = timeDiffDate;

    const defaultFieldName = props.sourceItems.find((source) => source.name === props.sourceKey)?.label || '';
    const timeDiffOptions = {
        none: '',
        months: 'month',
        years: 'year',
    };
    advancedOptionsState.proxyTimeDiffDataName = `${defaultFieldName} (- ${timeDiffDate} ${timeDiffOptions[advancedOptionsState.proxySelectedTimeDiff]})`;
};
const handleUpdateSelectedGroupBy = (selectedItem: SelectDropdownMenuItem, isSelected: boolean) => {
    if (isSelected && (state.proxySelectedGroupByItems.length > MAX_GROUP_BY_COUNT)) {
        state.proxySelectedGroupByItems = state.proxySelectedGroupByItems.filter((d) => d.name !== selectedItem.name);
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.ALT_E_ADD_GROUP_BY'), '');
    }
};

/* Utils */
const resetAllFilter = () => {
    state.proxySelectedGroupByItems = [];
    state.proxyFilter = {};
};

const getValueHandlerMap = (name: ManagedVariableModelKey): AutocompleteHandler => {
    const resourceKey = MANAGED_VARIABLE_MODELS[name]?.meta?.resourceType;
    const handler = makeDistinctValueHandler(resourceKey, TAGS_DATA_KEY, undefined, undefined, 1000);
    return async (...args) => {
        try {
            groupByTagsState.loading = true;
            const results = await handler(...args);
            return results;
        } catch (e) {
            ErrorHandler.handleError(e);
            return { results: [] };
        } finally {
            groupByTagsState.loading = false;
        }
    };
};

watch([() => props.sourceId, () => props.sourceKey], async () => {
    resetAllFilter();
});

watch([
    () => validationState.dataFieldNameInvalid,
    () => validationState.additionalFieldInvalidMap,
], ([dateFieldNameInvalid, additionalLabelInvalidMap]) => {
    const additionalLabelInvalid = Object.values(additionalLabelInvalidMap).some((invalid) => invalid);
    validationState.proxyFormInvalid = dateFieldNameInvalid || additionalLabelInvalid;
}, { immediate: true });
</script>

<template>
    <div class="widget-form-data-table-card-add-form">
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.GROUP_BY')"
                       :help-text="$t('COMMON.WIDGETS.DATA_TABLE.FORM.GROUP_BY_HELP_TEXT')"
        >
            <p-select-dropdown :menu="groupByState.items"
                               :selected.sync="state.proxySelectedGroupByItems"
                               multi-selectable
                               appearance-type="badge"
                               :page-size="10"
                               show-select-marker
                               is-filterable
                               block
                               @select="handleUpdateSelectedGroupBy"
            />
            <div v-if="groupByTagsState.tagsAreaVisible"
                 class="groupb-by-tags-area flex flex-col gap-2"
            >
                <div v-for="(item) in groupByTagsState.tagsAreaItems"
                     :key="`tags-dropdown-${item.name}`"
                     class="tags-dropdown-wrapper"
                >
                    <div class="header-name flex items-center">
                        {{ item.label }} tags
                    </div>
                    <p-select-dropdown block
                                       :selected.sync="state.proxySelectedGroupByTagsMap[item.name]"
                                       :handler="groupByTagsState.valueHandlerMap[item.name]"
                                       is-filterable
                                       multi-selectable
                                       show-select-marker
                                       appearance-type="stack"
                    />
                </div>
            </div>
        </p-field-group>
        <widget-form-data-table-card-filters :key="props.filterFormKey"
                                             :data-table-id="props.dataTableId"
                                             :source-type="props.sourceType"
                                             :source-id="props.sourceId"
                                             :source-key="props.sourceKey"
                                             :filter-items="groupByState.filterItems"
                                             :filter.sync="state.proxyFilter"
        />
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.DATA_FIELD_NAME')"
                       required
                       :invalid="validationState.dataFieldNameInvalid"
                       :invalid-text="validationState.dataFieldNameInvalidText"
        >
            <template #default="{invalid}">
                <p-text-input v-model="state.proxyDataFieldName"
                              class="data-text-input"
                              :invalid="invalid"
                              placeholder="Name"
                />
            </template>
        </p-field-group>
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.DATA_UNIT')">
            <p-text-input v-model="state.proxyDataUnit"
                          class="data-text-input"
            />
        </p-field-group>
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.TIME_DIFF')">
            <div class="time-diff-dropdown-wrapper">
                <p-select-dropdown class="time-diff-dropdown"
                                   :menu="advancedOptionsState.timeDiffList"
                                   :selected="advancedOptionsState.proxySelectedTimeDiff"
                                   @update:selected="handleClickTimeDiff"
                />
                <p-select-dropdown class="time-diff-date-dropdown"
                                   :disabled="advancedOptionsState.proxySelectedTimeDiff === 'none'"
                                   :menu="advancedOptionsState.timeDiffDateMap[advancedOptionsState.proxySelectedTimeDiff] || []"
                                   :selected="advancedOptionsState.proxySelectedTimeDiffDate"
                                   @update:selected="handleClickTimeDiffDate"
                />
            </div>
            <p-text-input v-if="advancedOptionsState.proxySelectedTimeDiff !== 'none'"
                          v-model="advancedOptionsState.proxyTimeDiffDataName"
                          class="timediff-name-text-input"
                          placeholder="Field Name"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-add-form {
    padding: 0.75rem;

    .groupb-by-tags-area {
        @apply bg-gray-100 rounded-lg;
        padding: 0.75rem 0.5rem;
        margin-top: 0.25rem;

        .tags-dropdown-wrapper {
            @apply bg-white border border-gray-150 rounded-lg;
            width: 100%;
            padding: 0.125rem 0.5rem 0.5rem;
            .header-name {
                @apply text-label-md font-bold text-gray-800;
                height: 2rem;
            }
        }
    }

    .data-text-input {
        @apply w-full;
    }

    .time-diff-dropdown-wrapper {
        @apply flex gap-2;
        margin-top: 0.25rem;
        .time-diff-dropdown {
            width: 25%;
        }
        .time-diff-date-dropdown {
            width: 75%;
        }
    }
    .timediff-name-text-input {
        width: 100%;
        margin-top: 0.5rem;
    }
}

</style>
