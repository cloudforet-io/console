<template>
    <p-pane-layout class="alert-detail-status-update">
        <span class="content-title">{{ $t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.STATUS_UPDATE') }}</span>
        <p class="content-wrapper">
            <span v-if="status" class="description">{{ status }}</span>
            <p-empty v-else>
                {{ $t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.NO_UPDATE') }}
            </p-empty>
            <button class="new-button" @click="openStatusUpdateModal">
                {{ $t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.NEW_UPDATE') }}
            </button>
        </p>
        <p-button-modal
            :header-title="$t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.NEW_UPDATE')"
            size="sm"
            :visible.sync="modalVisible"
            :disabled="statusInput.trim().length === 0"
            @confirm="onClickConfirm"
        >
            <template #body>
                <p-field-group :label="$t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.NEW_UPDATE')"
                               required
                >
                    <template #default>
                        <p-textarea v-model="statusInput" class="block w-full" />
                    </template>
                </p-field-group>
            </template>
        </p-button-modal>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PButtonModal, PPaneLayout, PTextarea, PFieldGroup, PEmpty,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { store } from '@/store';

export default {
    name: 'AlertDetailInfoStatusUpdate',
    components: {
        PPaneLayout,
        PButtonModal,
        PTextarea,
        PFieldGroup,
        PEmpty,
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
    setup(props, { emit, root }) {
        const state = reactive({
            modalVisible: false,
            status: computed(() => store.state.service.alert.alertData?.status_message),
            statusInput: '',
            loading: true,
        });
        const openStatusUpdateModal = () => {
            state.modalVisible = true;
        };
        const updateStatus = async () => {
            try {
                state.loading = true;
                await store.dispatch('service/alert/updateAlertData', {
                    updateParams: {
                        status_message: state.statusInput,
                    },
                    alertId: props.id,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.ALT_S_UPDATE_STATUS'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.ALT_E_UPDATE_STATUS'), e, root);
            } finally {
                state.loading = false;
            }
        };

        const onClickConfirm = async () => {
            await updateStatus();
            state.modalVisible = false;
        };

        (() => {
            state.statusInput = store.state.service.alert.alertData?.status_message;
        })();

        return {
            ...toRefs(state),
            openStatusUpdateModal,
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-detail-status-update {
    padding: 0.5rem 1rem 0;
    display: inline-flex;
}
.content-wrapper {
    display: inherit;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    vertical-align: middle;
    min-height: 4.75rem;
    font-size: 0.875rem;
    line-height: 140%;
}
.content-title {
    @apply font-bold;
    min-width: 10rem;
    font-size: 0.875rem;
    line-height: 140%;
}
.new-button {
    @apply text-blue-600;
    line-height: 160%;
    min-width: 2.875rem;
    flex-shrink: 0;
    font-size: 0.875rem;
    .new-icon {
        margin-right: 0.25rem;
    }
    &:hover, &:active {
        @apply cursor-pointer;
    }
}
</style>
