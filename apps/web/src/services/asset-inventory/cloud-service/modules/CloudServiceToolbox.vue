<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PDivider, PButton, PToolbox,
} from '@spaceone/design-system';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { QueryTag } from '@spaceone/design-system/types/inputs/search/query-search-tags/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { CloudServiceExportParameter, ExportOption } from '@/models/export/index';
import { QueryType } from '@/models/export/index';
import { store } from '@/store';

import type { ExcelDataField } from '@/store/modules/file/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import {
    dynamicFieldsToExcelDataFields,
} from '@/lib/component-util/dynamic-layout';
import { downloadExcelByUrl } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceFilterModal from '@/services/asset-inventory/cloud-service/modules/CloudServiceFilterModal.vue';
import CloudServicePeriodFilter from '@/services/asset-inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import { useCloudServicePageStore } from '@/services/asset-inventory/store/cloud-service-page-store';


interface Handlers { keyItemSets?: KeyItemSet[]; valueHandlerMap?: ValueHandlerMap }

interface Props {
    totalCount: number;
    handlers: Handlers;
    queryTags?: QueryTag[];
}


const props = withDefaults(defineProps<Props>(), {
    totalCount: 0,
    handlers: () => ({}),
    queryTags: () => [],
});

const emit = defineEmits<{(event: 'update-pagination', value: ToolboxOptions): void;
}>();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;

const searchQueryHelper = new QueryHelper().setKeyItemSets(props.handlers.keyItemSets ?? []);
const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    queryTags: computed(() => searchQueryHelper.setFilters(cloudServicePageState.searchFilters).queryTags),
    cloudServiceFilters: computed(() => cloudServicePageStore.allFilters.filter((f: any) => f.k && ![
        'labels',
        'service_code',
    ].includes(f.k))),
    visibleSetFilterModal: false,
    selectedFiltersCount: computed<string>(() => {
        const countLabels: string[] = [];
        if (cloudServicePageStore.selectedCategories.length) {
            countLabels.push(`${cloudServicePageStore.selectedCategories.length} Service Categories`);
        }
        if (cloudServicePageStore.selectedRegions.length) {
            countLabels.push(`${cloudServicePageStore.selectedRegions.length} Regions`);
        }
        return countLabels.join(', ');
    }),
    keyItemSets: computed(() => props.handlers?.keyItemSets ?? []),
});

const excelState = reactive({
    cloudServiceFilters: computed(() => cloudServicePageStore.allFilters.filter((f: any) => ![
        'service_code',
    ].includes(f.k)).map((f) => {
        if (f.k === 'labels') {
            return { ...f, k: 'ref_cloud_service_type.labels' };
        }
        return ({ ...f });
    })),
});

/* excel */
const cloudServiceResourcesApiQueryHelper = new ApiQueryHelper()
    .setPageLimit(0).setPageStart(1)
    .setMultiSort([
        { key: 'provider', desc: false },
        { key: 'cloud_service_group', desc: false },
    ]);
const getCloudServiceResources = async () => {
    try {
        cloudServiceResourcesApiQueryHelper.setFilters(state.cloudServiceFilters);
        const { results } = await SpaceConnector.client.statistics.topic.cloudServiceResources(
            {
                labels: cloudServicePageStore.selectedCategories,
                query: cloudServiceResourcesApiQueryHelper.data,
            },
        );
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const getExcelFields = async (data): Promise<ExcelDataField[]> => {
    let schema: DynamicLayout;
    let excelField;
    if (data.resource_type === 'inventory.Server') {
        try {
            schema = await SpaceConnector.client.addOns.pageSchema.get({
                resource_type: 'inventory.Server',
                schema: 'table',
            });
            if (schema.options) {
                excelField = dynamicFieldsToExcelDataFields(schema.options.fields);
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    } else {
        try {
            schema = await SpaceConnector.client.addOns.pageSchema.get({
                resource_type: 'inventory.CloudService',
                schema: 'table',
                options: {
                    provider: data.provider,
                    cloud_service_group: data.cloud_service_group,
                    cloud_service_type: data.cloud_service_type,
                },
            });
            if (schema.options) {
                excelField = dynamicFieldsToExcelDataFields(schema.options.fields);
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }
    return excelField;
};
const excelApiQueryHelper = new ApiQueryHelper();
const getExcelQuery = (data) => {
    excelApiQueryHelper
        .setFilters(excelState.cloudServiceFilters)
        .addFilter({ k: 'provider', o: '=', v: data.provider })
        .addFilter({ k: 'cloud_service_group', o: '=', v: data.cloud_service_group })
        .addFilter({ k: 'cloud_service_type', o: '=', v: data.cloud_service_type })
        .setMultiSortV2([
            { key: 'provider', desc: false },
            { key: 'cloud_service_group', desc: false },
            { key: 'cloud_service_type', desc: false },
        ]);
    return excelApiQueryHelper.data;
};
const getCloudServiceResourcesPayload = (): ExportOption => {
    excelApiQueryHelper.setFilters(excelState.cloudServiceFilters).setMultiSortV2([
        { key: 'provider', desc: true },
        { key: 'cloud_service_group', desc: true },
    ]);
    return ({
        name: 'Summary',
        query_type: QueryType.ANALYZE,
        analyze_query: {
            ...excelApiQueryHelper.data,
            group_by: ['provider', 'cloud_service_group', 'cloud_service_type'],
            fields: {
                total_count: {
                    operator: 'count',
                },
            },
        },
    });
};
const getExcelPayloadList = async (): Promise<ExportOption[]> => {
    const excelPayloadList: ExportOption[] = [];
    const excelItems = await getCloudServiceResources();
    const excelFieldList: Array<ExcelDataField[]> = await Promise.all(excelItems.map((d) => getExcelFields(d)));


    const errorString = ['/', '\\', '?', '*', '[', ']'];
    const removeErrorString = (str: string): string => {
        let result = str;
        errorString.forEach((d) => {
            result = result.replace(new RegExp(`\\${d}`, 'g'), ' ');
        });
        return result;
    };
    const checkSameSheetNameExist = (list: ExportOption[], sheetName: string):string => {
        const index = list.filter((d) => ((typeof d.name === 'string') ? d.name.includes(sheetName) : false)).length;
        return index ? `${sheetName}${index}` : sheetName;
    };
    excelFieldList.forEach((excelField, idx) => {
        const provider = excelItems[idx].provider;
        const providerName = state.providers[provider]?.label || provider;
        let sheetName = `${providerName}.${excelItems[idx].cloud_service_group}.${excelItems[idx].cloud_service_type}`;
        sheetName = removeErrorString(sheetName);
        if (sheetName.length > 29) sheetName = sheetName.substr(0, 29);
        const checkedSheetName = checkSameSheetNameExist(excelPayloadList, sheetName);
        if (checkedSheetName !== sheetName) sheetName = checkedSheetName;

        excelPayloadList.push({
            name: sheetName,
            query_type: QueryType.SEARCH,
            search_query: {
                ...getExcelQuery(excelItems[idx]),
                fields: excelField,
            },
        });
    });
    return excelPayloadList;
};

/* Event Handlers */
const handleChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
        cloudServicePageStore.$patch((_state) => {
            _state.searchFilters = searchQueryHelper.filters;
        });
    } else {
        emit('update-pagination', options);
    }
};
const handleClickSet = () => {
    state.visibleSetFilterModal = true;
};
const handleExport = () => {
    downloadExcelByUrl(async () => {
        const excelPayloadList = await getExcelPayloadList();
        const cloudServiceExcelExportParams:CloudServiceExportParameter = {
            options: [
                getCloudServiceResourcesPayload(),
                ...excelPayloadList,
            ],
        };
        const data = await SpaceConnector.clientV2.inventory.cloudService.export(cloudServiceExcelExportParams);
        return data.download_url;
    });
};

/* Init */
(async () => {
    // LOAD REFERENCE STORE
    await store.dispatch('reference/provider/load');
})();

</script>

<template>
    <div>
        <div class="toolbox-top-wrapper">
            <span class="title">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FILTER') }}</span>
            <div v-if="cloudServicePageState.period"
                 class="period-wrapper"
            >
                <cloud-service-period-filter />
                <p-divider vertical />
            </div>
            <div class="filter-wrapper">
                <span class="filters-count">{{ state.selectedFiltersCount }}</span>
                <p-button style-type="tertiary"
                          icon-left="ic_settings-filled"
                          size="sm"
                          @click="handleClickSet"
                >
                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.SET') }}
                </p-button>
            </div>
            <div class="total-result-wrapper">
                <span class="total-result">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.TOTAL_RESULT') }}</span><span class="total-result-value">{{ props.totalCount }}</span>
            </div>
        </div>
        <p-toolbox filters-visible
                   exportable
                   search-type="query"
                   :total-count="props.totalCount"
                   :query-tags="state.queryTags"
                   :key-item-sets="state.keyItemSets"
                   :value-handler-map="props.handlers?.valueHandlerMap ?? {}"
                   @change="handleChange"
                   @refresh="handleChange()"
                   @export="handleExport"
        />
        <cloud-service-filter-modal :visible.sync="state.visibleSetFilterModal" />
    </div>
</template>

<style lang="postcss" scoped>
.toolbox-top-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 1.125rem;
}
.title {
    @apply text-gray-600;
    font-size: 0.875rem;
    margin-right: 0.5rem;
}
.period-wrapper {
    display: inline-flex;
    flex-shrink: 0;
    margin-right: 1rem;
    > .p-divider {
        margin-left: 0.5rem;
    }
}
.filter-wrapper {
    flex-grow: 1;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    .filters-count {
        margin-right: 0.5rem;
        font-size: 0.875rem;
    }
}
.total-result-wrapper {
    @apply text-sm flex flex-wrap gap-2;
    flex-shrink: 0;
    line-height: 1.09375rem;
    min-width: 5.875rem;
    .total-result {
        @apply text-gray-600;
    }
    .total-result-value {
        @apply text-gray-800;
    }
}
</style>
