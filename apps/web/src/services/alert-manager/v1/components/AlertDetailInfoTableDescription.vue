<script setup lang="ts">
import {
    PTextarea, PButton, PTextBeautifier, PCollapsiblePanel,
} from '@cloudforet/mirinae';

import { useAlertInfoItem } from '@/services/alert-manager/v1/composables/alert-info';
import { EDIT_MODE } from '@/services/alert-manager/v1/constants/alert-constant';

const props = defineProps<{
    id?: string;
    alertData?: Record<string, any>;
    manageDisabled?: boolean;
}>();
const {
    state: alertDetailItemState,
    cancelEdit,
    startEdit,
    onClickSave,
} = useAlertInfoItem({
    alertId: props.id ?? '',
    isEditMode: false,
    dataForUpdate: props.alertData?.description,
});
</script>

<template>
    <p v-if="!alertDetailItemState.isEditMode"
       class="content-wrapper"
    >
        <p-collapsible-panel :line-clamp="10">
            <p-text-beautifier class="description"
                               :value="props.alertData.description"
            />&zwnj;
        </p-collapsible-panel>
        <p-button style-type="tertiary"
                  size="sm"
                  :disabled="props.manageDisabled"
                  @click="startEdit(props.alertData.description)"
        >
            {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
        </p-button>
    </p>
    <div v-else
         class="content-wrapper"
    >
        <p-textarea v-model="alertDetailItemState.dataForUpdate"
                    class="textarea"
        />
        <div class="button-group">
            <p-button style-type="secondary"
                      class="text-button mr-2"
                      size="sm"
                      @click="cancelEdit(props.alertData.description)"
            >
                {{ $t('MONITORING.ALERT.DETAIL.INFO.CANCEL') }}
            </p-button>
            <p-button
                style-type="primary"
                size="sm"
                class="text-button"
                @click="onClickSave(EDIT_MODE.DESCRIPTION)"
            >
                {{ $t('MONITORING.ALERT.DETAIL.INFO.SAVE_CHANGES') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
@import './styles/alertInfoItem.pcss';
.p-collapsible-panel {
    padding: 0;
    margin-right: 0.5rem;
    line-height: 1.5;
}
.description {
    white-space: pre-line;
}
.textarea {
    min-height: 15rem;
}
</style>
