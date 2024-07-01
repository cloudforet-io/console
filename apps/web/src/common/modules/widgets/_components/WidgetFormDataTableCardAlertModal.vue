<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PButtonModal,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import type { DataTableAlertModalMode } from '@/common/modules/widgets/types/widget-data-table-type';

interface Props {
    visible: boolean;
    mode: DataTableAlertModalMode;
    referenceDataTableName?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'cancel'): void;
}>();

const state = reactive({
    headerTitle: computed(() => {
        if (props.mode === 'DELETE') {
            return i18n.t('COMMON.WIDGETS.DATA_TABLE.ALERT.DELETE_HEADER');
        } if (props.mode === 'DELETE_UNABLED') {
            return i18n.t('COMMON.WIDGETS.DATA_TABLE.ALERT.DELETE_UNABLED_HEADER');
        } if (props.mode === 'RESET') {
            return i18n.t('COMMON.WIDGETS.DATA_TABLE.ALERT.RESET_HEADER');
        }
        return '';
    }),
    description: computed(() => {
        if (props.mode === 'DELETE') {
            return i18n.t('COMMON.WIDGETS.DATA_TABLE.ALERT.DELETE_DESC');
        } if (props.mode === 'DELETE_UNABLED') {
            return i18n.t('COMMON.WIDGETS.DATA_TABLE.ALERT.DELETE_UNABLED_DESC', { data_name: props.referenceDataTableName });
        } if (props.mode === 'RESET') {
            return i18n.t('COMMON.WIDGETS.DATA_TABLE.ALERT.RESET_DESC');
        }
        return '';
    }),
});

const handleCancelModal = () => {
    emit('cancel');
};
const handleConfirmModal = () => {
    emit('confirm');
};

</script>

<template>
    <p-button-modal class="widget-form-data-table-card-alert-modal"
                    :visible="props.visible"
                    size="sm"
                    theme-color="alert"
                    :header-title="state.headerTitle"
                    :hide-footer-close-button="props.mode === 'DELETE_UNABLED'"
                    @confirm="handleConfirmModal"
                    @cancel="handleCancelModal"
                    @close="handleCancelModal"
    >
        <template #body>
            <p>{{ state.description }}</p>
        </template>
        <template v-if="props.mode === 'DELETE_UNABLED'"
                  #confirm-button
        >
            OK
        </template>
    </p-button-modal>
</template>
