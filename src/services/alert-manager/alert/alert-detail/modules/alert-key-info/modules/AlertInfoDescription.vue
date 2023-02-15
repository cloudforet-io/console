<template>
    <p v-if="!isEditMode"
       class="content-wrapper"
    >
        <p-text-beautifier class="description"
                           :value="alertData.description"
        />&zwnj;
        <button class="edit-btn"
                :class="{'disabled': manageDisabled}"
                @click="startEdit(alertData.description)"
        >
            {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
        </button>
    </p>
    <div v-else
         class="content-wrapper"
    >
        <p-textarea v-model="dataForUpdate"
                    class="textarea"
        />
        <div class="button-group">
            <p-button style-type="secondary"
                      class="text-button"
                      size="sm"
                      @click="cancelEdit(alertData.description)"
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

<script lang="ts">
import { toRefs } from 'vue';

import { PTextarea, PButton, PTextBeautifier } from '@spaceone/design-system';

import { useAlertInfoItem } from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/composables';
import { EDIT_MODE } from '@/services/alert-manager/lib/config';

export default {
    name: 'AlertInfoDescription',
    components: {
        PTextarea,
        PButton,
        PTextBeautifier,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const {
            state: alertDetailItemState,
            cancelEdit,
            startEdit,
            updateAlert,
            onClickSave,
        } = useAlertInfoItem({
            alertId: props.id,
            isEditMode: false,
            dataForUpdate: props.alertData?.description,
        });
        return {
            EDIT_MODE,
            ...toRefs(alertDetailItemState),
            cancelEdit,
            startEdit,
            updateAlert,
            onClickSave,
        };
    },
};
</script>

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
