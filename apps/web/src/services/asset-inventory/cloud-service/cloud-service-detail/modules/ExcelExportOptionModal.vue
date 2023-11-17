<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';

import {
    PButtonModal, PCheckboxGroup, PCheckbox, PDataLoader,
} from '@spaceone/design-system';
import type { DynamicField } from '@spaceone/design-system/src/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ExportOption, ExportParameter } from '@/models/export';
import { QueryType } from '@/models/export';
import { store } from '@/store';
import { i18n } from '@/translations';

import { dynamicFieldsToExcelDataFields, isTableTypeInDynamicLayoutType } from '@/lib/component-util/dynamic-layout';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { BASE_INFORMATION } from '@/services/asset-inventory/cloud-service/cloud-service-detail/config';
import type { CloudServiceDetailSchema } from '@/services/asset-inventory/cloud-service/cloud-service-detail/lib/type';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/store/cloud-service-detail-page-store';



const props = defineProps<{
    visible: boolean;
    cloudServiceId?: string;
    hiddenFilters: ConsoleFilter[]; // for server tab
    cloudServiceListFields: DynamicField[];
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();


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
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
    detailSchemaList: [] as CloudServiceDetailSchema[],
});


const apiQuery = new ApiQueryHelper();
const getCloudServiceListQuery = () => {
    apiQuery.setMultiSortV2([{ key: 'created_at', desc: true }])
        .setFilters(props.hiddenFilters);
    return apiQuery.data;
};

const getSubDataExcelSearchQuery = () => {
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
        const cloudServiceListSheetQuery: ExportOption|undefined = (state.selectedSubDataIds.includes('Main Table')) ? ({
            name: 'Main_Table',
            query_type: QueryType.SEARCH,
            search_query: {
                ...getCloudServiceListQuery(),
                fields: dynamicFieldsToExcelDataFields(props.cloudServiceListFields),
            },
        }) : undefined;

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
