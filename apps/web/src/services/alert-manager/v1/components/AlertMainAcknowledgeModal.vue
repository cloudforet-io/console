<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import { PButtonModal, PCheckbox } from '@cloudforet/mirinae';

import type { AlertModelV1 } from '@/schema/monitoring/alert/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertAssignUserStore } from '@/services/alert-manager/v1/stores/alert-assign-user-store';

const props = defineProps<{
    visible: boolean;
    alerts: AlertModelV1[];
}>();
const emit = defineEmits<{(event: 'update:visible', value: boolean): void;
    (event: 'confirm'): void;
}>();

const alertAssignUserStore = useAlertAssignUserStore();
const alertAssignUserState = alertAssignUserStore.state;
const userStore = useUserStore();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    isAssignedToMe: false,
});

/* api */
const updateToAcknowledge = async () => {
    const promises = props.alerts?.map((d) => alertAssignUserStore.updateToAcknowledgeAndAssignUser(d.alert_id, state.isAssignedToMe ? userStore.state.userId : undefined));
    const results = await Promise.allSettled(promises);
    const rejected = results.filter((d) => d.status === 'rejected');
    if (rejected.length > 0) {
        throw new Error(`Error occurred during updating state to acknowledge or assignee for ${rejected.map((d) => (d as any).reason.message).join(', ')}`);
    }
};


const onClickConfirm = async () => {
    try {
        await updateToAcknowledge();
        emit('confirm');
        showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '');
    } catch (e) {
        showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'), e);
    } finally {
        state.proxyVisible = false;
    }
};

/* initiators */
const reset = async () => {
    state.isAssignedToMe = false;
    await alertAssignUserStore.getUserList();
};

watch(() => props.visible, async (visible) => {
    if (visible) await reset();
});
</script>

<template>
    <p-button-modal
        class="alert-acknowledge-update-modal"
        fade
        size="sm"
        :header-title="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.TITLE', {count: props.alerts.length})"
        :visible.sync="state.proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="body-inner">
                <p>{{ $t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_YOU') }}</p>
                <p-checkbox v-model="state.isAssignedToMe"
                            :disabled="alertAssignUserState.loading || !alertAssignUserState.userIds.includes(userStore.state.userId)"
                >
                    <span> {{ $t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_ME_YES') }}</span>
                </p-checkbox>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.body-inner {
    padding: 2rem 0 2.75rem;
    p {
        padding-bottom: 0.75rem;
    }
}
</style>
