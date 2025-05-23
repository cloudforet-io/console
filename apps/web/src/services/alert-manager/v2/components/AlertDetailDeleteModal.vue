<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { AlertDeleteParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/delete';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';

interface Props {
    visible: boolean;
    alertId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    alertId: '',
});

const router = useRouter();
const route = useRoute();

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
});

const handleClose = () => {
    state.proxyVisible = false;
};

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.alert.delete<AlertDeleteParameters>({
            alert_id: props.alertId,
        });
        const serviceId = route.params?.serviceId;
        if (serviceId) {
            await router.go(-1);
        } else {
            await router.push({ name: ALERT_MANAGER_ROUTE.ALERTS._NAME }).catch(() => {});
        }
        showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_DELETE'), '');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
        handleClose();
    }
};
</script>

<template>
    <p-button-modal class="alert-detail-delete-modal"
                    :header-title="$t('ALERT_MANAGER.ALERTS.MODAL_DELETE_ALERT')"
                    size="sm"
                    theme-color="alert"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    />
</template>
