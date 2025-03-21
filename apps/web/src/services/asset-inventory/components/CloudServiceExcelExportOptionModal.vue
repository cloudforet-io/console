<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, computed,
} from 'vue';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButtonModal, PToggleButton, PFieldTitle,
} from '@cloudforet/mirinae';
import type { DynamicLayout } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';


import { QueryType } from '@/api-clients/_common/schema/api-verbs/export';
import type { ExportOption, ExportParameter } from '@/api-clients/_common/schema/api-verbs/export';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


import { getCloudServiceAnalyzeQuery } from '@/services/asset-inventory/helpers/cloud-service-analyze-query-helper';
import { useCloudServiceLSBStore } from '@/services/asset-inventory/stores/cloud-service-l-s-b-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { CloudServiceAnalyzeResult } from '@/services/asset-inventory/types/cloud-service-card-type';
import type { Period } from '@/services/asset-inventory/types/type';

const props = defineProps<{
    visible: boolean;
    period?: Period;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServiceLSBStore = useCloudServiceLSBStore();
const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();

const DEFAULT_CONTENTS = 'Default Contents';

const DETAIL_CONTENTS = 'Detail Contents';

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    downloadLoading: false,
    downloadOptions: [DEFAULT_CONTENTS, DETAIL_CONTENTS] as string[],
    allOptionValue: false,
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
    cloudServiceFilters: computed<ConsoleFilter[]>(() => [...cloudServicePageStore.allFilters, ...cloudServiceLSBStore.getters.allFilters]
        .filter((f: any) => ![
            'service_code',
        ].includes(f.k)).map((f) => {
            if (f.k === 'labels') {
                return { ...f, k: 'ref_cloud_service_type.labels' };
            }
            return ({ ...f });
        })),
});

const getCloudServiceResourcesPayload = (): ExportOption => {
    const query = getCloudServiceAnalyzeQuery(state.cloudServiceFilters, undefined, props.period, state.allOptionValue);
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

const getCloudServiceResources = async (): Promise<CloudServiceResource[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.inventory.cloudService.analyze<CloudServiceAnalyzeParameters>({
            query: getCloudServiceAnalyzeQuery(
                cloudServicePageStore.allFilters,
                undefined,
                props.period,
                state.allOptionValue,
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

interface CloudServiceResource {
    provider?: string;
    cloud_service_group?: string;
    cloud_service_type?: string
}

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
        .setFilters(state.cloudServiceFilters)
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

        const provider = excelItems[idx]?.provider ?? '';
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

const handleConfirm = async () => {
    state.downloadLoading = true;
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
    await downloadExcelByExportFetcher(excelExportFetcher);
    emits('update:visible', false);
    state.allOptionValue = false;
    state.downloadLoading = false;
};
const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
    if (!visible) {
        state.allOptionValue = false;
    }
};



</script>
<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('INVENTORY.CLOUD_SERVICE.EXCEL_EXPORT_MODAL.TITLE')"
                    size="sm"
                    :loading="state.downloadLoading"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p class="mb-4">
                {{ i18n.t('INVENTORY.CLOUD_SERVICE.MAIN_EXCEL_EXPORT_MODAL.DESCRIPTION') }}
            </p>
            <p-field-title class="option-title"
                           :label="i18n.t('INVENTORY.CLOUD_SERVICE.MAIN_EXCEL_EXPORT_MODAL.OPTION_TITLE')"
            />

            <p-toggle-button :value="state.allOptionValue"
                             show-state-text
                             @change-toggle="state.allOptionValue = $event"
            />
            <p class="notice">
                {{ i18n.t('INVENTORY.CLOUD_SERVICE.MAIN_EXCEL_EXPORT_MODAL.NOTICE_DESCRIPTION') }}
            </p>
        </template>
        <template #confirm-button>
            {{ i18n.t('COMMON.BUTTONS.DOWNLOAD') }}
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.option-title {
    @apply text-sm mb-2;
}

.notice {
    @apply text-sm text-red-500 mt-2;
}
</style>
