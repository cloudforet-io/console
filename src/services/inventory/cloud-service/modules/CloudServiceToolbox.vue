<template>
    <div>
        <div class="period">
            <span class="label">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FILTERED_BY_DATE') }}:</span>
            <template v-if="periodText">
                <span class="text">UTC</span>
                <p-tag v-if="periodText" @delete="handleDeletePeriod">
                    {{ periodText }}
                </p-tag>
            </template>
            <span v-else class="text">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.AUTO_PERIOD') }}</span>
        </div>
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
    PToolbox, PTag,
} from '@spaceone/design-system';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import { ToolboxOptions } from '@spaceone/design-system/dist/src/navigation/toolbox/type';

import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

import {
    dynamicFieldsToExcelDataFields,
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-util/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { ExcelDataField } from '@/store/modules/file/type';
import { ExcelPayload } from '@/store/modules/file/actions';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { store } from '@/store';
import { Period } from '@/services/billing/cost-management/type';
import dayjs from 'dayjs';


interface Props {
    totalCount: number;
    filters: QueryStoreFilter[];
    period: Period | undefined;
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
        PTag,
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
        /* sync */
        period: {
            type: Object,
            default: () => ({}),
        },
        /* sync */
        queryTags: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props: Props, { emit, root }) {
        const handlers = makeQuerySearchPropsWithSearchSchema(
            [{
                title: 'Properties',
                items: [
                    { key: 'cloud_service_type', name: 'Cloud Service Type' },
                    { key: 'cloud_service_group', name: 'Cloud Service Group' },
                    { key: 'project_id', name: 'Project', reference: 'identity.Project' },
                    { key: 'collection_info.service_accounts', name: 'Service Account', reference: 'identity.ServiceAccount' },
                    { key: 'collection_info.secrets', name: 'Secret', reference: 'secret.Secret' },
                ],
            }],
            'inventory.CloudService',
        );

        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
            selectedProvider: computed(() => store.state.service.cloudService.selectedProvider),
            selectedCategories: computed(() => store.state.service.cloudService.selectedCategories),
            selectedRegions: computed(() => store.state.service.cloudService.selectedRegions),
            keyItemSets: handlers.keyItemSets,
            valueHandlerMap: handlers.valueHandlerMap,
            periodText: computed<string | undefined>(() => {
                if (props.period?.start) {
                    return `${dayjs.utc(props.period.start).format('MMM, YYYY')} ~ ${dayjs.utc(props.period.end).format('MMM, YYYY')}`;
                }
                return undefined;
            }),
        });

        /* event */
        const handleChange = async (options: ToolboxOptions = {}) => {
            emit('update-toolbox', options);
        };
        const handleDeletePeriod = () => {
            emit('update:period', undefined);
            emit('delete-period');
        };

        /* excel */
        const cloudServiceResourcesApiQueryHelper = new ApiQueryHelper()
            .setPageLimit(0).setPageStart(1)
            .setSort('count', true);
        const getCloudServiceResources = async () => {
            try {
                cloudServiceResourcesApiQueryHelper.setFilters(props.filters);
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
                .setFilters(props.filters)
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
            excelApiQueryHelper.setFilters(props.filters);
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
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);

                const cloudServiceResourcesPayload = getCloudServiceResourcesPayload();
                const excelPayloadList = await getExcelPayloadList();
                await store.dispatch('file/downloadExcel', [
                    cloudServiceResourcesPayload,
                    ...excelPayloadList,
                ]);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        return {
            ...toRefs(state),
            handleChange,
            handleDeletePeriod,
            handleExport,
        };
    },
};
</script>
<style lang="postcss" scoped>
.period {
    @apply mb-4;
    font-size: 0.875rem;
    line-height: 1.5;
    .label {
        @apply mr-2 font-bold;
    }
    .text {
        @apply text-gray-500 mr-2;
    }
}

@screen mobile {
    .period {
        .label {
            @apply block;
        }
    }
}
</style>
