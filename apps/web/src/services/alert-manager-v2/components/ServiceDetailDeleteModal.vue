<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButtonModal } from '@cloudforet/mirinae';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
});

const handleConfirm = () => {
    state.loading = true;
    try {
        serviceDetailPageStore.deleteServiceDetailData();
        router.push(getProperRouteLocation({ name: ALERT_MANAGER_ROUTE_V2.SERVICE._NAME }));
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
    <p-button-modal class="service-detail-delete-modal"
                    :header-title="$t('ALERT_MANAGER.SERVICE.MODAL_DELETE_TITLE')"
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
