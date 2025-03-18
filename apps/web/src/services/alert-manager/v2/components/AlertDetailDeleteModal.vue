<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { AlertDeleteParameters } from '@/schema/alert-manager/alert/api-verbs/delete';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useAlertDetailPageStore } from '@/services/alert-manager/v2/stores/alert-detail-page-store';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;

const storeState = reactive({
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
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
            alert_id: storeState.alertInfo.alert_id,
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
