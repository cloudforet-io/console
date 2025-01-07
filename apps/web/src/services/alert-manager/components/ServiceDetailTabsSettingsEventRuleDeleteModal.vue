<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButtonModal } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';

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
const handleConfirm = async () => {
    state.loading = true;
    try {
        await serviceDetailPageStore.deleteServiceDetailData();
        await router.push(getProperRouteLocation({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }));
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_DELETE_SERVICE'), '');
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
