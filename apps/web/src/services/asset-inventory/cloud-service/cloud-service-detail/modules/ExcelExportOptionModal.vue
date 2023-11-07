<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';

import {
    PButtonModal, PCheckboxGroup, PCheckbox, PDataLoader,
} from '@spaceone/design-system';
import type { DynamicField } from '@spaceone/design-system/src/data-display/dynamic/dynamic-field/type/field-schema';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ExportOption, ExportParameter } from '@/models/export';
import { QueryType } from '@/models/export';
import { store } from '@/store';
import { i18n } from '@/translations';

import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { filterForExcelSchema } from '@/services/asset-inventory/cloud-service/cloud-service-detail/lib/helper';
import type { CloudServiceDetailSchema } from '@/services/asset-inventory/cloud-service/cloud-service-detail/lib/type';



const props = defineProps<{
    visible: boolean;
    cloudServiceId?: string;
    hiddenFilters: ConsoleFilter[]; // for server tab
    cloudServiceListFields: DynamicField[];
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();


const MAIN_TABLE = 'Main Table';

const state = reactive({
    isValid: computed<boolean>(() => !!state.selectedSubData.length),
    downloadLoading: false,
    isSubDataLoading: false,
    subDataList: computed(() => [
        MAIN_TABLE,
        ...state.detailSchema.map((schema:CloudServiceDetailSchema) => schema.name),
    ]),
    selectedSubData: [MAIN_TABLE] as string[],
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
    detailSchema: [] as CloudServiceDetailSchema[],
});


const apiQuery = new ApiQueryHelper();
const getCloudServiceListQuery = () => {
    apiQuery.setMultiSortV2([{ key: 'created_at', desc: true }])
        .setFilters(props.hiddenFilters);
    return apiQuery.data;
};

const handleConfirm = async () => {
    state.downloadLoading = true;
    const excelExportFetcher = () => {
        const cloudServiceListSheetQuery: ExportOption|undefined = (state.selectedSubData.includes('Main Table')) ? ({
            name: 'Cloud Service List',
            query_type: QueryType.SEARCH,
            search_query: {
                ...getCloudServiceListQuery(),
                fields: dynamicFieldsToExcelDataFields(props.cloudServiceListFields),
            },
        }) : undefined;

        const cloudServiceExcelExportParams: ExportParameter = {
            options: [
                // will be added more sheet query
            ],
        };
        if (cloudServiceListSheetQuery) cloudServiceExcelExportParams.options.push(cloudServiceListSheetQuery);
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
            },
        };
        const res = await SpaceConnector.client.addOns.pageSchema.get(params);
        state.detailSchema = filterForExcelSchema(res.details);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.isSubDataLoading = false;
    }
};


watch(() => props.visible, () => {
    if (props.cloudServiceId && !state.detailSchema.length) getSchema();
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
                           :data="state.detailSchema"
            >
                <p-checkbox-group direction="vertical">
                    <p-checkbox v-for="value in state.subDataList"
                                :key="value"
                                v-model="state.selectedSubData"
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
