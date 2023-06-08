<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('INVENTORY.COLLECTOR.DETAIL.EDIT_COLLECTOR_NAME')"
                    :disabled="!state.isAllValid"
                    size="sm"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <collector-name-form @update:isValid="handleUpdateIsValid" />
        </template>
    </p-button-modal>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorNameForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorNameForm.vue';
import type { CollectorModel } from '@/services/asset-inventory/collector/type';



const props = defineProps<{
    visible: boolean;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const state = reactive({
    isAllValid: false,
    loading: false,
});

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

// TODO: change to call api
const fetchUpdateCollectorName = async (): Promise<CollectorModel> => new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            ...collectorFormState.originCollector,
            name: collectorFormState.name,
        } as CollectorModel);
    }, 1000);
});

const handleUpdateIsValid = (value: boolean) => {
    state.isAllValid = value;
};
const handleConfirm = async () => {
    try {
        state.loading = true;
        const collector = await fetchUpdateCollectorName();
        collectorFormStore.setOriginCollector(collector);
        emits('update:visible', false);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_CHANGE_COLLECTOR_NAME'), '');
    } catch (e) {
        collectorFormStore.resetName();
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_CHANGE_COLLECTOR_NAME'));
    } finally {
        state.loading = false;
    }
};
const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
};


</script>
