<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { AlertDeleteParameters } from '@/schema/alert-manager/alert/api-verbs/delete';
import type { AlertModel } from '@/schema/alert-manager/alert/model';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useAlertDetailPageStore } from '@/services/alert-manager-v2/stores/alert-detail-page-store';

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

const { getProperRouteLocation } = useProperRouteLocation();

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.alert.delete<AlertDeleteParameters>({
            alert_id: storeState.alertInfo.alert_id,
        });
        await router.push(getProperRouteLocation({ name: ALERT_MANAGER_ROUTE_V2.ALERTS._NAME }));
    } finally {
        state.loading = false;
        handleClose();
    }
};
const handleClose = () => {
    state.proxyVisible = false;
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
