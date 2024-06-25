<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PDivider, PIconButton, PI, PButton, PSelectDropdown, PTextInput, PToggleButton, PFieldTitle,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
import { range, sortBy } from 'lodash';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';

import getRandomId from '@/lib/random-id-generator';
import CostTagKeyVariableModel
    from '@/lib/variable-models/managed-model/custom-resource-model/cost-tag-key-variable-model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardFilters from '@/common/modules/widgets/_components/WidgetFormDataTableCardFilters.vue';
import { DATA_SOURCE_DOMAIN, MANAGED_GLOBAL_VARIABLE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { AdditionalLabel } from '@/common/modules/widgets/types/widget-data-table-type';

import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';

interface Props {
    filterFormKey: string;
    dataTableId: string;
    sourceType?: string;
    sourceId: string;
    sourceKey: string;
    selectedGroupByItems: any[];
    filter: Record<string, string[]>;
    dataFieldName: string;
    dataUnit: string;

    /* Advanced Options */
    additionalLabels: AdditionalLabel[];
    separateDate: boolean;
    selectedTimeDiff: string;
    selectedTimeDiffDate?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:filter', value: Record<string, string[]>): void;
    (e: 'update:selected-group-by-items', value: any[]): void;
    (e: 'update:data-field-name', value: string): void;
    (e: 'update:data-unit', value: string): void;
    (e: 'update:addtional-labels', value: AdditionalLabel[]): void;
    (e: 'update:separate-date', value: boolean): void;
    (e: 'update:selected-time-diff', value: string): void;
    (e: 'update:selected-time-diff-date', value: string): void;
}>();

const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});

const state = reactive({
    proxySelectedGroupByItems: useProxyValue('selectedGroupByItems', props, emit),
    proxyDataFieldName: useProxyValue('dataFieldName', props, emit),
    proxyDataUnit: useProxyValue('dataUnit', props, emit),
    proxyFilter: useProxyValue('filter', props, emit),
});

const advancedOptionsState = reactive({
    advancedOptionsCollapsed: false,
    proxyAdditionalLabels: useProxyValue('additionalLabels', props, emit),
    proxySeparateDate: useProxyValue('separateDate', props, emit),
    proxySelectedTimeDiff: useProxyValue('selectedTimeDiff', props, emit),
    proxySelectedTimeDiffDate: useProxyValue('selectedTimeDiffDate', props, emit),
    timeDiffList: computed<SelectDropdownMenuItem[]>(() => [
        { label: 'None', name: 'none' },
        { label: 'Year', name: 'years' },
        { label: 'Month', name: 'months' },
        { label: 'Day', name: 'days' },
    ]),
    timeDiffDateMap: computed<Record<string, SelectDropdownMenuItem[]>>(() => ({
        years: range(3).map((i) => ({
            label: i === 0 ? 'Last 1 Year' : `Last ${i + 1} Years`,
            name: String(i + 1),
        })),
        months: range(12).map((i) => ({
            label: i === 0 ? 'Last 1 Month' : `Last ${i + 1} Months`,
            name: String(i + 1),
        })),
        days: range(31).map((i) => ({
            label: i === 0 ? 'Last 1 Day' : `Last ${i + 1} Days`,
            name: String(i + 1),
        })),
    })),
});

const groupByState = reactive({
    loading: false,
    items: computed(() => {
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return [
                ...costFilterState.managedGroupByItems,
                ...costFilterState.additionalInfoGroupByItems,
                ...costFilterState.tagsFilterItems,
            ];
        }
        return [...assetFilterState.metricFilterItems];
    }),
});
const costFilterState = reactive({
    managedGroupByItems: computed(() => Object.values(GROUP_BY_ITEM_MAP).filter((item) => !MANAGED_GLOBAL_VARIABLE.includes(item.name))),
    additionalInfoGroupByItems: computed(() => {
        const dataSource = storeState.costDataSources[props.sourceId ?? ''];
        return dataSource ? sortBy(dataSource.data?.cost_additional_info_keys.map((key) => ({
            name: `additional_info.${key}`,
            label: key,
        })), 'label') : [];
    }),
    tagsFilterItems: [] as MenuItem[],
});

const assetFilterState = reactive({
    refinedLabelKeys: computed(() => {
        const metricLabelsInfo = storeState.metrics[props.sourceId ?? ''].data.labels_info;
        return metricLabelsInfo ? metricLabelsInfo.filter((labelInfo) => !MANAGED_GLOBAL_VARIABLE.includes(labelInfo.key)) : [];
    }),
    metricFilterItems: computed(() => assetFilterState.refinedLabelKeys.map((d) => ({ name: d.key, label: d.name }))),
});

/* Events */
const handleClickToggleAdvancedOptionsForm = () => {
    advancedOptionsState.advancedOptionsCollapsed = !advancedOptionsState.advancedOptionsCollapsed;
};
const handleClickAddLabel = () => {
    const newAdditionalLabel = {
        key: getRandomId(),
        name: '',
        value: '',
    };
    advancedOptionsState.proxyAdditionalLabels = [...advancedOptionsState.proxyAdditionalLabels, newAdditionalLabel];
};

const handleChangeLabel = (key: string, value: string, type: 'name' | 'value') => {
    const targetIndex = advancedOptionsState.proxyAdditionalLabels.findIndex((label) => label.key === key);
    if (targetIndex !== -1) {
        advancedOptionsState.proxyAdditionalLabels[targetIndex][type] = value;
    }
};

const handleRemoveLabel = (key: string) => {
    advancedOptionsState.proxyAdditionalLabels = [...advancedOptionsState.proxyAdditionalLabels].filter((label) => label.key !== key);
};

const handleClickTimeDiff = (timeDiff: string) => {
    advancedOptionsState.proxySelectedTimeDiff = timeDiff;
    advancedOptionsState.proxySelectedTimeDiffDate = undefined;
};

const handleClickTimeDiffDate = (timeDiffDate: string) => {
    advancedOptionsState.proxySelectedTimeDiffDate = timeDiffDate;
};

/* Utils */
const setTagsResources = async (): Promise<void> => {
    try {
        groupByState.loading = true;
        const options = {
            cost_data_source: props.sourceId,
        };
        const costTagKeyVariableModel = new CostTagKeyVariableModel();
        const response = await costTagKeyVariableModel.list({ options });
        costFilterState.tagsFilterItems = response.results ? response.results.map((d) => ({ name: d.key, label: d.name })) : [];
    } catch (e: any) {
        ErrorHandler.handleError(e);
        costFilterState.tagsFilterItems = [];
    } finally {
        groupByState.loading = false;
    }
};

const resetAllFilter = () => {
    state.proxySelectedGroupByItems = [];
    state.proxyFilter = {};
};

watch([() => props.sourceId, () => props.sourceKey], async () => {
    if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
        await setTagsResources();
    }
    resetAllFilter();
});

onMounted(async () => {
    if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
        await setTagsResources();
    }
});

</script>

<template>
    <div class="widget-form-data-table-card-add-form">
        <p-field-group label="Group by">
            <p-select-dropdown class="group-by-select-dropdown"
                               :menu="groupByState.items"
                               :selected.sync="state.proxySelectedGroupByItems"
                               multi-selectable
                               appearance-type="badge"
                               :page-size="10"
                               show-select-marker
                               is-filterable
            />
        </p-field-group>
        <widget-form-data-table-card-filters :key="props.filterFormKey"
                                             :data-table-id="props.dataTableId"
                                             :source-type="props.sourceType"
                                             :source-id="props.sourceId"
                                             :source-key="props.sourceKey"
                                             :filter-items="groupByState.items"
                                             :filter.sync="state.proxyFilter"
        />
        <p-field-group label="Data Field Name"
                       required
                       :invalid="state.proxyDataFieldName.length === 0"
                       :invalid-text="'Please enter the name'"
        >
            <p-text-input v-model="state.proxyDataFieldName"
                          class="data-text-input"
                          placeholder="Name"
            />
        </p-field-group>
        <p-field-group label="Data Unit">
            <p-text-input v-model="state.proxyDataUnit"
                          class="data-text-input"
            />
        </p-field-group>
        <p-divider class="filter-divider" />

        <div class="form-group-wrapper"
             :class="{ 'collapsed': advancedOptionsState.advancedOptionsCollapsed }"
        >
            <div class="title-wrapper"
                 @click="handleClickToggleAdvancedOptionsForm"
            >
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>Advanced Options</span>
            </div>
            <div class="form-wrapper">
                <p-field-group label="Additional Labels">
                    <div class="additional-labels-wrapper">
                        <div v-if="advancedOptionsState.proxyAdditionalLabels.length"
                             class="field-title-wrapper"
                        >
                            <p-field-title class="field-title"
                                           label="Name"
                                           size="sm"
                                           color="gray"
                                           inline
                            />
                            <p-field-title class="field-title"
                                           label="Value"
                                           size="sm"
                                           color="gray"
                                           inline
                            />
                        </div>
                        <div v-for="(labelInfo) in advancedOptionsState.proxyAdditionalLabels"
                             :key="labelInfo.key"
                             class="label-wrapper"
                        >
                            <p-text-input class="label-input"
                                          block
                                          :value="labelInfo.name"
                                          @update:value="handleChangeLabel(labelInfo.key, $event, 'name')"
                            />
                            <p-text-input class="label-input"
                                          block
                                          :value="labelInfo.value"
                                          @update:value="handleChangeLabel(labelInfo.key, $event, 'value')"
                            />
                            <p-icon-button name="ic_delete"
                                           size="sm"
                                           @click="handleRemoveLabel(labelInfo.key)"
                            />
                        </div>
                        <p-button style-type="tertiary"
                                  icon-left="ic_plus_bold"
                                  @click="handleClickAddLabel"
                        >
                            Add Label
                        </p-button>
                    </div>
                </p-field-group>
                <p-field-group label="Separate Date">
                    <div class="separate-date-wrapper">
                        <p class="description">
                            Separate date into 3 columns (Year, Month, Day)
                        </p>
                        <p-toggle-button :value.sync="advancedOptionsState.proxySeparateDate"
                                         show-state-text
                                         position="left"
                        />
                    </div>
                </p-field-group>
                <p-field-group label="Time Diff">
                    <div class="time-diff-dropdown-wrapper">
                        <p-select-dropdown class="time-diff-dropdown"
                                           use-fixed-menu-style
                                           :menu="advancedOptionsState.timeDiffList"
                                           :selected="advancedOptionsState.proxySelectedTimeDiff"
                                           @update:selected="handleClickTimeDiff"
                        />
                        <p-select-dropdown class="time-diff-date-dropdown"
                                           use-fixed-menu-style
                                           :disabled="advancedOptionsState.proxySelectedTimeDiff === 'none'"
                                           :menu="advancedOptionsState.timeDiffDateMap[advancedOptionsState.proxySelectedTimeDiff] || []"
                                           :selected="advancedOptionsState.proxySelectedTimeDiffDate"
                                           @update:selected="handleClickTimeDiffDate"
                        />
                    </div>
                </p-field-group>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-add-form {
    padding: 0.75rem;

    .filter-divider {
        margin-top: 1rem;
    }

    .group-by-select-dropdown {
        @apply w-full;
    }
    .data-text-input {
        @apply w-full;
    }

    .form-group-wrapper {
        .arrow-button {
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        &.collapsed {
            .form-wrapper {
                display: none;
            }
            .arrow-button {
                transform: rotate(-90deg);
            }
        }
        .title-wrapper {
            @apply text-label-lg;
            font-weight: 700;
            padding: 1rem 0;
        }
        .form-wrapper {
            padding: 0.5rem 0 0.25rem 1.25rem;
            .additional-labels-wrapper {
                @apply bg-gray-100 rounded-lg;
                padding: 0.5rem;
                margin-top: 0.25rem;

                .field-title-wrapper {
                    margin-bottom: 0.25rem;
                    .field-title {
                        width: calc(50% - 0.875rem);
                    }
                }
                .label-wrapper {
                    @apply flex gap-1 items-center;
                    margin-bottom: 0.5rem;
                }
            }

            .separate-date-wrapper {
                .description {
                    @apply text-paragraph-sm text-gray-900;
                    margin-bottom: 0.5rem;
                }
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
        }
    }
}

</style>
