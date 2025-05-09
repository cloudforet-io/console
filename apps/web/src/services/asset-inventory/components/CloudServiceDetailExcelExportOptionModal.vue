<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import { isTableTypeInDynamicLayoutType } from '@cloudforet/core-lib/component-util/dynamic-layout';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import {
    PButtonModal, PCheckboxGroup, PCheckbox, PDataLoader,
} from '@cloudforet/mirinae';
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayout } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import { QueryType } from '@/api-clients/_common/schema/api-verbs/export';
import type { ExportOption, ExportParameter } from '@/api-clients/_common/schema/api-verbs/export';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { BASE_INFORMATION } from '@/services/asset-inventory/constants/cloud-service-detail-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useCloudServiceLSBStore } from '@/services/asset-inventory/stores/cloud-service-l-s-b-store';

interface CloudServiceDetailSchema {
    name: string;
    type: string;
    options: any;
}


const props = defineProps<{
    visible: boolean;
    cloudServiceId?: string;
    hiddenFilters: ConsoleFilter[]; // for server tab
    cloudServiceListFields: DynamicField[];
    defaultFilter?: ApiFilter[];
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const cloudServiceDetailPageStoreState = cloudServiceDetailPageStore.$state;
const cloudServiceLSBStore = useCloudServiceLSBStore();
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();

const MAIN_TABLE = 'Main Table';

const state = reactive({
    isValid: computed<boolean>(() => !!state.selectedSubDataIds.length),
    downloadLoading: false,
    isSubDataLoading: false,
    subDataList: computed(() => [
        MAIN_TABLE,
        ...state.detailSchemaList.map((schema:CloudServiceDetailSchema) => schema.name),
    ]),
    selectedSubDataIds: [MAIN_TABLE] as string[],
    selectedSubDataSchemas: computed<CloudServiceDetailSchema[]>(() => state.detailSchemaList.filter((schema:CloudServiceDetailSchema) => state.selectedSubDataIds.includes(schema.name))),
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
    detailSchemaList: [] as CloudServiceDetailSchema[],
});


const apiQuery = new ApiQueryHelper();
const getCloudServiceListQuery = () => {
    apiQuery.setMultiSortV2([{ key: 'created_at', desc: true }])
        .setFilters(props.hiddenFilters.concat(cloudServiceDetailPageStoreState.searchFilters))
        .addFilter(...cloudServiceLSBStore.getters.allFilters);
    return apiQuery.data;
};

const getSubDataExcelSearchQuery = (): ExportOption[] => {
    const sort = [{ key: 'created_at', desc: true }];
    const options:ExportOption[] = [];
    state.selectedSubDataSchemas.forEach((schema:DynamicLayout) => {
        const isBaseInformationSchema = schema.name === BASE_INFORMATION;
        const fields:DynamicField[] = (isBaseInformationSchema ? schema.options?.layouts[0]?.options?.fields : schema.options?.fields) ?? [];
        if (!fields.length) return;
        const rootPath = schema.options?.root_path ?? undefined;
        const query:ExportOption = {
            name: schema.name,
            query_type: QueryType.SEARCH,
            search_query: {
                sort,
                ...getCloudServiceListQuery(),
                ...(!isBaseInformationSchema && {
                    unwind: {
                        path: schema.options?.unwind?.path ?? '',
                    },
                }),
                fields: dynamicFieldsToExcelDataFields(fields, rootPath),
            },
        };
        options.push(query);
    });
    return options;
};

const handleConfirm = async () => {
    state.downloadLoading = true;
    const excelExportFetcher = () => {
        const query = cloneDeep(getCloudServiceListQuery());
        query.filter = query.filter ? query.filter.concat(props.defaultFilter ?? []) : props.defaultFilter;

        const cloudServiceListSheetQuery: ExportOption|undefined = (state.selectedSubDataIds.includes('Main Table')) ? ({
            name: 'Main Table',
            query_type: QueryType.SEARCH,
            search_query: {
                ...query,
                fields: dynamicFieldsToExcelDataFields(props.cloudServiceListFields),
            },
        }) as ExportOption : undefined;

        const cloudServiceExcelExportParams: ExportParameter = {
            file_name: cloudServiceDetailPageStore.sheetNamePrefix,
            options: cloudServiceListSheetQuery ? [cloudServiceListSheetQuery].concat(getSubDataExcelSearchQuery()) : getSubDataExcelSearchQuery(),
            timezone: state.timezone,
        };
        return SpaceConnector.clientV2.inventory.cloudService.export(cloudServiceExcelExportParams);
    };
    await downloadExcelByExportFetcher(excelExportFetcher);
    emits('update:visible', false);
    state.downloadLoading = false;
};
const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
};

const getSchema = async () => {
    state.isSubDataLoading = true;
    try {
        const params: Record<string, any> = {
            schema: 'details',
            resource_type: 'inventory.CloudService',
            options: {
                cloud_service_id: props.cloudServiceId,
                include_workspace_info: appContextGetters.isAdminMode,
                is_multiple: true,
            },
        };
        const res = await SpaceConnector.client.addOns.pageSchema.get(params);
        state.detailSchemaList = res.details.filter((schema: CloudServiceDetailSchema) => isTableTypeInDynamicLayoutType(schema.type));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.isSubDataLoading = false;
    }
};


watch(() => props.visible, () => {
    if (props.cloudServiceId) getSchema();
    state.selectedSubDataIds = [MAIN_TABLE];
});


</script>
<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('INVENTORY.CLOUD_SERVICE.EXCEL_EXPORT_MODAL.TITLE')"
                    :disabled="!state.isValid"
                    size="sm"
                    :loading="state.downloadLoading"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p class="mb-4">
                {{ i18n.t('INVENTORY.CLOUD_SERVICE.EXCEL_EXPORT_MODAL.DESCRIPTION') }}
            </p>
            <p-data-loader class="sub-data-section"
                           :loading="state.isSubDataLoading"
                           :data="state.subDataList"
            >
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="value in state.subDataList"
                                :key="value"
                                v-model="state.selectedSubDataIds"
                                :value="value"
                    >
                        {{ value }}
                    </p-checkbox>
                </p-checkbox-group>
            </p-data-loader>
        </template>
        <template #confirm-button>
            {{ i18n.t('COMMON.BUTTONS.DOWNLOAD') }}
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.sub-data-section {
    display: inline-block;
    min-height: 3rem;
}
</style>
