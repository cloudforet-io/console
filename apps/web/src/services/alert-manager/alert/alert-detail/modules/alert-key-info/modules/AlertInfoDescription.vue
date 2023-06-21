<script lang="ts" setup>
import { PTextarea, PButton, PTextBeautifier } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

import { useAlertInfoItem } from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/composables';
import { EDIT_MODE } from '@/services/alert-manager/lib/config';
import type { AlertDataModel } from '@/services/alert-manager/type';

interface Props {
    id: string;
    alertData: AlertDataModel;
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    alertData: () => ({}) as AlertDataModel,
    manageDisabled: false,
});
const { t } = useI18n();

const {
    state: alertDetailItemState,
    cancelEdit,
    startEdit,
    onClickSave,
} = useAlertInfoItem({
    alertId: props.id,
    isEditMode: false,
    dataForUpdate: props.alertData?.description,
});

</script>

<template>
    <p v-if="!alertDetailItemState.isEditMode"
       class="content-wrapper"
    >
        <p-text-beautifier class="description"
                           :value="alertData.description"
        />&zwnj;
        <button class="edit-btn"
                :class="{'disabled': manageDisabled}"
                @click="startEdit(alertData.description)"
        >
            {{ t('IDENTITY.USER.NOTIFICATION.EDIT') }}
        </button>
    </p>
    <div v-else
         class="content-wrapper"
    >
        <p-textarea v-model="alertDetailItemState.dataForUpdate"
                    class="textarea"
        />
        <div class="button-group">
            <p-button style-type="secondary"
                      class="text-button"
                      size="sm"
                      @click="cancelEdit(alertData.description)"
            >
                {{ t('MONITORING.ALERT.DETAIL.INFO.CANCEL') }}
            </p-button>
            <p-button
                style-type="primary"
                size="sm"
                class="text-button"
                @click="onClickSave(EDIT_MODE.DESCRIPTION)"
            >
                {{ t('MONITORING.ALERT.DETAIL.INFO.SAVE_CHANGES') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
@import '../styles/alertInfoItem.pcss';
.description {
    white-space: pre-wrap;
}
.textarea {
    min-height: 15rem;
}
.edit-btn {
    &.disabled {
        @apply cursor-not-allowed text-gray-400;
    }
    &.disabled:active {
        pointer-events: none;
    }
}
</style>
