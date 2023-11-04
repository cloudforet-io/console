<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';

import {
    PButtonModal, PCheckboxGroup, PCheckbox, PDataLoader,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';



const props = defineProps<{
    visible: boolean;
    cloudServiceId?: string;
    isServerPage: boolean;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

interface CloudServiceDetailSchema {
    name: string;
    type: string;
    options: any;
}

const state = reactive({
    isValid: false,
    downloadLoading: false,
    isSubDataLoading: false,
    subDataList: computed(() => state.detailSchema.map((schema:CloudServiceDetailSchema) => schema.name)),
    selectedSubData: [] as string[],
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
    detailSchema: [] as CloudServiceDetailSchema[],
});

const handleConfirm = async () => {
    try {
        state.downloadLoading = true;
        // await downloadExcel({
        //     url: '/inventory/cloud-service/list',
        //     param: {
        //         query: getQuery(),
        //         ...(overviewState.period && {
        //             date_range: {
        //                 start: dayjs.utc(overviewState.period.start).format('YYYY-MM-DD'),
        //                 end: dayjs.utc(overviewState.period.end).add(1, 'day').format('YYYY-MM-DD'),
        //             },
        //         }),
        //     },
        //     fields: dynamicFieldsToExcelDataFields(tableState.schema.options.fields),
        //     file_name_prefix: FILE_NAME_PREFIX.cloudService,
        // });
        emits('update:visible', false);
        showSuccessMessage(i18n.t(''), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t(''));
    } finally {
        state.downloadLoading = false;
    }
};
const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
};

const getSchema = async () => {
    state.isSubDataLoading = true;
    try {
        const params: Record<string, any> = {
            schema: 'details',
            options: {
                cloud_service_id: props.cloudServiceId,
            },
        };
        if (props.isServerPage) {
            params.resource_type = 'inventory.Server';
        } else {
            params.resource_type = 'inventory.CloudService';
        }
        const res = await SpaceConnector.client.addOns.pageSchema.get(params);

        state.detailSchema = res.details;
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
