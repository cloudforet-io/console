<template>
    <p v-if="!isEditMode" class="content-wrapper">
        <span class="description">{{ alertData.description }}&zwnj;</span>
        <button class="edit-btn" @click="startEdit(alertData.description)">
            {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
        </button>
    </p>
    <div v-else class="content-wrapper">
        <p-textarea v-model="dataForUpdate" class="textarea" />
        <div class="button-group">
            <p-button :outline="true" class="text-button"
                      size="sm" @click="cancelEdit(alertData.description)"
            >
                {{$t('MONITORING.ALERT.DETAIL.INFO.CANCEL')}}
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
import { PTextarea, PButton } from '@spaceone/design-system';
import { toRefs } from '@vue/composition-api';
import { useAlertInfoItem } from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-key-info/composables';
import { EDIT_MODE } from '@/services/monitoring/alert-manager/lib/config';

export default {
    name: 'AlertInfoDescription',
    components: {
        PTextarea,
        PButton,
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
    },
    setup(props, { emit }) {
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
</style>
