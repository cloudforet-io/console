<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, computed,
} from 'vue';

import { PButtonModal, PCheckboxGroup, PCheckbox } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';



const props = defineProps<{
    visible: boolean;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const state = reactive({
    isValid: false,
    loading: false,
    subDataList: ['Main Table', 'AWS EC2', 'Disk', 'NIC', 'Security Groups'] as string[], // TODO: dummy data
    selectedSubData: [] as string[],
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});

const handleConfirm = async () => {
    try {
        state.loading = true;
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
        state.loading = false;
    }
};
const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
};


</script>
<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('INVENTORY.CLOUD_SERVICE.EXCEL_EXPORT_MODAL.TITLE')"
                    :disabled="!state.isValid"
                    size="sm"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p class="mb-4">
                {{ i18n.t('INVENTORY.CLOUD_SERVICE.EXCEL_EXPORT_MODAL.DESCRIPTION') }}
            </p>
            <p-checkbox-group direction="vertical">
                <p-checkbox v-for="value in state.subDataList"
                            :key="value"
                            v-model="state.selectedSubData"
                            :value="value"
                >
                    {{ value }}
                </p-checkbox>
            </p-checkbox-group>
        </template>
        <template #confirm-button>
            {{ i18n.t('COMMON.BUTTONS.DOWNLOAD') }}
        </template>
    </p-button-modal>
</template>
