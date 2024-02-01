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

import type { ExportParameter, ExportOption } from '@/schema/_common/api-verbs/export';
import { QueryType } from '@/schema/_common/api-verbs/export';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import {
    dynamicFieldsToExcelDataFields,
} from '@/lib/excel-export';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceFilterModal from '@/services/asset-inventory/components/CloudServiceFilterModal.vue';
import CloudServicePeriodFilter from '@/services/asset-inventory/components/CloudServicePeriodFilter.vue';
import { getCloudServiceAnalyzeQuery } from '@/services/asset-inventory/helpers/cloud-service-analyze-query-helper';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { CloudServiceAnalyzeResult } from '@/services/asset-inventory/types/cloud-service-card-type';
import type { Period } from '@/services/asset-inventory/types/type';

interface Handlers { keyItemSets?: KeyItemSet[]; valueHandlerMap?: ValueHandlerMap }

interface Props {
    hasNextPage: boolean;
    handlers: Handlers;
    queryTags?: QueryTag[];
    period?: Period;
    pageSize?: number;
}


const props = withDefaults(defineProps<Props>(), {
    hasNextPage: false,
    handlers: () => ({}),
    queryTags: () => [],
    period: undefined,
    pageSize: undefined,
});

const emit = defineEmits<{(event: 'update-pagination', value: ToolboxOptions): void;
    (event: 'refresh'): void;
}>();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;

const searchQueryHelper = new QueryHelper().setKeyItemSets(props.handlers.keyItemSets ?? []);
const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    queryTags: computed(() => searchQueryHelper.setFilters(cloudServicePageState.searchFilters).queryTags),
    cloudServiceFilters: computed(() => cloudServicePageStore.allFilters.filter((f: any) => ![
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
interface CloudServiceResource {
    provider?: string;
    cloud_service_group?: string;
    cloud_service_type?: string
}

const getCloudServiceResources = async (): Promise<CloudServiceResource[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.inventory.cloudService.analyze<CloudServiceAnalyzeParameters>({
            query: getCloudServiceAnalyzeQuery(
                cloudServicePageStore.allFilters,
                undefined,
                props.period,
            ),
        });
        return (results as CloudServiceAnalyzeResult[]).map((d) => d.resources?.map((r) => ({
            ...r,
            provider: d.provider,
            cloud_service_group: d.cloud_service_group,
        })) ?? []).flat();
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const getExcelFields = async (data: CloudServiceResource): Promise<ExcelDataField[]> => {
    let schema: DynamicLayout;
    let excelField;
    try {
        schema = await SpaceConnector.client.addOns.pageSchema.get({
            resource_type: 'inventory.CloudService',
            schema: 'table',
            options: {
                provider: data.provider,
                cloud_service_group: data.cloud_service_group,
                cloud_service_type: data.cloud_service_type,
                include_workspace_info: appContextGetters.isAdminMode,
            },
        });
        if (schema.options) {
            excelField = dynamicFieldsToExcelDataFields(schema.options.fields);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
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
    const query = getCloudServiceAnalyzeQuery(excelState.cloudServiceFilters, undefined, props.period);
    // analyze_query at export api does not support field_group
    delete query.field_group;
    delete query.page;

    return {
        name: 'Summary',
        title: 'Summary',
        query_type: QueryType.ANALYZE,
        analyze_query: query,
    };
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
    excelFieldList.forEach((excelField, idx) => {
        let sheetName = `${excelItems[idx].cloud_service_group}.${excelItems[idx].cloud_service_type}`;
        sheetName = removeErrorString(sheetName);

        const provider = excelItems[idx].provider ?? '';
        const providerName = state.providers[provider]?.label || provider;

        excelPayloadList.push({
            name: sheetName,
            title: `[${providerName}] ${excelItems[idx].cloud_service_group} ${excelItems[idx].cloud_service_type}`,
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
    }
    if (options.pageStart !== undefined || options.pageLimit !== undefined) {
        emit('update-pagination', options);
    }
};
const handleRefresh = () => {
    emit('refresh');
};
const handleClickSet = () => {
    state.visibleSetFilterModal = true;
};
const handleExport = () => {
    const excelExportFetcher = async () => {
        const excelPayloadList = await getExcelPayloadList();
        const cloudServiceExcelExportParams: ExportParameter = {
            file_name: 'cloud_service_export',
            options: [
                getCloudServiceResourcesPayload(),
                ...excelPayloadList,
            ],
        };
        return SpaceConnector.clientV2.inventory.cloudService.export(cloudServiceExcelExportParams);
    };
    downloadExcelByExportFetcher(excelExportFetcher);
};
const handleDeletePeriodFilter = () => {
    cloudServicePageStore.$patch({ period: undefined });
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
                <cloud-service-period-filter :period="cloudServicePageState.period"
                                             @delete-period="handleDeletePeriodFilter"
                />
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
        </div>
        <p-toolbox filters-visible
                   exportable
                   search-type="query"
                   :has-next-page="props.hasNextPage"
                   :query-tags="state.queryTags"
                   :key-item-sets="state.keyItemSets"
                   :value-handler-map="props.handlers?.valueHandlerMap ?? {}"
                   :page-size="props.pageSize"
                   @change="handleChange"
                   @refresh="handleRefresh"
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
</style>
