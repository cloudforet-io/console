<template>
    <div>
        <slot name="period" />
        <p-toolbox filters-visible
                   exportable
                   search-type="query"
                   :total-count="totalCount"
                   :query-tags="queryTags"
                   :key-item-sets="keyItemSets"
                   :value-handler-map="valueHandlerMap"
                   @change="handleChange"
                   @refresh="handleChange()"
                   @export="handleExport"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PToolbox,
} from '@spaceone/design-system';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import { ToolboxOptions } from '@spaceone/design-system/dist/src/navigation/toolbox/type';

import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/console-core-lib/component-util/query-search/type';

import { i18n } from '@/translations';
import { store } from '@/store';
import { ExcelDataField } from '@/store/modules/file/type';
import { ExcelPayload } from '@/store/modules/file/actions';
import ErrorHandler from '@/common/composables/error/errorHandler';
import {
    dynamicFieldsToExcelDataFields,
} from '@/lib/component-util/dynamic-layout';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { assetInventoryStore } from '@/services/asset-inventory/store';


interface Props {
    totalCount: number;
    filters: QueryStoreFilter[];
    handlers: { keyItemSets: KeyItemSet[]; valueHandlerMap: ValueHandlerMap };
    queryTags: QueryTag[];
}

const CLOUD_SERVICE_RESOURCES_EXCEL_FIELDS = [
    { key: 'provider', name: 'Provider', reference: { reference_key: 'provider', resource_type: 'identity.Provider' } },
    { key: 'cloud_service_type', name: 'Cloud Service Type' },
    { key: 'cloud_service_group', name: 'Cloud Service Group' },
    { key: 'count', name: 'Count' },
];

export default {
    name: 'CloudServiceToolbox',
    components: {
        PToolbox,
    },
    props: {
        totalCount: {
            type: Number,
            default: 0,
        },
        filters: {
            type: Array,
            default: () => ([]),
        },
        handlers: {
            type: Object,
            default: () => ({}),
        },
        /* sync */
        queryTags: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            providers: computed(() => store.state.reference.provider.items),
            selectedProvider: computed(() => assetInventoryStore.state.cloudService.selectedProvider),
            selectedCategories: computed(() => assetInventoryStore.state.cloudService.selectedCategories),
            selectedRegions: computed(() => assetInventoryStore.state.cloudService.selectedRegions),
            keyItemSets: props.handlers.keyItemSets,
            valueHandlerMap: props.handlers.valueHandlerMap,
            cloudServiceFilters: computed(() => props.filters.filter((f: any) => f.k && ![
                'labels',
                'service_code',
            ].includes(f.k))),
        });

        /* event */
        const handleChange = async (options: ToolboxOptions = {}) => {
            emit('update-toolbox', options);
        };

        /* excel */
        const cloudServiceResourcesApiQueryHelper = new ApiQueryHelper()
            .setPageLimit(0).setPageStart(1)
            .setSort('count', true);
        const getCloudServiceResources = async () => {
            try {
                cloudServiceResourcesApiQueryHelper.setFilters(state.cloudServiceFilters);
                const { results } = await SpaceConnector.client.statistics.topic.cloudServiceResources(
                    {
                        labels: state.selectedCategories,
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
                excelApiQueryHelper.setOnly(...fields.map(d => d.key));
            }
            return excelApiQueryHelper.data;
        };
        const getCloudServiceResourcesPayload = (): ExcelPayload => {
            excelApiQueryHelper.setFilters(state.cloudServiceFilters);
            return {
                url: '/statistics/topic/cloud-service-resources',
                param: {
                    query: excelApiQueryHelper.data,
                    labels: state.selectedCategories,
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
            const excelFieldList: Array<ExcelDataField[]> = await Promise.all(excelItems.map(d => getExcelFields(d)));

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
        const handleExport = async () => {
            try {
                await store.dispatch('display/startLoading', { loadingMessage: i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD') });

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

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/provider/load');
        })();

        return {
            ...toRefs(state),
            handleChange,
            handleExport,
        };
    },
};
</script>
