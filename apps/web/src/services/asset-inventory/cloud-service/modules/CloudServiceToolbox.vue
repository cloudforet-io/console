<script lang="ts" setup>

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDivider, PButton, PToolbox,
} from '@spaceone/design-system';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { QueryTag } from '@spaceone/design-system/types/inputs/search/query-search-tags/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ExcelPayload } from '@/store/modules/file/actions';
import type { ExcelDataField } from '@/store/modules/file/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import {
    dynamicFieldsToExcelDataFields,
} from '@/lib/component-util/dynamic-layout';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceFilterModal from '@/services/asset-inventory/cloud-service/modules/CloudServiceFilterModal.vue';
import CloudServicePeriodFilter from '@/services/asset-inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import { useCloudServicePageStore } from '@/services/asset-inventory/store/cloud-service-page-store';



interface Handlers { keyItemSets?: KeyItemSet[]; valueHandlerMap?: ValueHandlerMap }

interface Props {
    totalCount: number;
    handlers: Handlers;
    queryTags: QueryTag[];
}

const CLOUD_SERVICE_RESOURCES_EXCEL_FIELDS = [
    { key: 'provider', name: 'Provider', reference: { reference_key: 'provider', resource_type: 'identity.Provider' } },
    { key: 'cloud_service_type', name: 'Cloud Service Type' },
    { key: 'cloud_service_group', name: 'Cloud Service Group' },
    { key: 'count', name: 'Count' },
];

const props = withDefaults(defineProps<Props>(), {
    totalCount: 0,
    handlers: () => ({}),
    queryTags: () => [],
});
const emit = defineEmits<{(e: 'update-pagination', value: ToolboxOptions): void}>();
const store = useStore();
const { t } = useI18n();

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
    valueHandlerMap: computed(() => props.handlers?.valueHandlerMap ?? {}),
});

/* excel */
const cloudServiceResourcesApiQueryHelper = new ApiQueryHelper()
    .setPageLimit(0).setPageStart(1)
    .setSort('count', true);
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
const getExcelQuery = (data, field) => {
    excelApiQueryHelper
        .setFilters(state.cloudServiceFilters)
        .addFilter({ k: 'provider', o: '=', v: data.provider })
        .addFilter({ k: 'cloud_service_group', o: '=', v: data.cloud_service_group })
        .addFilter({ k: 'cloud_service_type', o: '=', v: data.cloud_service_type });
    const fields = field;
    if (fields) {
        excelApiQueryHelper.setOnly(...fields.map((d) => d.key));
    }
    return excelApiQueryHelper.data;
};
const getCloudServiceResourcesPayload = (): ExcelPayload => {
    excelApiQueryHelper.setFilters(state.cloudServiceFilters);
    return {
        url: '/statistics/topic/cloud-service-resources',
        param: {
            query: excelApiQueryHelper.data,
            labels: cloudServicePageStore.selectedCategories,
        },
        fields: CLOUD_SERVICE_RESOURCES_EXCEL_FIELDS,
        sheet_name: 'Summary',
        header_message: {
            title: 'Summary',
        },
        file_name_prefix: FILE_NAME_PREFIX.cloudService,
    };
};
const getExcelPayloadList = async (): Promise<ExcelPayload[]> => {
    const excelPayloadList: ExcelPayload[] = [];
    const excelItems = await getCloudServiceResources();
    const excelFieldList: Array<ExcelDataField[]> = await Promise.all(excelItems.map((d) => getExcelFields(d)));

    excelFieldList.forEach((excelField, idx) => {
        const provider = excelItems[idx].provider;
        const providerName = state.providers[provider]?.label || provider;
        let sheetName = `${idx}.${providerName}.${excelItems[idx].cloud_service_group}.${excelItems[idx].cloud_service_type}`;
        const headerMessage = {
            title: `[${providerName}] ${excelItems[idx].cloud_service_group} ${excelItems[idx].cloud_service_type}`,
        };
        if (sheetName.length > 30) sheetName = sheetName.substr(0, 30);

        let excelApiUrl;
        if (excelItems[idx].resource_type === 'inventory.Server') {
            excelApiUrl = '/inventory/server/list';
        } else {
            excelApiUrl = '/inventory/cloud-service/list';
        }
        excelPayloadList.push({
            url: excelApiUrl,
            param: {
                query: getExcelQuery(excelItems[idx], excelField),
            },
            fields: excelField,
            sheet_name: sheetName,
            header_message: headerMessage,
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
const handleExport = async () => {
    try {
        await store.dispatch('display/startLoading', { loadingMessage: t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD') });

        const cloudServiceResourcesPayload = getCloudServiceResourcesPayload();
        const excelPayloadList = await getExcelPayloadList();
        await store.dispatch('file/downloadExcel', [
            cloudServiceResourcesPayload,
            ...excelPayloadList,
        ]);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        await store.dispatch('display/finishLoading');
    }
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
            <span class="title">{{ t('INVENTORY.CLOUD_SERVICE.MAIN.FILTER') }}</span>
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
                    {{ t('INVENTORY.CLOUD_SERVICE.MAIN.SET') }}
                </p-button>
            </div>
            <div class="total-result-wrapper">
                <span class="total-result">{{ t('INVENTORY.CLOUD_SERVICE.MAIN.TOTAL_RESULT') }}</span><span class="total-result-value">{{ totalCount }}</span>
            </div>
        </div>
        <p-toolbox filters-visible
                   exportable
                   search-type="query"
                   :total-count="totalCount"
                   :query-tags="queryTags"
                   :key-item-sets="state.keyItemSets"
                   :value-handler-map="state.valueHandlerMap"
                   @change="handleChange"
                   @refresh="handleChange()"
                   @export="handleExport"
        />
        <cloud-service-filter-modal v-model:visible="state.visibleSetFilterModal" />
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
