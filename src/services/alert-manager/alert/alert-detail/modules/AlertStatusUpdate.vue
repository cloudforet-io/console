<template>
    <p-pane-layout class="alert-detail-status-update">
        <span class="content-title">{{ $t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.STATUS_UPDATE') }}</span>
        <p class="content-wrapper">
            <span v-if="alertPageState.alertData?.status_message"
                  class="description"
            >{{ alertPageState.alertData?.status_message }}</span>
            <p-empty v-else>
                {{ $t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.NO_UPDATE') }}
            </p-empty>
            <button class="new-button"
                    :class="{'disabled': manageDisabled}"
                    @click="openStatusUpdateModal"
            >
                {{ $t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.NEW_UPDATE') }}
            </button>
        </p>
        <p-button-modal
            :header-title="$t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.UPDATE_NEW_STATUS')"
            size="sm"
            :visible.sync="modalVisible"
            @confirm="onClickConfirm"
        >
            <template #body>
                <p-field-group :label="$t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.NEW_STATUS')"
                               required
                >
                    <template #default>
                        <p-textarea v-model="statusInput"
                                    class="block w-full"
                        />
                    </template>
                </p-field-group>
            </template>
        </p-button-modal>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import {
    PButtonModal, PPaneLayout, PTextarea, PFieldGroup, PEmpty,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useAlertPageStore } from '@/services/alert-manager/store/alert-page-store';


export default {
    name: 'AlertStatusUpdate',
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
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const alertPageStore = useAlertPageStore();
        const alertPageState = alertPageStore.$state;

        const state = reactive({
            modalVisible: false,
            statusInput: '',
            loading: true,
        });
        const openStatusUpdateModal = () => {
            state.modalVisible = true;
        };
        const updateStatus = async () => {
            const isEmptyInput = state.statusInput.trim().length === 0;
            try {
                state.loading = true;
                await alertPageStore.updateAlertData({
                    updateParams: {
                        status_message: state.statusInput,
                        reset_status_message: isEmptyInput,
                    },
                    alertId: props.id,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.ALT_S_UPDATE_STATUS'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.ALT_E_UPDATE_STATUS'));
            } finally {
                state.loading = false;
            }
        };

        const onClickConfirm = async () => {
            await updateStatus();
            state.modalVisible = false;
        };

        (() => {
            state.statusInput = alertPageState.alertData?.status_message ?? '';
        })();

        return {
            ...toRefs(state),
            alertPageState,
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
    @apply text-blue-700;
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
    &.disabled {
        @apply cursor-not-allowed text-gray-400;
    }
    &.disabled:active {
        pointer-events: none;
    }
}
</style>
