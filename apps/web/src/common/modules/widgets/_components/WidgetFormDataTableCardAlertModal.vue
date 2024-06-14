<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PButtonModal,
} from '@spaceone/design-system';

import type { DataTableAlertModalMode } from '@/common/modules/widgets/types/widget-data-table-type';

interface Props {
    visible: boolean;
    mode: DataTableAlertModalMode;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'cancel'): void;
}>();

const state = reactive({
    headerTitle: computed(() => {
        if (props.mode === 'DELETE') {
            return 'Delete Data';
        } if (props.mode === 'DELETE_UNABLED') {
            return 'Cannot Delete the Data';
        } if (props.mode === 'RESET') {
            return 'Are you sure you want to reset the data options?';
        }
        return '';
    }),
    description: computed(() => {
        if (props.mode === 'DELETE') {
            return 'Are you sure you want to delete this data?';
        } if (props.mode === 'DELETE_UNABLED') {
            return 'This data is currently in use by {data_name}. \nDelete {data_name} first before deleting this data.';
        } if (props.mode === 'RESET') {
            return 'Resetting the data options will revert all inputss to their most recent values. This action cannot be undone.';
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
